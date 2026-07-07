"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const HOVER_DELAY = 250;
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
  const [lightbox, setLightbox] = useState(false);
  // Moderate hover preview — NOT the full-screen lightbox. The overlay is
  // pointer-events-none, so the cursor keeps interacting with the source
  // image underneath: leaving it closes the preview, clicks still work.
  const [preview, setPreview] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gallery = images && images.length > 0 ? images : [src];

  const handleMouseEnter = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    hoverTimer.current = setTimeout(() => setPreview(true), HOVER_DELAY);
  };
  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setPreview(false);
  };
  const handleClick = (e: React.MouseEvent) => {
    if (!openOnClick) return;
    e.preventDefault();
    e.stopPropagation();
    setPreview(false);
    setLightbox(true);
  };

  // Mobile (no hover): show the preview while the image sits near the center
  // of the viewport, and put it back as soon as it scrolls out of the band.
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
        setPreview(isCentered);
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
      {preview &&
        !lightbox &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none bg-black/25 backdrop-blur-[2px] animate-preview-fade">
            <img
              src={src}
              alt={alt}
              draggable={false}
              className="max-w-[min(72vw,760px)] max-h-[62vh] object-contain shadow-2xl animate-preview-pop"
            />
            <style jsx>{`
              @keyframes preview-pop {
                from {
                  opacity: 0;
                  transform: scale(0.92);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              @keyframes preview-fade {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              :global(.animate-preview-pop) {
                animation: preview-pop 0.18s ease-out;
              }
              :global(.animate-preview-fade) {
                animation: preview-fade 0.18s ease-out;
              }
            `}</style>
          </div>,
          document.body,
        )}
      {lightbox && (
        <ImageLightbox images={gallery} initialIndex={index} onClose={() => setLightbox(false)} />
      )}
    </>
  );
}
