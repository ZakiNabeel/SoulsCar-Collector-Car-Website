import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SellClient } from "./_client";

export const metadata: Metadata = {
  title: "Sell Your Car — SoulCars.pk",
  description: "List your collector or vintage car on SoulCars.pk.",
};

export default function SellPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <SellClient />
      <SiteFooter />
    </div>
  );
}
