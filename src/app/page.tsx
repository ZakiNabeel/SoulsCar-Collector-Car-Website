import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { LinkButton } from "@/components/ui-bits";
import { cars } from "@/lib/cars-data";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 lg:pt-28 pb-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="eyebrow mb-6">SoulCars · Pakistan</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
              Collector Cars,
              <br />
              Carefully Curated.
            </h1>
            <p className="mt-8 text-lg text-muted-foreground max-w-md">
              A quiet marketplace for rare, vintage and meaningful automobiles — connecting
              Pakistani collectors with cars worth keeping.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LinkButton to="/cars">Browse Cars</LinkButton>
              <LinkButton to="/sell" variant="outline">
                List Your Car
              </LinkButton>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="aspect-[16/10] overflow-hidden bg-secondary">
              <img
                src="/assets/hero-car.jpg"
                alt="1973 Porsche 911 in silver"
                width={1920}
                height={1080}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <FeaturedCarousel cars={cars} />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
        <div className="eyebrow">Browse</div>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl mb-12">By category</h2>
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {[
            { label: "Collector Cars", desc: "Curated rare and classic automobiles.", to: "/cars" },
            { label: "Classic Parts", desc: "Restored, NOS and used components.", to: "/parts" },
            { label: "Recently Added", desc: "The latest listings on SoulCars.", to: "/cars" },
          ].map((c) => (
            <a
              key={c.label}
              href={c.to}
              className="group bg-background p-10 hover:bg-secondary transition-colors"
            >
              <div className="eyebrow">{String(c.label).split(" ")[0]}</div>
              <h3 className="mt-4 font-serif text-2xl">{c.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              <span className="mt-8 inline-block text-sm border-b border-foreground pb-0.5 group-hover:text-accent group-hover:border-accent">
                Explore →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-8 text-center text-sm text-muted-foreground tracking-wide">
          Verified Sellers <span className="mx-3 text-border">·</span> Secure Inquiries
          <span className="mx-3 text-border">·</span> PK-Based Support
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
