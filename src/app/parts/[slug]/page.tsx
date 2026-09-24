import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPartBySlug } from "@/lib/sheets";
import { PartDetail } from "./_client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const part = await getPartBySlug((await params).slug);
  if (!part) return {};
  return {
    title: `${part.name} — SoulCars.pk`,
    description:
      part.description ||
      `${part.name}${part.fits ? ` for ${part.fits}` : ""}. Enquire on SoulCars.pk.`,
    openGraph: { images: part.image ? [part.image] : [] },
  };
}

export default async function PartPage({ params }: Props) {
  const part = await getPartBySlug((await params).slug);
  if (!part) notFound();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <PartDetail key={part.slug} part={part} />
      <SiteFooter />
    </div>
  );
}
