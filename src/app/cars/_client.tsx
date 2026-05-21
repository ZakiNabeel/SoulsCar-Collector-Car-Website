"use client";

import { useState } from "react";
import { CarCard } from "@/components/car-card";
import { Pill } from "@/components/ui-bits";
import { cars } from "@/lib/cars-data";

const FILTERS = {
  Make: ["All", "Porsche", "Mercedes-Benz", "Toyota", "BMW", "Jaguar", "Datsun"],
  Body: ["All", "Coupe", "Convertible", "SUV", "Sedan"],
  Price: ["All", "Under 1.5 Cr", "1.5–3 Cr", "3 Cr+"],
  Year: ["All", "Pre-1970", "1970–1980", "1980+"],
  Condition: ["All", "Concours", "Excellent", "Restored"],
} as const;

export function CarsClient() {
  const [active, setActive] = useState<Record<string, string>>({
    Make: "All",
    Body: "All",
    Price: "All",
    Year: "All",
    Condition: "All",
  });

  const filtered = cars.filter((c) => active.Make === "All" || c.make === active.Make);

  return (
    <>
      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 pt-16 pb-10">
        <div className="eyebrow">Marketplace</div>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">All cars</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          {filtered.length} {filtered.length === 1 ? "listing" : "listings"} available
        </p>
      </section>

      <div className="border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 flex gap-3 overflow-x-auto">
          {Object.entries(FILTERS).map(([group, opts]) => (
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
          {filtered.map((car) => (
            <CarCard key={car.slug} car={car} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-20">No cars match these filters.</p>
        )}
      </section>
    </>
  );
}
