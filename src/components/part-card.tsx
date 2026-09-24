"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui-bits";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-context";
import { PopoutImage } from "@/components/popout-image";
import type { Part } from "@/lib/cars-data";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function useSaved(key: string) {
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

export function EnquireModal({ part, onClose }: { part: Part; onClose: () => void }) {
  const { currency } = useCurrency();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/submit-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "part",
          itemUrl: `${window.location.origin}/parts/${part.slug}`,
          itemName: part.name,
          itemDetails: [
            part.fits && `Fits ${part.fits}`,
            part.condition,
            formatPrice(part.price, currency),
          ]
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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto sm:rounded-none">
        <DialogTitle className="sr-only">Enquire about {part.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Send your contact details to SoulCars to ask about this part.
        </DialogDescription>
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
                <label
                  htmlFor="part-enquiry-name"
                  className="text-xs text-muted-foreground tracking-wider uppercase"
                >
                  Your Name
                </label>
                <input
                  id="part-enquiry-name"
                  autoComplete="name"
                  maxLength={120}
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label
                  htmlFor="part-enquiry-phone"
                  className="text-xs text-muted-foreground tracking-wider uppercase"
                >
                  Phone / WhatsApp
                </label>
                <input
                  id="part-enquiry-phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label
                  htmlFor="part-enquiry-email"
                  className="text-xs text-muted-foreground tracking-wider uppercase"
                >
                  Email (optional)
                </label>
                <input
                  id="part-enquiry-email"
                  autoComplete="email"
                  maxLength={254}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label
                  htmlFor="part-enquiry-message"
                  className="text-xs text-muted-foreground tracking-wider uppercase"
                >
                  Message (optional)
                </label>
                <textarea
                  id="part-enquiry-message"
                  maxLength={5000}
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground resize-none"
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-red-500">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Sending…" : "Send Enquiry"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PartCard({ p }: { p: Part }) {
  const { currency } = useCurrency();
  const [saved, toggleSaved] = useSaved(`part-${p.slug}`);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && <EnquireModal part={p} onClose={() => setShowModal(false)} />}
      <div className="group block">
        <Link
          href={`/parts/${p.slug}`}
          aria-label={`View ${p.name}`}
          className="block aspect-[16/10] overflow-hidden bg-secondary"
        >
          {p.image ? (
            <PopoutImage
              src={p.image}
              alt={p.name}
              loading="lazy"
              openOnClick={false}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Photo coming soon
            </span>
          )}
        </Link>
        <div className="pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-xl">
              <Link href={`/parts/${p.slug}`}>{p.name}</Link>
            </h3>
            <span className="text-sm whitespace-nowrap">{formatPrice(p.price, currency)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-sm text-muted-foreground">
            {p.fits && <span className="truncate min-w-0">Fits {p.fits}</span>}
            {p.condition && (
              <span className="shrink-0 whitespace-nowrap border border-border px-2 py-0.5 text-xs tracking-wider uppercase text-foreground">
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
