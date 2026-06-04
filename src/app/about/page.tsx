import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LinkButton } from "@/components/ui-bits";
import { getContent } from "@/lib/sheets";

export const metadata: Metadata = {
  title: "About — SoulCars.pk",
  description: "SoulCars.pk is a curated marketplace for collector cars in Pakistan.",
};

export default async function AboutPage() {
  const content = await getContent();
  const c = content["about"] ?? {};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <section className="mx-auto max-w-3xl w-full px-6 lg:px-10 pt-20 pb-24 flex-1">
        <div className="eyebrow">{c.eyebrow ?? "About"}</div>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">
          {c.heading ?? "A quieter place to find the car you were meant to drive."}
        </h1>
        <div className="mt-10 space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            {c.para1 ??
              "SoulCars.pk was founded by collectors, for collectors. We believe Pakistan's community of enthusiasts deserves a calm, well-presented marketplace — one that honors the cars and respects the people buying and selling them."}
          </p>
          <p>
            {c.para2 ??
              "Every listing is reviewed for accuracy. Sellers are verified where possible. Buyers receive direct, no-noise introductions. There are no spam pop-ups, no inflated ad placements, no dealer roulette."}
          </p>
          <p>{c.para3 ?? "Just cars worth keeping, presented properly."}</p>
        </div>
        <div className="mt-12">
          <LinkButton to="/cars">{c.cta ?? "Browse cars"}</LinkButton>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
