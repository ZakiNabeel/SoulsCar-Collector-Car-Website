import type { Part } from "./cars-data";
import { parsePriceString } from "./currency";

// Keep A–G compatible with the original sheet. H and I are optional additions.
export function parsePartsRows(rows: string[][]): Part[] {
  const seen = new Set<string>();
  return rows
    .filter((row) => row[1]?.trim())
    .map((row) => {
      const name = row[1].trim();
      const slugify = (value: string) =>
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      const base = slugify(row[0]?.trim() || name) || slugify(name) || "part";
      let slug = base;
      let suffix = 2;
      while (seen.has(slug)) slug = `${base}-${suffix++}`;
      seen.add(slug);
      const condition = row[3]?.trim().toLowerCase();
      return {
        slug,
        name,
        fits: row[2]?.trim() || "",
        condition: condition === "new" ? "New" : condition === "restored" ? "Restored" : "Used",
        price: parsePriceString(row[4]?.trim() || "Price on request"),
        priceDisplay: row[4]?.trim() || "Price on request",
        image: row[5]?.trim() || "",
        imagesFolder: (row[6] || "")
          .trim()
          .replace(/^"(.*)"$/, "$1")
          .trim(),
        description: row[7]?.trim() || "",
        location: row[8]?.trim() || "",
      };
    });
}

export type PartFilters = { query: string; condition: string; price: string };

export function filterParts(parts: Part[], { query, condition, price }: PartFilters): Part[] {
  const search = query.trim().toLowerCase();
  return parts.filter((part) => {
    if (condition !== "All" && part.condition !== condition) return false;
    if (
      search &&
      ![part.name, part.fits, part.description, part.location]
        .join(" ")
        .toLowerCase()
        .includes(search)
    )
      return false;
    if (price !== "All") {
      // A labelled price (e.g. Sold or Price on request) is not a numeric offer.
      if (part.price.label) return false;
      const amount = part.price.amount;
      if (price === "Under 50k" && amount >= 50000) return false;
      if (price === "50k–100k" && (amount < 50000 || amount >= 100000)) return false;
      if (price === "100k+" && amount < 100000) return false;
    }
    return true;
  });
}
