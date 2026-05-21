import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PartsClient } from "./_client";

export const metadata: Metadata = {
  title: "Parts — SoulCars.pk",
  description: "Classic and vintage car parts for restoration projects in Pakistan.",
};

export default function PartsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <PartsClient />
      <SiteFooter />
    </div>
  );
}
