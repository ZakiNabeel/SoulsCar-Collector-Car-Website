import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CarsClient } from "./_client";
import { getCars, getContent } from "@/lib/sheets";

export const metadata: Metadata = {
  title: "Cars — SoulCars.pk",
  description: "Browse collector and vintage cars for sale across Pakistan.",
};

export default async function CarsPage() {
  const [cars, content] = await Promise.all([getCars(), getContent()]);
  const c = content["cars"] ?? {};
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <CarsClient cars={cars} content={c} />
      <SiteFooter />
    </div>
  );
}
