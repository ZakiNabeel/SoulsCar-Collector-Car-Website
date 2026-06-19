"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Pill, Button } from "@/components/ui-bits";
import type { Part, Car } from "@/lib/cars-data";

function useSaved(key: string) {
  const storageKey = `saved-${key}`;
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    const next = !saved;
    next ? localStorage.setItem(storageKey, "1") : localStorage.removeItem(storageKey);
    setSaved(next);
  };
  return [saved, toggle] as const;
}

function EnquireModal({ part, onClose }: { part: Part; onClose: () => void }) {
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
          type: "part",
          itemName: part.name,
          itemDetails: [part.fits && `Fits ${part.fits}`, part.condition, part.price]
            .filter(Boolean)
            .join(" · "),
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
            <p className="font-serif text-2xl">Enquiry sent</p>
            <p className="text-sm text-muted-foreground">We'll be in touch shortly.</p>
            <Button className="w-full mt-4" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="eyebrow mb-2">Enquire About Part</div>
            <p className="font-serif text-xl mb-1">{part.name}</p>
            {part.fits && <p className="text-sm text-muted-foreground mb-6">Fits {part.fits}</p>}
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
                {sending ? "Sending…" : "Send Enquiry"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function PartCard({ p }: { p: Part }) {
  const [saved, toggleSaved] = useSaved(`part-${p.slug}`);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && <EnquireModal part={p} onClose={() => setShowModal(false)} />}
      <div className="group block">
        <div className="aspect-[16/10] overflow-hidden bg-secondary">
          {p.image && (
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          )}
        </div>
        <div className="pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-xl">{p.name}</h3>
            <span className="text-sm whitespace-nowrap">{p.price}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
            {p.fits && <span>Fits {p.fits}</span>}
            {p.condition && (
              <span className="border border-border px-2 py-0.5 text-xs tracking-wider uppercase text-foreground">
                {p.condition}
              </span>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="flex-1 text-xs py-2" onClick={() => setShowModal(true)}>
              Enquire
            </Button>
            <Button variant="outline" className="flex-1 text-xs py-2" onClick={toggleSaved}>
              {saved ? "Saved ✓" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function SuggestedCarsCarousel({ cars }: { cars: Car[] }) {
  const items = cars.slice(0, 6);
  const [i, setI] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
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

  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10">
          <div className="eyebrow">Also on SoulCars</div>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">Collector cars</h2>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
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

  const filtered = parts.filter((p) => {
    if (active.Condition !== "All" && p.condition !== active.Condition) return false;
    return true;
  });

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
        {filtered.length === 0 ? (
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
