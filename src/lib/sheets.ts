import type { Car, Part } from "./cars-data";
import { parsePriceString } from "./currency";

// ─── Content type ────────────────────────────────────────────────────────────
export type SiteContent = Record<string, Record<string, string>>;

async function fetchSheet(range: string): Promise<string[][]> {
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
  if (!API_KEY || !SHEET_ID || SHEET_ID === "your_sheet_id_here") return [];
  // Encode the range — tab names with spaces (e.g. 'Terms and Conditions')
  // are invalid in a URL otherwise.
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;
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

// Sheet cells sometimes have the folder name typed with surrounding quotes
// (e.g. `"C63 AMG"`); strip those so the literal quotes aren't sent to Cloudinary.
function cleanFolderName(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .trim();
}

// All car/part images live under this parent folder in Cloudinary. The sheet
// only stores the subfolder name (e.g. "C63 AMG"), so we prepend this prefix
// to build the full asset_folder path the Search API expects.
const CLOUDINARY_PARENT_FOLDER =
  process.env.CLOUDINARY_PARENT_FOLDER?.trim() || "Website Inventory";

function fullFolderPath(folder: string): string {
  return `${CLOUDINARY_PARENT_FOLDER}/${folder}`;
}

// Extracts the bare filename (no folder, no extension) from a Cloudinary
// public_id, e.g. "Website Inventory/C63 AMG/1" → "1".
function fileNameFromPublicId(publicId: string | undefined): string {
  if (!publicId) return "";
  const last = publicId.split("/").pop() ?? "";
  return last.replace(/\.[^.]+$/, "");
}

// Each Cloudinary folder is expected to contain a cover image — named "1" by
// convention, though some folders use "Thumbnail" instead. This orders
// resources so the cover comes first, falling back to created_at order
// (already applied by the API) for the rest.
//
// On accounts using "dynamic folders", the public_id is a random string
// (e.g. "DSC_1367_kupb6f") and the original filename lives in `display_name`,
// so we check that first and fall back to the public_id filename for
// fixed-folder accounts where the name is the last public_id segment.
const COVER_NAMES = ["1", "thumbnail"];

function isCover<T extends { public_id?: string; display_name?: string }>(r: T): boolean {
  const name = (r.display_name || fileNameFromPublicId(r.public_id)).trim().toLowerCase();
  return COVER_NAMES.includes(name);
}

function sortCoverFirst<T extends { public_id?: string; display_name?: string }>(
  resources: T[],
): T[] {
  return [...resources].sort((a, b) => (isCover(a) ? 0 : 1) - (isCover(b) ? 0 : 1));
}

const CLOUDINARY_THUMB_TRANSFORM = "/upload/q_auto,f_auto,w_800,c_limit/";
const CLOUDINARY_GALLERY_TRANSFORM = "/upload/q_auto,f_auto,w_1600,c_limit/";

// ─── Cloudinary folder → image URL list ──────────────────────────────────────
// Uses the Cloudinary Admin API (search endpoint) with API Key + Secret.
// Returns all image URLs inside a given folder, sorted by created_at.
// Falls back to [] if credentials are missing or the folder is empty.
async function getCloudinaryImages(folder: string): Promise<string[]> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret || !folder.trim()) return [];

  const folderName = fullFolderPath(folder.trim()).replace(/"/g, '\\"');
  const expression = `folder="${folderName}"`;
  console.log("Cloudinary gallery lookup", {
    folder: folder.trim(),
    cloudName,
    hasApiKey: Boolean(apiKey),
    hasApiSecret: Boolean(apiSecret),
    expression,
  });

  // Cloudinary Search API — finds all images in a folder
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
        // Fetch the whole folder (Cloudinary caps a page at 500). The detail
        // gallery shows every image anyway, and a smaller window could exclude
        // the cover named "1" when it wasn't uploaded among the first items.
        max_results: 500,
        fields: ["secure_url", "public_id", "display_name"],
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Cloudinary gallery lookup failed", {
        folder: folder.trim(),
        status: res.status,
        body,
      });
      if (res.status === 401 || res.status === 403) {
        return [];
      }
      return [];
    }

    const json = await res.json();
    console.log("Cloudinary gallery lookup result", {
      folder: folder.trim(),
      count: json.resources?.length ?? 0,
    });
    // Put the image named "1" first (cover), then inject Cloudinary
    // transformations: auto quality, auto format, max width 1600px.
    const resources = sortCoverFirst(
      (json.resources ?? []) as { secure_url: string; public_id?: string; display_name?: string }[],
    );
    return resources.map((r) => r.secure_url.replace("/upload/", CLOUDINARY_GALLERY_TRANSFORM));
  } catch (err) {
    console.error("Cloudinary fetch failed:", err);
    return [];
  }
}

