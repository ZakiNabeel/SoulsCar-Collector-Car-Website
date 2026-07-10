"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Car } from "@/lib/cars-data";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-context";
import { PopoutImage } from "@/components/popout-image";

export function FeaturedCarousel({
  cars,
  eyebrow,
  heading,
}: {
  cars: Car[];
  eyebrow?: string;
  heading?: string;
}) {
  const { currency } = useCurrency();
  const [i, setI] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setI((p) => (p + 1) % cars.length);
    }, 3500);
  }, [cars.length]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [startAutoPlay]);

  if (cars.length === 0) return null;

  const get = (offset: number) => cars[(i + offset + cars.length) % cars.length];

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

  const prev = () => goTo((i - 1 + cars.length) % cars.length);
  const next = () => goTo((i + 1) % cars.length);

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
    if (Math.abs(touchDeltaX.current) > 40) (touchDeltaX.current < 0 ? next : prev)();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <section className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10">
          <div className="eyebrow">{eyebrow ?? "Featured Listings"}</div>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">
            {heading ?? "This week's selection"}
          </h2>
        </div>

        {/* Cards + centred nav buttons */}
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
              const targetIdx = (i + off + cars.length) % cars.length;
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

          {/* Prev / Next — absolutely centred over the grid (desktop only) */}
          <button
            onClick={prev}
            aria-label="Previous"
            className="hidden md:grid absolute left-0 top-[calc(50%-2.5rem)] -translate-x-1/2 -translate-y-1/2 h-11 w-11 place-items-center border border-border bg-background hover:bg-foreground hover:text-background transition-colors z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="hidden md:grid absolute right-0 top-[calc(50%-2.5rem)] translate-x-1/2 -translate-y-1/2 h-11 w-11 place-items-center border border-border bg-background hover:bg-foreground hover:text-background transition-colors z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile controls — buttons + dots below the single card */}
        <div className="mt-6 flex items-center justify-center gap-4 md:hidden">
          <button
            onClick={prev}
            aria-label="Previous"
            className="grid h-11 w-11 place-items-center border border-border bg-background active:bg-foreground active:text-background transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {/* flex-wrap keeps a long dot row from pushing the page wider than
              the phone screen when there are many listings */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-[55vw]">
            {cars.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to listing ${idx + 1}`}
                className={`h-[3px] transition-all ${idx === i ? "w-8 bg-foreground" : "w-4 bg-foreground/30"}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            aria-label="Next"
            className="grid h-11 w-11 place-items-center border border-border bg-background active:bg-foreground active:text-background transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
