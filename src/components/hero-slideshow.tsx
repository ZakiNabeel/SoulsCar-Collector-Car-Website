"use client";

import { useEffect, useState } from "react";

// Auto-rotating, crossfading hero slideshow. Purely automatic — no controls.
// Images are stacked and faded via opacity so transitions are smooth and the
// layout never shifts. A single image simply renders without any timer.
export function HeroSlideshow({
  images,
  intervalMs = 4500,
}: {
  images: string[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full aspect-[3/2]">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="A featured collector car from the SoulCars collection"
          loading={i === 0 ? "eager" : "lazy"}
          aria-hidden={i === active ? undefined : true}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
