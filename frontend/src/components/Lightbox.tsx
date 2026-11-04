import { tr } from '../lib/i18n';
import React, { useCallback, useEffect } from 'react';
import { optimizeImage } from '../lib/content';
import { CaretLeft, CaretRight, X } from './icons';

interface LightboxProps {
  images: string[];
  /** Index of the photo shown, or null when closed. */
  index: number | null;
  title: string;
  onChange: (index: number | null) => void;
}

const buttonClass =
  'absolute grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-700 focus-visible:bg-white focus-visible:text-brand-700';

/** Full-screen photo viewer: arrows / swipe-free buttons, ← → to move, Esc to close. */
export const Lightbox: React.FC<LightboxProps> = ({ images, index, title, onChange }) => {
  const open = index !== null;
  const count = images.length;
  const move = useCallback((delta: number) => onChange(index === null ? null : (index + delta + count) % count), [index, count, onChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onChange(null);
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, move, onChange]);

  if (index === null) return null;
  return (
    <div className="no-print fixed inset-0 z-[70] bg-brand-950/95" role="dialog" aria-modal="true" aria-label={title} onClick={() => onChange(null)}>
      <img
        key={index}
        src={optimizeImage(images[index], 1600)}
        alt={`${title} – ảnh ${index + 1}`}
        className="absolute inset-0 m-auto max-h-[88vh] max-w-[94vw] animate-fade-up object-contain"
        onClick={(event) => event.stopPropagation()}
      />
      <span className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-[13px] font-semibold tabular-nums text-white backdrop-blur">
        {index + 1} / {count}
      </span>
      <button type="button" aria-label={tr('Đóng')} onClick={() => onChange(null)} className={`${buttonClass} right-4 top-4`}>
        <X className="size-5" />
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label={tr('Ảnh trước')}
            onClick={(event) => {
              event.stopPropagation();
              move(-1);
            }}
            className={`${buttonClass} left-3 top-1/2 -translate-y-1/2 sm:left-5`}
          >
            <CaretLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label={tr('Ảnh tiếp theo')}
            onClick={(event) => {
              event.stopPropagation();
              move(1);
            }}
            className={`${buttonClass} right-3 top-1/2 -translate-y-1/2 sm:right-5`}
          >
            <CaretRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );
};
