"use client";

import Link from "next/link";
import type { Car } from "@/lib/cars-data";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-context";
import { PopoutImage } from "@/components/popout-image";

export function CarCard({ car }: { car: Car }) {
  const { currency } = useCurrency();

  return (
    <Link href={`/cars/${car.slug}`} className="group block relative">
      {car.featured && (
        <img
          src="/assets/featured.png"
          alt="Featured"
          className="absolute -top-4 -right-4 z-10 w-20 sm:w-24 rotate-12 pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(220,38,38,0.45)] transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-[18deg]"
        />
      )}
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {car.image && (
          <PopoutImage
            src={car.image}
            alt={car.year > 0 ? `${car.year} ${car.name}` : car.name}
            loading="lazy"
            openOnClick={false}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-end justify-end p-4 pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-background tracking-wider">
            VIEW DETAILS →
          </span>
        </div>
      </div>
      <div className="pt-5 pb-2">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-xl text-foreground">
            {car.year > 0 ? `${car.year} ` : ""}
            {car.name}
          </h3>
          <span className="text-sm text-foreground whitespace-nowrap">
            {formatPrice(car.price, currency)}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{car.spec}</p>
      </div>
    </Link>
  );
}
