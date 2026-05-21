import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui-bits";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell Your Car — SoulCars.pk" },
      { name: "description", content: "List your collector or vintage car on SoulCars.pk." },
    ],
  }),
  component: SellPage,
});

const STEPS = ["Car Details", "Photos & Condition", "Pricing & Contact"] as const;

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        {...props}
        className="mt-2 block w-full border border-border bg-background px-4 h-12 text-sm focus:outline-none focus:border-foreground"
      />
    </label>
  );
}

function SellPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <section className="mx-auto max-w-3xl w-full px-6 lg:px-10 pt-16 pb-24 flex-1">
        <div className="eyebrow">List your car</div>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Tell us about it.</h1>
        <p className="mt-4 text-muted-foreground">
          A few short steps — we'll handle review and present your car beautifully.
        </p>

        {/* Progress */}
        <div className="mt-12 flex items-center gap-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-3 flex-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  i <= step ? "bg-foreground" : "bg-border"
                }`}
              />
              <span className={`text-xs tracking-wider uppercase ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="mt-16 border border-border p-10 text-center">
            <h2 className="font-serif text-3xl">Thank you.</h2>
            <p className="mt-3 text-muted-foreground">
              We've received your listing. Our team will reach out within 48 hours.
            </p>
          </div>
        ) : (
          <form
            className="mt-12 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (step < STEPS.length - 1) setStep(step + 1);
              else setSubmitted(true);
            }}
          >
            {step === 0 && (
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="Make" placeholder="Porsche" required />
                <Field label="Model" placeholder="911 T" required />
                <Field label="Year" type="number" placeholder="1973" required />
                <Field label="Mileage (km)" type="number" placeholder="78,400" required />
                <Field label="Engine" placeholder="2.4L Flat-6" />
                <Field label="Transmission" placeholder="5-speed Manual" />
              </div>
            )}
            {step === 1 && (
              <div className="space-y-6">
                <label className="block">
                  <span className="eyebrow">Condition</span>
                  <select className="mt-2 block w-full border border-border bg-background px-4 h-12 text-sm focus:outline-none focus:border-foreground">
                    <option>Concours</option>
                    <option>Excellent</option>
                    <option>Restored</option>
                    <option>Driver</option>
                    <option>Project</option>
                  </select>
                </label>
                <label className="block">
                  <span className="eyebrow">Notes</span>
                  <textarea
                    rows={5}
                    className="mt-2 block w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground"
                    placeholder="Service history, originality, recent work…"
                  />
                </label>
                <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  Drag photos here or click to upload (min. 6 images recommended)
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="Asking price (PKR)" placeholder="4,85,00,000" required />
                <Field label="City" placeholder="Lahore" required />
                <Field label="Your name" placeholder="Full name" required />
                <Field label="Phone" placeholder="+92 ..." required />
                <div className="sm:col-span-2">
                  <Field label="Email" type="email" placeholder="you@example.com" required />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                ← Back
              </button>
              <Button type="submit">
                {step === STEPS.length - 1 ? "Submit listing" : "Continue"}
              </Button>
            </div>
          </form>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
