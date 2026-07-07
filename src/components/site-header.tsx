"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { CurrencySelector } from "@/components/currency-selector";

const nav = [
  { href: "/cars", label: "Cars" },
  { href: "/parts", label: "Parts" },
  { href: "/sell", label: "Sell a Car" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
          SoulCars<span className="text-accent">.pk</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`text-sm ${pathname === n.href ? "text-foreground" : "text-foreground/70 hover:text-foreground"}`}
            >
              {n.label}
            </Link>
          ))}
          <div className="border-l border-border pl-6">
            <CurrencySelector />
          </div>
        </nav>

        <button
          aria-label="Open menu"
          className="md:hidden text-foreground"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open &&
        mounted &&
        createPortal(
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex flex-col justify-end">
            {/* Dismiss on background tap */}
            <button
              aria-label="Close menu"
              className="absolute inset-0 w-full h-full cursor-default"
              onClick={() => setOpen(false)}
            />

            {/* Card panel slides up from bottom */}
            <div className="relative bg-background border-t border-border rounded-t-2xl px-6 pt-6 pb-12 shadow-2xl">
              {/* Handle bar */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />

              {/* Logo + close */}
              <div className="flex items-center justify-between mb-4">
                <Link href="/" onClick={() => setOpen(false)} className="font-serif text-2xl">
                  SoulCars<span className="text-accent">.pk</span>
                </Link>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 grid place-items-center border border-border hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col divide-y divide-border">
                {nav.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`py-4 font-serif text-2xl ${
                      pathname === n.href ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
