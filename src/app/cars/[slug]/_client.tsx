"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui-bits";
import type { Car } from "@/lib/cars-data";

function useSaved(key: string) {
  const storageKey = `saved-${key}`;
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);
  const toggle = () => {
    const next = !saved;
    next ? localStorage.setItem(storageKey, "1") : localStorage.removeItem(storageKey);
    setSaved(next);
  };
  return [saved, toggle] as const;
}

function RequestModal({ car, onClose }: { car: Car; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/submit-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "car",
          itemName: `${car.year > 0 ? car.year + " " : ""}${car.name}`,
          itemDetails: [car.make, car.model, car.price].filter(Boolean).join(" · "),
          itemUrl: window.location.href,
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error("server error");
      setSent(true);
    } catch {
      setError("Couldn't send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm">
      <div className="bg-background border border-border w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {sent ? (
          <div className="text-center space-y-3 py-4">
            <p className="font-serif text-2xl">Request sent</p>
            <p className="text-sm text-muted-foreground">We'll be in touch shortly.</p>
            <Button className="w-full mt-4" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="eyebrow mb-2">Request to Buy</div>
            <p className="font-serif text-xl mb-6">
              {car.year > 0 ? `${car.year} ` : ""}
              {car.name}
            </p>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground tracking-wider uppercase">
                  Your Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground tracking-wider uppercase">
                  Phone / WhatsApp
                </label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground tracking-wider uppercase">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground tracking-wider uppercase">
                  Message (optional)
                </label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground resize-none"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Sending…" : "Send Request"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function SuggestedCarousel({ cars, currentSlug }: { cars: Car[]; currentSlug: string }) {
  const suggestions = cars.filter((c) => c.slug !== currentSlug).slice(0, 6);
  const [i, setI] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => setI((p) => (p + 1) % suggestions.length), 3500);
  }, [suggestions.length]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [startAutoPlay]);

  if (suggestions.length === 0) return null;

  const get = (offset: number) =>
    suggestions[(i + offset + suggestions.length) % suggestions.length];
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

  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10">
          <div className="eyebrow">You might also like</div>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">More from the collection</h2>
        </div>
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {[-1, 0, 1].map((off) => {
              const car = get(off);
              const isCenter = off === 0;
              const targetIdx = (i + off + suggestions.length) % suggestions.length;
              return (
                <Link
                  key={`${off}-${car.slug}`}
                  href={`/cars/${car.slug}`}
                  onMouseEnter={!isCenter ? () => handleSideHover(targetIdx) : undefined}
                  onMouseLeave={!isCenter ? handleSideLeave : undefined}
                  className={`group block bg-background transition-opacity duration-300 ${isCenter ? "opacity-100" : "hidden md:block opacity-50 hover:opacity-80"}`}
                >
                  <div className="aspect-[16/9] overflow-hidden bg-secondary">
                    {car.image && (
                      <img
                        src={car.image}
                        alt={car.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-xl leading-snug">
                        {car.year} {car.name}
                      </h3>
                      <span className="text-sm whitespace-nowrap">{car.price}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{car.spec}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <button
            onClick={() => goTo((i - 1 + suggestions.length) % suggestions.length)}
            aria-label="Previous"
            className="hidden md:grid absolute left-0 top-[calc(50%-2.5rem)] -translate-x-1/2 -translate-y-1/2 h-11 w-11 place-items-center border border-border bg-background hover:bg-foreground hover:text-background transition-colors z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => goTo((i + 1) % suggestions.length)}
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

export function CarDetailClient({ car, allCars = [] }: { car: Car; allCars?: Car[] }) {
  const gallery = car.images && car.images.length > 0 ? car.images : [car.image].filter(Boolean);
  const [imgIdx, setImgIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [saved, toggleSaved] = useSaved(`car-${car.slug}`);

  const specs: [string, string][] = [
    ["Make", car.make],
    ["Model", car.model],
    ...(car.year > 0 ? [["Year", String(car.year)] as [string, string]] : []),
    ["Mileage", car.mileage],
    ["Engine", car.engine],
    ["Transmission", car.transmission],
    ["Color", car.color],
    ["Condition", car.condition],
    ["Location", car.location],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      {showModal && <RequestModal car={car} onClose={() => setShowModal(false)} />}

      {/* ── Hero: image left, specs + price right ─────────────────────────── */}
      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 pt-10 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* LEFT — image gallery */}
          <div className="relative bg-secondary">
            <div className="aspect-[4/3] overflow-hidden bg-secondary">
              {gallery[imgIdx] && (
                <img
                  src={gallery[imgIdx]}
                  alt={car.name}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            {/* Prev / Next */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((p) => (p - 1 + gallery.length) % gallery.length)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center bg-background/90 border border-border hover:bg-foreground hover:text-background transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setImgIdx((p) => (p + 1) % gallery.length)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center bg-background/90 border border-border hover:bg-foreground hover:text-background transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                  {gallery.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImgIdx(idx)}
                      aria-label={`Image ${idx + 1}`}
                      className={`h-[3px] transition-all ${idx === imgIdx ? "w-8 bg-white" : "w-4 bg-white/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
            {/* Thumbnail strip if multiple images */}
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {gallery.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImgIdx(idx)}
                    className={`flex-shrink-0 w-20 h-14 overflow-hidden border-2 transition-colors ${idx === imgIdx ? "border-foreground" : "border-transparent"}`}
                  >
                    <img src={src} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description — sits under the gallery, left column */}
          <div className="mt-6 lg:order-3 lg:mt-0">
            <div className="eyebrow mb-3">About this car</div>
            <p className="text-lg text-muted-foreground leading-relaxed">{car.description}</p>
          </div>

          {/* RIGHT — title, price, specs, actions */}
          <div className="space-y-8 lg:row-span-2">
            {/* Title */}
            <div>
              <div className="eyebrow">{car.location}</div>
              <h1 className="mt-2 font-serif text-4xl md:text-5xl leading-tight">
                {car.year > 0 ? `${car.year} ` : ""}
                {car.name}
              </h1>
            </div>

            {/* Price + actions */}
            <div className="border border-border p-6 space-y-5 bg-background">
              <div>
                <div className="eyebrow">Asking price</div>
                <p className="mt-1 font-serif text-4xl">{car.price || "Price on request"}</p>
              </div>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => setShowModal(true)}>
                  Request to Buy
                </Button>
                <Button variant="outline" className="w-full" onClick={toggleSaved}>
                  {saved ? "Saved ✓" : "Save Listing"}
                </Button>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Seller</span>
                <span>{car.seller}</span>
              </div>
            </div>

            {/* Specs */}
            <div>
              <div className="eyebrow mb-4">Specification</div>
              <dl className="border-t border-border">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border py-3">
                    <dt className="text-sm text-muted-foreground">{k}</dt>
                    <dd className="text-sm text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <SuggestedCarousel cars={allCars} currentSlug={car.slug} />
      <SiteFooter />
    </div>
  );
}
