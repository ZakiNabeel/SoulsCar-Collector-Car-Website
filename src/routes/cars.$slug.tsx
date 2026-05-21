import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui-bits";
import { cars } from "@/lib/cars-data";

export const Route = createFileRoute("/cars/$slug")({
  loader: ({ params }) => {
    const car = cars.find((c) => c.slug === params.slug);
    if (!car) throw notFound();
    return car;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.year} ${loaderData.name} — SoulCars.pk` },
          { name: "description", content: loaderData.description },
          { property: "og:image", content: loaderData.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="font-serif text-4xl">Listing not found</h1>
        <Link to="/cars" className="mt-6 inline-block underline">Back to all cars</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-6">
      <p>{error.message}</p>
    </div>
  ),
  component: CarDetail,
});

function CarDetail() {
  const car = Route.useLoaderData();
  const gallery = [car.image, car.image, car.image];
  const [i, setI] = useState(0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <section className="relative bg-secondary">
        <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <img
            src={gallery[i]}
            alt={car.name}
            className="h-full w-full object-cover"
          />
        </div>
        <button
          onClick={() => setI((p) => (p - 1 + gallery.length) % gallery.length)}
          aria-label="Previous image"
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 h-11 w-11 grid place-items-center bg-background/90 border border-border hover:bg-foreground hover:text-background"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setI((p) => (p + 1) % gallery.length)}
          aria-label="Next image"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 h-11 w-11 grid place-items-center bg-background/90 border border-border hover:bg-foreground hover:text-background"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
          {gallery.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Image ${idx + 1}`}
              className={`h-[3px] transition-all ${idx === i ? "w-8 bg-foreground" : "w-4 bg-foreground/30"}`}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 py-16 grid lg:grid-cols-12 gap-12 flex-1">
        <div className="lg:col-span-8 space-y-10">
          <div>
            <div className="eyebrow">{car.location}</div>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl">
              {car.year} {car.name}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {car.description}
            </p>
          </div>

          <div>
            <div className="eyebrow mb-5">Specification</div>
            <dl className="grid grid-cols-2 gap-y-4 gap-x-12 border-t border-border pt-5">
              {[
                ["Make", car.make],
                ["Model", car.model],
                ["Year", String(car.year)],
                ["Mileage", car.mileage],
                ["Engine", car.engine],
                ["Transmission", car.transmission],
                ["Color", car.color],
                ["Condition", car.condition],
                ["Location", car.location],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border pb-3">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="text-sm text-foreground text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 border border-border p-8 space-y-6 bg-background">
            <div>
              <div className="eyebrow">Asking price</div>
              <p className="mt-2 font-serif text-4xl text-foreground">{car.price}</p>
            </div>
            <div className="space-y-3">
              <Button className="w-full">Request to Buy</Button>
              <Button variant="outline" className="w-full">Save Listing</Button>
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Seller</span>
              <span className="text-foreground">{car.seller}</span>
            </div>
          </div>
        </aside>
      </section>

      <SiteFooter />
    </div>
  );
}
