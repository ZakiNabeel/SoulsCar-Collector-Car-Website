import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CarsClient } from "./_client";

export const metadata: Metadata = {
  title: "Cars — SoulCars.pk",
  description: "Browse collector and vintage cars for sale across Pakistan.",
};

export default function CarsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <CarsClient />
      <SiteFooter />
    </div>
  );
}
