"use client";

import { useState, useMemo } from "react";
import { CarCard } from "@/components/car-card";
import { Pill } from "@/components/ui-bits";
import type { Car } from "@/lib/cars-data";

export function CarsClient({
  cars,
  content = {},
}: {
  cars: Car[];
  content?: Record<string, string>;
}) {
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
    Category: "All",
    Make: "All",
    Price: "All",
    Year: "All",
    Condition: "All",
  });

  const filtered = cars.filter((c) => {
    if (active.Category !== "All" && c.category !== active.Category) return false;
    if (active.Make !== "All" && c.make !== active.Make) return false;
    if (active.Condition !== "All" && c.condition !== active.Condition) return false;
    if (active.Year !== "All") {
      if (active.Year === "Pre-1970" && c.year >= 1970) return false;
      if (active.Year === "1970–1980" && (c.year < 1970 || c.year > 1980)) return false;
      if (active.Year === "1980+" && c.year < 1980) return false;
    }
    if (active.Price !== "All" && !c.price.label) {
      const p = c.price.amount;
      if (active.Price === "Under 1.5 Cr" && p >= 15000000) return false;
      if (active.Price === "1.5–3 Cr" && (p < 15000000 || p > 30000000)) return false;
      if (active.Price === "3 Cr+" && p < 30000000) return false;
    }
    return true;
  });

  // New rows are appended at the bottom of the sheet, so "newest first" means
  // reversing the sheet order. Within each category: featured cars lead,
  // then pinned cars, then everything else — newest first in each group.
  const sortCars = (list: Car[]) => {
    const featured = list.filter((c) => c.featured).reverse();
    const pinned = list.filter((c) => !c.featured && c.pinned).reverse();
    const rest = list.filter((c) => !c.featured && !c.pinned).reverse();
    return [...featured, ...pinned, ...rest];
  };
  const collector = sortCars(filtered.filter((c) => c.category !== "Daily Driver"));
  const dailyDrivers = sortCars(filtered.filter((c) => c.category === "Daily Driver"));
  // Only label the two groups when browsing both together — a single
  // selected category already says what it is via the highlighted tile.
  const showHeadings = active.Category === "All" && collector.length > 0 && dailyDrivers.length > 0;
  const categoryTiles: { key: "Collector" | "Daily Driver"; label: string; question: string }[] = [
    { key: "Collector", label: "Collector Cars", question: "Looking for a collector car?" },
    {
      key: "Daily Driver",
      label: "Daily Drivers",
      question: "Looking for something for your daily?",
    },
  ];

  return (
    <>
      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 pt-8 pb-6">
        <div className="eyebrow">{c.eyebrow ?? "Marketplace"}</div>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl">{c.heading ?? "All cars"}</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          {c.subtitle
            ? c.subtitle
            : `${filtered.length} ${filtered.length === 1 ? "listing" : "listings"} available`}
        </p>
      </section>

      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 pb-8">
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {categoryTiles.map((tile) => {
            const isActive = active.Category === tile.key;
            return (
              <button
                key={tile.key}
                onClick={() => setActive((p) => ({ ...p, Category: isActive ? "All" : tile.key }))}
                className={`group text-left p-5 border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl ${
                  isActive
                    ? "bg-foreground text-background border-foreground shadow-lg"
                    : "bg-background border-border hover:border-foreground hover:bg-secondary"
                }`}
              >
                <div className={`eyebrow ${isActive ? "text-background" : ""}`}>{tile.label}</div>
                <p className="mt-1.5 font-serif text-lg md:text-xl transition-transform duration-300 group-hover:translate-x-1">
                  {tile.question}
                </p>
                <span className="mt-2.5 inline-flex items-center gap-1.5 text-sm border-b border-current pb-0.5">
                  {isActive ? "Showing all cars" : "View"}
                  <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                    →
                  </span>
                </span>
              </button>
            );
          })}
        </div>
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

      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 pt-10 pb-16 flex-1">
        {collector.length > 0 && (
          <div className={dailyDrivers.length > 0 ? "mb-16" : undefined}>
            {showHeadings && (
              <h2 className="font-serif text-2xl md:text-3xl mb-8">Collector Cars</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {collector.map((car) => (
                <CarCard key={car.slug} car={car} />
              ))}
            </div>
          </div>
        )}
        {dailyDrivers.length > 0 && (
          <div>
            {showHeadings && (
              <h2 className="font-serif text-2xl md:text-3xl mb-8">Daily Drivers</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {dailyDrivers.map((car) => (
                <CarCard key={car.slug} car={car} />
              ))}
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-20">No cars match these filters.</p>
        )}
      </section>
    </>
  );
}
