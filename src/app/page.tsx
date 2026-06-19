import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { LinkButton } from "@/components/ui-bits";
import { getCars, getContent } from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [cars, content] = await Promise.all([getCars(), getContent()]);
  const c = content["home"] ?? {};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-8 lg:pt-12 pb-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="eyebrow mb-6">SoulCars · Pakistan</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
              {c.hero_title ?? (
                <>
                  Collector Cars,
                  <br />
                  Carefully Curated.
                </>
              )}
            </h1>
            <p className="mt-8 text-lg text-muted-foreground max-w-md">
              {c.hero_subtitle ??
                "A quiet marketplace for rare, vintage and meaningful automobiles — connecting Pakistani collectors with cars worth keeping."}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LinkButton to="/cars">{c.cta_browse ?? "Browse Cars"}</LinkButton>
              <LinkButton to="/sell" variant="outline">
                {c.cta_list ?? "List Your Car"}
              </LinkButton>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="flex items-center justify-center">
              <img
                src="/assets/IMG-20260619-WA0017-removebg-preview.png"
                alt="The SoulCars collection — a lineup of curated classic and collector cars"
                width={1568}
                height={426}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <FeaturedCarousel cars={cars} eyebrow={c.carousel_eyebrow} heading={c.carousel_heading} />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
        <div className="eyebrow">Browse</div>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl mb-12">
          {c.categories_heading ?? "By category"}
        </h2>
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {[
            {
              label: c.cat1_label ?? "Collector Cars",
              desc: c.cat1_desc ?? "Curated rare and classic automobiles.",
              to: "/cars",
            },
            {
              label: c.cat2_label ?? "Classic Parts",
              desc: c.cat2_desc ?? "Restored, NOS and used components.",
              to: "/parts",
            },
            {
              label: c.cat3_label ?? "Recently Added",
              desc: c.cat3_desc ?? "The latest listings on SoulCars.",
              to: "/cars",
            },
          ].map((cat) => (
            <a
              key={cat.label}
              href={cat.to}
              className="group bg-background p-10 hover:bg-secondary transition-colors"
            >
              <div className="eyebrow">{String(cat.label).split(" ")[0]}</div>
              <h3 className="mt-4 font-serif text-2xl">{cat.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{cat.desc}</p>
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
          {c.trust_line ?? "Verified Sellers · Secure Inquiries · PK-Based Support"}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
