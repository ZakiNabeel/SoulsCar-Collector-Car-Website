import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SellClient } from "./_client";
import { getContent } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sell Your Car — SoulCars.pk",
  description: "List your collector or vintage car on SoulCars.pk.",
};

export default async function SellPage() {
  const content = await getContent();
  const c = content["sell"] ?? {};
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <SellClient content={c} />
      <SiteFooter />
    </div>
  );
}
