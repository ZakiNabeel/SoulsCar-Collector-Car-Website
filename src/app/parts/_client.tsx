"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Pill, Button } from "@/components/ui-bits";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-context";
import { PopoutImage } from "@/components/popout-image";
import { PartCard } from "@/components/part-card";
import { filterParts } from "@/lib/parts-data";
import type { Part, Car } from "@/lib/cars-data";

function SuggestedCarsCarousel({ cars }: { cars: Car[] }) {
  const { currency } = useCurrency();
  const items = cars.slice(0, 6);
  const [i, setI] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (items.length < 2) return;
    autoPlayRef.current = setInterval(() => setI((p) => (p + 1) % items.length), 3500);
  }, [items.length]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [startAutoPlay]);

  if (items.length === 0) return null;

  const get = (offset: number) => items[(i + offset + items.length) % items.length];
  const goTo = (idx: number) => {
    setI(idx);
    startAutoPlay();
  };

  const handleSideHover = (targetIdx: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => goTo(targetIdx), 1500);
  };
  const handleSideLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  };

  // Swipe support for mobile, where the side cards / hover are unavailable.
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 40) {
      goTo(
        touchDeltaX.current < 0 ? (i + 1) % items.length : (i - 1 + items.length) % items.length,
      );
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10">
          <div className="eyebrow">Also on SoulCars</div>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">Collector cars</h2>
        </div>

        <div className="relative">
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {[-1, 0, 1].map((off) => {
              const car = get(off);
              const isCenter = off === 0;
              const targetIdx = (i + off + items.length) % items.length;
              return (
                <Link
                  key={`${off}-${car.slug}`}
                  href={`/cars/${car.slug}`}
                  onMouseEnter={!isCenter ? () => handleSideHover(targetIdx) : undefined}
                  onMouseLeave={!isCenter ? handleSideLeave : undefined}
                  className={`group block bg-background transition-opacity duration-300 ${
                    isCenter ? "opacity-100" : "hidden md:block opacity-100"
                  }`}
                >
                  <div className="aspect-[16/9] overflow-hidden bg-secondary">
                    {car.image && (
                      <PopoutImage
                        src={car.image}
                        alt={car.name}
                        loading="lazy"
                        openOnClick={false}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-xl leading-snug">
                        {car.year} {car.name}
                      </h3>
                      <span className="text-sm whitespace-nowrap">
                        {formatPrice(car.price, currency)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{car.spec}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => goTo((i - 1 + items.length) % items.length)}
            aria-label="Previous"
            className="hidden md:grid absolute left-0 top-[calc(50%-2.5rem)] -translate-x-1/2 -translate-y-1/2 h-11 w-11 place-items-center border border-border bg-background hover:bg-foreground hover:text-background transition-colors z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => goTo((i + 1) % items.length)}
            aria-label="Next"
            className="hidden md:grid absolute right-0 top-[calc(50%-2.5rem)] translate-x-1/2 -translate-y-1/2 h-11 w-11 place-items-center border border-border bg-background hover:bg-foreground hover:text-background transition-colors z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function PartsClient({
  parts,
  suggestedCars = [],
  content = {},
}: {
  parts: Part[];
  suggestedCars?: Car[];
  content?: Record<string, string>;
}) {
  const c = content;
  const [query, setQuery] = useState("");
  const conditions = useMemo(
    () => ["All", ...Array.from(new Set(parts.map((p) => p.condition))).sort()],
    [parts],
  );

  const PART_FILTERS = {
    Condition: conditions,
    Price: ["All", "Under 50k", "50k–100k", "100k+"],
  };

  const [active, setActive] = useState<Record<string, string>>({
    Condition: "All",
    Price: "All",
  });

  const filtered = filterParts(parts, {
    query,
    condition: active.Condition,
    price: active.Price,
  }).reverse();
  const resetFilters = () => {
    setQuery("");
    setActive({ Condition: "All", Price: "All" });
  };

  return (
    <>
      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 pt-16 pb-10">
        <div className="eyebrow">{c.eyebrow ?? "Marketplace"}</div>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">{c.heading ?? "Classic parts"}</h1>
        <p className="mt-3 text-muted-foreground">
          {c.subtitle ?? "Restored, NOS and quality used components."}
        </p>
      </section>

      <div className="border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-5">
          <label htmlFor="parts-search" className="sr-only">
            Search parts
          </label>
          <input
            id="parts-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search parts, compatible cars or location…"
            className="w-full max-w-lg border border-border bg-background px-4 py-3 text-sm"
          />
          <p className="mt-3 text-xs text-muted-foreground">Price filters are in PKR.</p>
        </div>
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
        <p aria-live="polite" className="mb-8 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "part" : "parts"} found
        </p>
        {filtered.length === 0 && parts.length > 0 ? (
          <div className="py-20 text-center">
            <h2 className="font-serif text-2xl">No matching parts</h2>
            <p className="mt-3 text-muted-foreground">Try another search or clear your filters.</p>
            <Button variant="outline" className="mt-6" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="eyebrow mb-4">No parts available</div>
            <p className="font-serif text-2xl md:text-3xl max-w-xl">
              Sorry, no car parts are available currently.
            </p>
            <p className="mt-4 text-muted-foreground max-w-md">
              For more info, please reach out to us at{" "}
              <a
                href="mailto:soulcarspakistan@gmail.com"
                className="text-foreground border-b border-foreground hover:text-accent hover:border-accent transition-colors"
              >
                soulcarspakistan@gmail.com
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {filtered.map((p) => (
              <PartCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </section>

      <SuggestedCarsCarousel cars={suggestedCars} />
    </>
  );
}
