"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui-bits";
import { compressPhoto, fitPhotosToBudget } from "@/lib/compress-image";

const STEPS = ["Car Details", "Photos & Condition", "Pricing & Contact"] as const;

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow text-sm">{label}</span>
      <input
        {...props}
        className="mt-2 block w-full border border-border bg-background px-5 h-14 text-base focus:outline-none focus:border-foreground"
      />
    </label>
  );
}

type FormData = {
  make: string;
  model: string;
  year: string;
  mileage: string;
  engine: string;
  transmission: string;
  condition: string;
  notes: string;
  price: string;
  city: string;
  sellerName: string;
  phone: string;
  email: string;
};

const EMPTY: FormData = {
  make: "",
  model: "",
  year: "",
  mileage: "",
  engine: "",
  transmission: "",
  condition: "Concours",
  notes: "",
  price: "",
  city: "",
  sellerName: "",
  phone: "",
  email: "",
};

export function SellClient({ content = {} }: { content?: Record<string, string> }) {
  const c = content;
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [data, setData] = useState<FormData>(EMPTY);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Object URLs live outside render so previews aren't re-created every
  // render (which leaked memory and froze mobile Safari with many photos).
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    return () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  const set =
    (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setData((d) => ({ ...d, [k]: e.target.value }));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setProcessing(true);
    setError("");
    try {
      // Phone photos are 3–8MB each; the server rejects large uploads, so
      // shrink each one in the browser before it's ever sent.
      const compressed = await Promise.all(Array.from(files).map(compressPhoto));
      setPhotos((prev) => [
        ...prev,
        ...compressed.map((file) => ({ file, url: URL.createObjectURL(file) })),
      ]);
    } finally {
      setProcessing(false);
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setSending(true);
    setError("");
    try {
      const fitted = await fitPhotosToBudget(photos.map((p) => p.file));
      if (!fitted) {
        setError(
          "Your photos are too large to upload together. Please remove a few and try again.",
        );
        return;
      }

      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      fitted.forEach((f) => fd.append("photos", f));

      const res = await fetch("/api/submit-listing", { method: "POST", body: fd });
      if (!res.ok) {
        if (res.status === 413) {
          setError(
            "Your photos are too large to upload together. Please remove a few and try again.",
          );
          return;
        }
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "server error");
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl w-full px-6 lg:px-10 pt-16 pb-24 flex-1">
      <div className="eyebrow">{c.eyebrow ?? "List your car"}</div>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">{c.heading ?? "Tell us about it."}</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {c.subtitle ?? "A few short steps — we'll handle review and present your car beautifully."}
      </p>

      <div className="mt-12 flex items-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3 flex-1">
            <span
              className={`h-3 w-3 rounded-full flex-shrink-0 ${i <= step ? "bg-foreground" : "bg-border"}`}
            />
            {/* On phones only the current step's label fits — the others show
                just their progress dot. */}
            <span
              className={`text-sm tracking-wider uppercase ${
                i === step
                  ? "text-foreground font-medium"
                  : "hidden sm:inline text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      {submitted ? (
        <div className="mt-16 border border-border p-10 text-center">
          <h2 className="font-serif text-3xl">{c.thanks_heading ?? "Thank you."}</h2>
          <p className="mt-3 text-muted-foreground">
            {c.thanks_body ??
              "We've received your listing. Our team will reach out within 48 hours."}
          </p>
        </div>
      ) : (
        <form className="mt-12 space-y-6" onSubmit={submit}>
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-6">
              <Field
                label="Make"
                placeholder="Porsche"
                required
                value={data.make}
                onChange={set("make")}
              />
              <Field
                label="Model"
                placeholder="911 T"
                required
                value={data.model}
                onChange={set("model")}
              />
              <Field
                label="Year"
                type="number"
                placeholder="1973"
                required
                value={data.year}
                onChange={set("year")}
              />
              <Field
                label="Mileage (km)"
                type="number"
                placeholder="78400"
                required
                value={data.mileage}
                onChange={set("mileage")}
              />
              <Field
                label="Engine"
                placeholder="2.4L Flat-6"
                value={data.engine}
                onChange={set("engine")}
              />
              <Field
                label="Transmission"
                placeholder="5-speed Manual"
                value={data.transmission}
                onChange={set("transmission")}
              />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-6">
              <label className="block">
                <span className="eyebrow text-sm">Condition</span>
                <select
                  value={data.condition}
                  onChange={set("condition")}
                  className="mt-2 block w-full border border-border bg-background px-5 h-14 text-base focus:outline-none focus:border-foreground"
                >
                  <option>Concours</option>
                  <option>Excellent</option>
                  <option>Restored</option>
                  <option>Driver</option>
                  <option>Project</option>
                </select>
              </label>
              <label className="block">
                <span className="eyebrow text-sm">Notes</span>
                <textarea
                  rows={6}
                  value={data.notes}
                  onChange={set("notes")}
                  className="mt-2 block w-full border border-border bg-background px-5 py-4 text-base focus:outline-none focus:border-foreground"
                  placeholder="Service history, originality, recent work…"
                />
              </label>
              <div
                className="border border-dashed border-border p-14 text-center text-base text-muted-foreground cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    handleFiles(files);
                    // reset so picking the same file again re-triggers onChange
                    e.target.value = "";
                  }}
                />
                {photos.length === 0 && !processing ? (
                  <p>
                    Drag photos here or <span className="underline">click to upload</span>
                    <br />
                    <span className="text-xs">(min. 6 images recommended)</span>
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-foreground">
                      {processing
                        ? "Preparing photos…"
                        : `${photos.length} photo${photos.length !== 1 ? "s" : ""} selected`}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-3">
                      {photos.map((p, idx) => (
                        <div key={p.url} className="relative">
                          <img
                            src={p.url}
                            alt={p.file.name}
                            className="h-16 w-16 object-cover border border-border"
                          />
                          <button
                            type="button"
                            aria-label="Remove photo"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhoto(idx);
                            }}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground text-background text-xs leading-none flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    {!processing && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-xs underline mt-2"
                      >
                        Add more
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid sm:grid-cols-2 gap-6">
              <Field
                label="Asking price (PKR)"
                placeholder="4,85,00,000"
                required
                value={data.price}
                onChange={set("price")}
              />
              <Field
                label="City"
                placeholder="Lahore"
                required
                value={data.city}
                onChange={set("city")}
              />
              <Field
                label="Your name"
                placeholder="Full name"
                required
                value={data.sellerName}
                onChange={set("sellerName")}
              />
              <Field
                label="Phone"
                placeholder="+92 ..."
                required
                value={data.phone}
                onChange={set("phone")}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={data.email}
                  onChange={set("email")}
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              ← Back
            </button>
            <Button type="submit" disabled={sending || processing}>
              {sending ? "Sending…" : step === STEPS.length - 1 ? "Submit listing" : "Continue"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
