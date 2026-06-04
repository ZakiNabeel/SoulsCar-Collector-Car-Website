import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PartsClient } from "./_client";
import { getParts, getCars, getContent } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parts — SoulCars.pk",
  description: "Classic and vintage car parts for restoration projects in Pakistan.",
};

export default async function PartsPage() {
  const [parts, cars, content] = await Promise.all([getParts(), getCars(), getContent()]);
  const c = content["parts"] ?? {};
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <PartsClient parts={parts} suggestedCars={cars} content={c} />
      <SiteFooter />
    </div>
  );
}
