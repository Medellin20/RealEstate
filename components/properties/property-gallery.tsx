'use client';

import * as React from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import type { PropertyImage } from '@/types/database';
import { cn } from '@/lib/utils/cn';

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [active, setActive] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-ink-100 text-ink-300">
        Aucune photo disponible
      </div>
    );
  }

  function next() {
    setActive((i) => (i + 1) % images.length);
  }
  function prev() {
    setActive((i) => (i - 1 + images.length) % images.length);
  }

  React.useEffect(() => {
    if (!fullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen]);

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-ink-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={images[active].url}
              alt={images[active].alt_text || title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-soft transition-transform hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-soft transition-transform hover:scale-105"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <button
          onClick={() => setFullscreen(true)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-soft"
        >
          <Expand className="h-3.5 w-3.5" />
          {active + 1} / {images.length}
        </button>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                'relative h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition-all',
                i === active ? 'ring-ink-700' : 'ring-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-ink-950/95 p-4"
          >
            <button
              onClick={() => setFullscreen(false)}
              aria-label="Fermer"
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="relative h-[80vh] w-full max-w-5xl">
              <Image
                src={images[active].url}
                alt={images[active].alt_text || title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <button
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
