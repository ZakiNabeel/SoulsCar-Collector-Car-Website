import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid md:grid-cols-2 gap-12">
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="space-y-3">
            <div className="eyebrow">Marketplace</div>
            <ul className="space-y-2 text-foreground/70">
              <li>
                <Link href="/cars" className="hover:text-foreground">
                  Cars
                </Link>
              </li>
              <li>
                <Link href="/parts" className="hover:text-foreground">
                  Parts
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-foreground">
                  Sell a Car
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="eyebrow">Company</div>
            <ul className="space-y-2 text-foreground/70">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:soulcarspakistan@gmail.com" className="hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="md:text-right space-y-3">
          <p className="font-serif text-2xl text-foreground leading-snug">
            Find the car you were meant to drive.
          </p>
          <p className="text-sm text-muted-foreground">
            soulcarspakistan@gmail.com · Lahore, Pakistan
          </p>
          <p className="text-xs text-muted-foreground pt-6">
            © {new Date().getFullYear()} SoulCars.pk
          </p>
        </div>
      </div>
    </footer>
  );
}
