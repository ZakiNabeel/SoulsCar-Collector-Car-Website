import type { Car, Part } from "./cars-data";

// ─── Content type ────────────────────────────────────────────────────────────
export type SiteContent = Record<string, Record<string, string>>;

async function fetchSheet(range: string): Promise<string[][]> {
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
  if (!API_KEY || !SHEET_ID || SHEET_ID === "your_sheet_id_here") return [];
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error(`Sheets API error: ${res.status}`, JSON.stringify(body, null, 2));
      return [];
    }
    const json = await res.json();
    return json.values ?? [];
  } catch (err) {
    console.error("Failed to fetch sheet:", err);
    return [];
  }
}

// ─── Cloudinary folder → image URL list ──────────────────────────────────────
// Uses the Cloudinary Admin API (search endpoint) with API Key + Secret.
// Returns all image URLs inside a given folder, sorted by created_at.
// Falls back to [] if credentials are missing or the folder is empty.
async function getCloudinaryImages(folder: string): Promise<string[]> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret || !folder.trim()) return [];

  // Cloudinary Search API — finds all images in a folder
  const expression = `folder=${folder.trim()}`;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64"),
      },
      body: JSON.stringify({
        expression,
        sort_by: [{ created_at: "asc" }],
        max_results: 30,
        fields: ["secure_url"],
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("Cloudinary API error:", res.status, await res.text());
      return [];
    }

    const json = await res.json();
    // Inject Cloudinary transformations: auto quality, auto format, max width 1600px
    return (json.resources ?? []).map((r: { secure_url: string }) =>
      r.secure_url.replace("/upload/", "/upload/q_auto,f_auto,w_1600,c_limit/"),
    );
  } catch (err) {
    console.error("Cloudinary fetch failed:", err);
    return [];
  }
}

// ─── Cars ────────────────────────────────────────────────────────────────────
// Sheet columns A–Q:
// A slug | B name | C year | D make | E model | F spec | G price | H image
// I mileage | J engine | K transmission | L color | M condition | N location
// O description | P seller | Q images_folder (Cloudinary folder name)
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getCars(): Promise<Car[]> {
  const rows = await fetchSheet("Cars!A2:Q");
  const seen = new Set<string>();

  const cars = rows
    .filter((r) => r[0] || r[1])
    .map((r) => {
      const name = r[1] ?? "";
      const year = r[2] ?? "";
      const slug = r[0] || (year ? toSlug(`${name}-${year}`) : toSlug(name));
      if (seen.has(slug)) return null;
      seen.add(slug);
      return {
        slug,
        name,
        year: Number(year) || 0,
        make: r[3] ?? "",
        model: r[4] ?? "",
        spec: r[5] ?? "",
        price: r[6] ?? "",
        image: r[7] ?? "",
        images: undefined as string[] | undefined,
        imagesFolder: r[16]?.trim() ?? "", // col Q — Cloudinary folder
        mileage: r[8] ?? "",
        engine: r[9] ?? "",
        transmission: r[10] ?? "",
        color: r[11] ?? "",
        condition: r[12] ?? "",
        location: r[13] ?? "",
        description: r[14] ?? "",
        seller: (r[15] as Car["seller"]) ?? "Private",
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return cars;
}

// For the detail page we also resolve Cloudinary images for that one car.
export async function getCarBySlug(slug: string): Promise<Car | undefined> {
  const cars = await getCars();
  const car = cars.find((c) => c.slug === slug);
  if (!car) return undefined;

  // Fetch Cloudinary images only for this car (avoids fetching for every car)
  if (car.imagesFolder) {
    const cloudImages = await getCloudinaryImages(car.imagesFolder);
    if (cloudImages.length > 0) {
      car.images = cloudImages;
    }
  }

  return car;
}

// ─── Parts ───────────────────────────────────────────────────────────────────
// slug | name | fits | condition | price | image
export async function getParts(): Promise<Part[]> {
  const rows = await fetchSheet("Parts!A2:F");
  return rows
    .filter((r) => r[0])
    .map((r) => ({
      slug: r[0] ?? "",
      name: r[1] ?? "",
      fits: r[2] ?? "",
      condition: (r[3] as Part["condition"]) ?? "Used",
      price: r[4] ?? "",
      image: r[5] ?? "",
    }));
}

// ─── Content ─────────────────────────────────────────────────────────────────
// Row 1  → headers: field_key | home | cars | parts | sell | about
// Row 2+ → one row per text field, value per page column
// Empty cells fall back to the hardcoded defaults in each page component.
export async function getContent(): Promise<SiteContent> {
  const rows = await fetchSheet("Content!A1:F50");
  if (rows.length < 2) return {};

  const headers = rows[0];
  const pages = headers.slice(1);

  const content: SiteContent = {};
  for (const page of pages) content[page] = {};

  for (const row of rows.slice(1)) {
    const key = row[0];
    if (!key) continue;
    pages.forEach((page, colIdx) => {
      const val = row[colIdx + 1];
      if (val) content[page][key] = val;
    });
  }

  return content;
}
