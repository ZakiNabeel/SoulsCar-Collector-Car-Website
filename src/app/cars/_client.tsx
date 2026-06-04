"use client";

import { useState, useMemo } from "react";
import { CarCard } from "@/components/car-card";
import { Pill } from "@/components/ui-bits";
import type { Car } from "@/lib/cars-data";

export function CarsClient({ cars, content = {} }: { cars: Car[]; content?: Record<string, string> }) {
  const c = content;
  const makes = useMemo(
    () => ["All", ...Array.from(new Set(cars.map((c) => c.make))).sort()],
    [cars],
  );
  const conditions = useMemo(
    () => ["All", ...Array.from(new Set(cars.map((c) => c.condition))).sort()],
    [cars],
  );

  const FILTERS = {
    Make: makes,
    Price: ["All", "Under 1.5 Cr", "1.5–3 Cr", "3 Cr+"],
    Year: ["All", "Pre-1970", "1970–1980", "1980+"],
    Condition: conditions,
  };

  const [active, setActive] = useState<Record<string, string>>({
    Make: "All",
    Price: "All",
    Year: "All",
    Condition: "All",
  });

  const priceValue = (price: string) => {
    const n = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (price.includes("Cr")) return n * 10000000;
    if (price.includes("L") || price.includes("Lac")) return n * 100000;
    return n;
  };

  const filtered = cars.filter((c) => {
    if (active.Make !== "All" && c.make !== active.Make) return false;
    if (active.Condition !== "All" && c.condition !== active.Condition) return false;
    if (active.Year !== "All") {
      if (active.Year === "Pre-1970" && c.year >= 1970) return false;
      if (active.Year === "1970–1980" && (c.year < 1970 || c.year > 1980)) return false;
      if (active.Year === "1980+" && c.year < 1980) return false;
    }
    if (active.Price !== "All") {
      const p = priceValue(c.price);
      if (active.Price === "Under 1.5 Cr" && p >= 15000000) return false;
      if (active.Price === "1.5–3 Cr" && (p < 15000000 || p > 30000000)) return false;
      if (active.Price === "3 Cr+" && p < 30000000) return false;
    }
    return true;
  });

  return (
    <>
      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 pt-16 pb-10">
        <div className="eyebrow">{c.eyebrow ?? "Marketplace"}</div>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">{c.heading ?? "All cars"}</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          {c.subtitle
            ? c.subtitle
            : `${filtered.length} ${filtered.length === 1 ? "listing" : "listings"} available`}
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
