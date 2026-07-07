"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const goToPrev = () => {
    setIndex((p) => (p - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setIndex((p) => (p + 1) % images.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 40) {
      touchDeltaX.current < 0 ? goToNext() : goToPrev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Main image */}
      <div
        className="relative w-full h-full flex items-center justify-center touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={index}
          src={images[index]}
          alt={`Image ${index + 1}`}
          className="max-w-full max-h-full object-contain animate-fade-in"
        />

        {/* Navigation buttons (desktop) */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="hidden md:grid absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              className="hidden md:grid absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-3 py-1 rounded">
            {index + 1} / {images.length}
          </div>
        )}

        {/* Dots navigation (mobile) */}
        {images.length > 1 && (
          <div className="absolute bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/40"}`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-in-backdrop {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(24px);
          }
        }
        :global(.animate-fade-in) {
          animation: fade-in 0.2s ease-in-out;
        }
        :global(.animate-fade-in-backdrop) {
          animation: fade-in-backdrop 0.25s ease-out;
        }
      `}</style>
    </div>,
    document.body,
  );
}
