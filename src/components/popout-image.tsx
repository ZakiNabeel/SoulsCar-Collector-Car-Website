"use client";

import { useEffect, useRef, useState } from "react";
import { ImageLightbox } from "./image-lightbox";

interface PopoutImageProps {
  src: string;
  alt: string;
  images?: string[]; // full gallery for the lightbox; defaults to just [src]
  index?: number; // position of src within images
  className?: string;
  loading?: "lazy" | "eager";
  openOnClick?: boolean;
}

const HOVER_DELAY = 350;
const CENTER_BAND_RATIO = 0.18; // fraction of viewport height counted as "centered"
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

export function PopoutImage({
  src,
  alt,
  images,
  index = 0,
  className,
  loading = "lazy",
  openOnClick = true,
}: PopoutImageProps) {
  const [open, setOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasCentered = useRef(false);
  const isFirstObservation = useRef(true);

  const gallery = images && images.length > 0 ? images : [src];

  const handleMouseEnter = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    hoverTimer.current = setTimeout(() => setOpen(true), HOVER_DELAY);
  };
  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };
  const handleClick = (e: React.MouseEvent) => {
    if (!openOnClick) return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  // Mobile: pop out automatically once the image scrolls to the center of
  // the viewport (only on the transition into view, not on initial mount —
  // otherwise a hero image already centered on page load would pop instantly).
  useEffect(() => {
    if (!window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const rect = entry.boundingClientRect;
        const viewportCenter = window.innerHeight / 2;
        const elCenter = rect.top + rect.height / 2;
        const band = window.innerHeight * CENTER_BAND_RATIO;
        const isCentered = entry.isIntersecting && Math.abs(elCenter - viewportCenter) < band;

        if (isFirstObservation.current) {
          isFirstObservation.current = false;
          wasCentered.current = isCentered;
          return;
        }

        if (isCentered && !wasCentered.current) {
          wasCentered.current = true;
          setOpen(true);
        } else if (!isCentered) {
          wasCentered.current = false;
        }
      },
      { threshold: THRESHOLDS },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        draggable={false}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={className}
      />
      {open && (
        <ImageLightbox images={gallery} initialIndex={index} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
