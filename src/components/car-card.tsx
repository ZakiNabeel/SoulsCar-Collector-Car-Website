import Link from "next/link";
import type { Car } from "@/lib/cars-data";

export function CarCard({ car }: { car: Car }) {
  return (
    <Link href={`/cars/${car.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <img
          src={car.image}
          alt={`${car.year} ${car.name}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-end justify-end p-4">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-background tracking-wider">
            VIEW DETAILS →
          </span>
        </div>
      </div>
      <div className="pt-5 pb-2">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-xl text-foreground">
            {car.year} {car.name}
          </h3>
          <span className="text-sm text-foreground whitespace-nowrap">{car.price}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{car.spec}</p>
      </div>
    </Link>
  );
}
