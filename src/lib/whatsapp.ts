// Builds a wa.me link pre-filled with a draft message, so the admin can
// review and hit send themselves rather than a message going out unattended.
// wa.me requires digits-only, country code, no leading 0/+. Pakistani numbers
// are typically entered as "03xx-xxxxxxx" (11 digits, leading 0) — swap that
// 0 for the 92 country code. Numbers already given with a country code pass
// through unchanged.
export function waMeLink(phone: string, text: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  const withCountryCode = digits.startsWith("0") ? "92" + digits.slice(1) : digits;
  if (withCountryCode.length < 10) return undefined;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(text)}`;
}
