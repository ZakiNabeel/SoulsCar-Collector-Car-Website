"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Part } from "@/lib/cars-data";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-context";
import { Button } from "@/components/ui-bits";
import { EnquireModal, useSaved } from "@/components/part-card";
import { ImageLightbox } from "@/components/image-lightbox";

export function PartDetail({ part }: { part: Part }) {
  const { currency } = useCurrency();
  const images = part.images?.length ? part.images : [part.image].filter(Boolean);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [enquiring, setEnquiring] = useState(false);
  const [saved, toggleSaved] = useSaved(`part-${part.slug}`);

  return (
    <main className="mx-auto max-w-7xl w-full flex-1 px-6 lg:px-10 py-10 lg:py-16">
      <Link href="/parts" className="text-sm text-muted-foreground hover:text-foreground">
        ← All parts
      </Link>
      <div className="mt-8 grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="min-w-0">
          <div className="relative aspect-[4/3] bg-secondary">
            {images.length ? (
              <button
                className="h-full w-full"
                onClick={() => setLightbox(true)}
                aria-label={`Enlarge photo ${index + 1} of ${part.name}`}
              >
                <img
                  src={images[index]}
                  alt={`${part.name} — photo ${index + 1}`}
                  className="h-full w-full object-contain"
                />
              </button>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Photo coming soon
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous photo"
                  onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-background border border-border"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  aria-label="Next photo"
                  onClick={() => setIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-background border border-border"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span
                  className="absolute bottom-3 right-3 bg-background px-3 py-1 text-xs"
                  aria-live="polite"
                >
                  {index + 1} / {images.length}
                </span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  aria-label={`View photo ${i + 1}`}
                  aria-pressed={i === index}
                  onClick={() => setIndex(i)}
                  className={`shrink-0 w-20 h-16 border-2 ${i === index ? "border-foreground" : "border-transparent"}`}
                >
                  <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="eyebrow">Classic parts · {part.condition}</div>
          <h1 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl break-words">
            {part.name}
          </h1>
          <p className="mt-6 text-2xl">{formatPrice(part.price, currency)}</p>
          <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
            {[
              ["Fits", part.fits],
              ["Condition", part.condition],
              ["Location", part.location],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 py-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
          </dl>
          {part.description && (
            <div className="mt-8">
              <h2 className="font-serif text-2xl">About this part</h2>
              <p className="mt-4 whitespace-pre-line text-muted-foreground leading-relaxed">
                {part.description}
              </p>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => setEnquiring(true)}>Enquire about this part</Button>
            <Button variant="outline" onClick={toggleSaved} aria-pressed={saved}>
              {saved ? "Saved ✓" : "Save"}
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Contact SoulCars to confirm availability and compatibility.
          </p>
        </div>
      </div>
      {enquiring && <EnquireModal part={part} onClose={() => setEnquiring(false)} />}
      {lightbox && (
        <ImageLightbox images={images} initialIndex={index} onClose={() => setLightbox(false)} />
      )}
    </main>
  );
}
