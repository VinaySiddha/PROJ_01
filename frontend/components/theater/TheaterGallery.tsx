/**
 * @file TheaterGallery.tsx
 * @description Responsive image gallery for a theater with a Framer Motion lightbox.
 * Client Component — manages lightbox open state and keyboard navigation.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface TheaterGalleryProps {
  /** Array of image URLs for the gallery. */
  images: string[];
  /** Theater name used for accessible alt text. */
  theaterName: string;
}

/**
 * Theater image gallery with grid layout and fullscreen lightbox.
 * Lightbox supports prev/next navigation and keyboard (Escape, Arrow keys).
 */
export function TheaterGallery({ images, theaterName }: TheaterGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openLightbox = (idx: number) => setActiveIndex(idx);
  const closeLightbox = () => setActiveIndex(null);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIndex, goPrev, goNext]);

  if (!images.length) {
    return <p className="text-sm text-gray-500 text-center py-8">No images available.</p>;
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {images.map((src, idx) => (
          <button
            key={src + idx}
            type="button"
            onClick={() => openLightbox(idx)}
            className="relative group aspect-video rounded-lg overflow-hidden bg-[#1A1A1A] border border-white/10
                       hover:border-[#D4A017]/50 transition-all duration-200 focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-[#D4A017]"
            aria-label={`View image ${idx + 1} of ${images.length} — ${theaterName}`}
          >
            <Image
              src={src}
              alt={`${theaterName} — image ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
              <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Image container — stop propagation so clicking image doesn't close */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-4xl mx-4 aspect-video rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[activeIndex]}
                alt={`${theaterName} — image ${activeIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Controls */}
            <button onClick={closeLightbox} aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-300 bg-black/50 px-3 py-1 rounded-full">
              {activeIndex + 1} / {images.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
