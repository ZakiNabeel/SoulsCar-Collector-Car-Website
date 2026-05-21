import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Pill } from "@/components/ui-bits";
import { parts } from "@/lib/cars-data";

export const Route = createFileRoute("/parts")({
  head: () => ({
    meta: [
      { title: "Parts — SoulCars.pk" },
      { name: "description", content: "Classic and vintage car parts for restoration projects in Pakistan." },
    ],
  }),
  component: PartsPage,
});

const PART_FILTERS = {
  Fits: ["All", "Porsche", "Toyota", "BMW", "Jaguar", "Mercedes", "Universal"],
  Type: ["All", "Body", "Interior", "Lighting", "Wheels"],
  Condition: ["All", "New", "Used", "Restored"],
  Price: ["All", "Under 50k", "50k–100k", "100k+"],
} as const;

function PartsPage() {
  const [active, setActive] = useState<Record<string, string>>({
    Fits: "All", Type: "All", Condition: "All", Price: "All",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 pt-16 pb-10">
        <div className="eyebrow">Marketplace</div>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Classic parts</h1>
        <p className="mt-3 text-muted-foreground">Restored, NOS and quality used components.</p>
      </section>

      <div className="border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 flex gap-3 overflow-x-auto">
          {Object.entries(PART_FILTERS).map(([group, opts]) => (
            <div key={group} className="flex gap-2 items-center">
              <span className="eyebrow shrink-0">{group}</span>
              {opts.map((opt) => (
                <Pill
                  key={opt}
                  active={active[group] === opt}
                  onClick={() => setActive((p) => ({ ...p, [group]: opt }))}
                >
                  {opt}
                </Pill>
              ))}
              <span className="w-4" />
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 py-16 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {parts.map((p) => (
            <a key={p.slug} href="#" className="group block">
              <div className="aspect-[16/10] overflow-hidden bg-secondary">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-xl">{p.name}</h3>
                  <span className="text-sm whitespace-nowrap">{p.price}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Fits {p.fits}</span>
                  <span className="border border-border px-2 py-0.5 text-xs tracking-wider uppercase text-foreground">
                    {p.condition}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
