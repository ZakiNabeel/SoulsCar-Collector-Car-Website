import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Car } from "@/lib/cars-data";

export function FeaturedCarousel({ cars }: { cars: Car[] }) {
  const [i, setI] = useState(0);
  const prev = () => setI((p) => (p - 1 + cars.length) % cars.length);
  const next = () => setI((p) => (p + 1) % cars.length);

  // visible: center + neighbors
  const get = (offset: number) => cars[(i + offset + cars.length) % cars.length];

  return (
    <section className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="eyebrow">Featured Listings</div>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">This week's selection</h2>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous"
              className="h-10 w-10 grid place-items-center border border-border bg-background hover:bg-foreground hover:text-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="h-10 w-10 grid place-items-center border border-border bg-background hover:bg-foreground hover:text-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] gap-6 items-center">
          {[-1, 0, 1].map((off) => {
            const car = get(off);
            const isCenter = off === 0;
            return (
              <Link
                key={`${off}-${car.slug}`}
                to="/cars/$slug"
                params={{ slug: car.slug }}
                className={`group block bg-background transition-all ${
                  isCenter ? "" : "hidden md:block opacity-60 hover:opacity-100"
                }`}
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className={`font-serif ${isCenter ? "text-2xl" : "text-lg"}`}>
                      {car.year} {car.name}
                    </h3>
                    <span className="text-sm">{car.price}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{car.spec}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2">
          {cars.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-[3px] transition-all ${
                idx === i ? "w-8 bg-foreground" : "w-4 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
