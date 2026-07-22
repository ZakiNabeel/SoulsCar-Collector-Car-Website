import type { Price } from "@/lib/currency";

export type Car = {
  slug: string;
  name: string;
  year: number;
  make: string;
  model: string;
  spec: string;
  price: Price;
  priceDisplay: string;
  image: string;
  images?: string[]; // resolved Cloudinary image URLs for the gallery
  imagesFolder?: string; // Cloudinary folder name from col Q in the sheet
  mileage: string;
  engine: string;
  transmission: string;
  color: string;
  condition: string;
  location: string;
  description: string;
  seller: "Verified" | "Private";
  featured?: boolean;
  pinned?: boolean;
  category: "Collector" | "Daily Driver";
};

export type Part = {
  slug: string;
  name: string;
  fits: string;
  condition: "New" | "Used" | "Restored";
  price: Price;
  priceDisplay: string;
  image: string;
  images?: string[]; // resolved Cloudinary image URLs for a gallery
  imagesFolder?: string; // Cloudinary folder name from col G in the Parts sheet
};
