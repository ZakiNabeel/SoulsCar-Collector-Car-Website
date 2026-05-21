import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/cars", label: "Cars" },
  { to: "/parts", label: "Parts" },
  { to: "/sell", label: "Sell a Car" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl tracking-tight text-foreground">
          SoulCars<span className="text-accent">.pk</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-foreground/70 hover:text-foreground"
              activeProps={{ className: "text-sm text-foreground" }}
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
            <Link to="/" onClick={() => setOpen(false)} className="font-serif text-2xl">
              SoulCars<span className="text-accent">.pk</span>
            </Link>
            <button aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-8">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
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
