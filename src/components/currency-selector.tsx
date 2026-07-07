"use client";

import { useCurrency } from "@/lib/currency-context";
import { CURRENCIES, type Currency } from "@/lib/currency";
import { useState, useRef, useEffect } from "react";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const currencies = ["PKR", "USD", "AED"] as const;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm px-3 py-1.5 border border-border hover:bg-secondary transition-colors"
      >
        {CURRENCIES[currency].symbol} {currency}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-background border border-border shadow-lg z-50 min-w-max">
          {currencies.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCurrency(c);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors ${
                c === currency ? "bg-secondary font-medium" : ""
              }`}
            >
              {CURRENCIES[c].symbol} {c} — {CURRENCIES[c].name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