// Returns only the FIRST image URL in a folder (sorted by created_at).
// Used for browse-page thumbnails so we don't fetch full galleries per row.
async function getCloudinaryThumbnail(folder: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret || !folder.trim()) return "";

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;
  const folderName = fullFolderPath(folder.trim()).replace(/"/g, '\\"');
  const expression = `folder="${folderName}"`;

  console.log("Cloudinary thumbnail lookup", {
    folder: folder.trim(),
    cloudName,
    hasApiKey: Boolean(apiKey),
    hasApiSecret: Boolean(apiSecret),
    expression,
  });

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
        // Fetch the whole folder (Cloudinary caps a page at 500) so the cover
        // named "1" is always in the result set — it isn't necessarily among
        // the first-uploaded images, so a small window can miss it entirely.
        max_results: 500,
        fields: ["secure_url", "public_id", "display_name"],
      }),
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Cloudinary thumbnail lookup failed", {
        folder: folder.trim(),
        status: res.status,
        body,
      });
      if (res.status === 401 || res.status === 403) {
        return "";
      }
      return "";
    }
    const json = await res.json();
    console.log("Cloudinary thumbnail lookup result", {
      folder: folder.trim(),
      count: json.resources?.length ?? 0,
    });
    // Prefer the image named "1" as the cover; otherwise the first uploaded.
    const resources = sortCoverFirst(
      (json.resources ?? []) as { secure_url: string; public_id?: string; display_name?: string }[],
    );
    const first = resources[0]?.secure_url as string | undefined;
    // Smaller transformation — these are grid thumbnails, not full-size.
    return first ? first.replace("/upload/", CLOUDINARY_THUMB_TRANSFORM) : "";
  } catch (err) {
    console.error("Cloudinary thumbnail fetch failed:", err);
    return "";
  }
}

// Resolves Cloudinary thumbnails for a list of items, in parallel, deduping
// folder lookups so multiple rows sharing a folder only hit the API once.
async function resolveThumbnails<T extends { image: string; imagesFolder?: string }>(
  items: T[],
): Promise<T[]> {
  const folders = Array.from(
    new Set(items.map((i) => i.imagesFolder?.trim()).filter((f): f is string => !!f)),
  );
  const entries = await Promise.all(
    folders.map(async (f) => [f, await getCloudinaryThumbnail(f)] as const),
  );
  const thumbByFolder = new Map(entries);

  return items.map((item) => {
    const folder = item.imagesFolder?.trim();
    const cloudThumb = folder ? thumbByFolder.get(folder) : "";
    // Cloudinary first; fall back to the column-H Drive/URL link.
    return { ...item, image: cloudThumb || item.image };
  });
}

// ─── Hero slideshow images ───────────────────────────────────────────────────
// Background-removed car images the client drops into a dedicated subfolder of
// the Cloudinary parent (default "Hero"). The homepage hero crossfades through
// them automatically; reordering/adding/removing in Cloudinary updates the site
// on its own (within the 5-min Cloudinary cache window above). Falls back to []
// when credentials are missing or the folder is empty — the hero then shows its
// static fallback image instead.
const CLOUDINARY_HERO_FOLDER = process.env.CLOUDINARY_HERO_FOLDER?.trim() || "Hero";

export async function getHeroImages(): Promise<string[]> {
  return getCloudinaryImages(CLOUDINARY_HERO_FOLDER);
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
    .filter((r) => r[1]?.trim())
    .map((r) => {
      const name = r[1] ?? "";
      const year = r[2] ?? "";
      const slug = toSlug(r[0] || (year ? `${name}-${year}` : name));
      if (seen.has(slug)) return null;
      seen.add(slug);
      return {
        slug,
        name,
        year: Number(year) || 0,
        make: r[3] ?? "",
        model: r[4] ?? "",
        spec: r[5] ?? "",
        price: parsePriceString(r[6] ?? ""),
        priceDisplay: r[6] ?? "",
        image: r[7] ?? "",
        images: undefined as string[] | undefined,
        imagesFolder: cleanFolderName(r[16]), // col Q — Cloudinary folder
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

  // Browse cards: prefer the first Cloudinary image, fall back to col H.
  return resolveThumbnails(cars);
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
// Sheet columns A–G:
// A slug | B name | C fits | D condition | E price | F image
// G images_folder (Cloudinary folder name)
export async function getParts(): Promise<Part[]> {
  const rows = await fetchSheet("Parts!A2:G");
  const parts = rows
    .filter((r) => r[1]?.trim())
    .map((r) => ({
      slug: toSlug(r[0] || r[1] || ""),
      name: r[1] ?? "",
      fits: r[2] ?? "",
      condition: (r[3] as Part["condition"]) ?? "Used",
      price: parsePriceString(r[4] ?? ""),
      priceDisplay: r[4] ?? "",
      image: r[5] ?? "",
      images: undefined as string[] | undefined,
      imagesFolder: cleanFolderName(r[6]), // col G — Cloudinary folder
    }));

  // Browse cards: prefer the first Cloudinary image, fall back to col F.
  return resolveThumbnails(parts);
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
