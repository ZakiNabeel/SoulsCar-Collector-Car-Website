export type Currency = "PKR" | "USD" | "AED";

export const CURRENCIES = {
  PKR: { symbol: "₨", label: "PKR", name: "Pakistani Rupee" },
  USD: { symbol: "$", label: "USD", name: "US Dollar" },
  AED: { symbol: "د.إ", label: "AED", name: "UAE Dirham" },
} as const;

export const EXCHANGE_RATES: Record<Currency, Record<Currency, number>> = {
  PKR: { PKR: 1, USD: 0.0036, AED: 0.0132 },
  USD: { PKR: 278.5, USD: 1, AED: 3.6725 },
  AED: { PKR: 75.8, USD: 0.2723, AED: 1 },
};

export interface Price {
  amount: number;
  currency: Currency;
  // Set when the source text has no numeric value (e.g. "Sold", "Not For
  // Sale"). formatPrice returns this verbatim instead of converting/formatting.
  label?: string;
}

export function convertPrice(price: Price, targetCurrency: Currency): Price {
  if (price.label) return price;
  if (price.currency === targetCurrency) return price;
  const rate = EXCHANGE_RATES[price.currency][targetCurrency];
  return {
    amount: price.amount * rate,
    currency: targetCurrency,
  };
}

export function formatPrice(price: Price, currency?: Currency): string {
  if (price.label) return price.label;

  const target = currency || price.currency;
  const converted = convertPrice(price, target);
  const symbol = CURRENCIES[target].symbol;

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(converted.amount);

  return `${symbol} ${formatted}`;
}

// Handles the free-text formats used in the sheet: "9.8 Million", "9.5 Lac",
// "PKR 4.85 Cr", "PKR 85,000", as well as non-numeric statuses like "Sold"
// or "Not For Sale" (returned as a label instead of a parsed amount).
export function parsePriceString(str: string): Price {
  const s = str.trim();
  const numMatch = s.match(/[\d,]+(?:\.\d+)?/);
  if (!numMatch) return { amount: 0, currency: "PKR", label: s || undefined };

  let amount = parseFloat(numMatch[0].replace(/,/g, ""));
  const lower = s.toLowerCase();
  if (/\bcr(ore)?\b/.test(lower)) amount *= 10000000;
  else if (/\bmillion\b/.test(lower)) amount *= 1000000;
  else if (/\blac|lakh\b/.test(lower)) amount *= 100000;

  return { amount, currency: "PKR" };
}
