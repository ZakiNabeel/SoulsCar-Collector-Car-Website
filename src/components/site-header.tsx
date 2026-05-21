"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { href: "/cars", label: "Cars" },
  { href: "/parts", label: "Parts" },
  { href: "/sell", label: "Sell a Car" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
          SoulCars<span className="text-accent">.pk</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`text-sm ${pathname === n.href ? "text-foreground" : "text-foreground/70 hover:text-foreground"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Open menu"
          className="md:hidden text-foreground"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="h-16 px-6 flex items-center justify-between border-b border-border">
            <Link href="/" onClick={() => setOpen(false)} className="font-serif text-2xl">
              SoulCars<span className="text-accent">.pk</span>
            </Link>
            <button aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-8">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="font-serif text-3xl text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
