import { useEffect, useRef } from 'react';
import { asset } from '../data/site.js';

// items: [{ image, title }]; index: number; onClose(); onIndex(newIndex)
export default function Lightbox({ items, index, onClose, onIndex }) {
  const closeRef = useRef(null);
  const total = items.length;
  const item = items[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % total);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + total) % total);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, total, onClose, onIndex]);

  if (!item) return null;
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      <button ref={closeRef} type="button" className="lightbox__btn lightbox__close" onClick={onClose} aria-label="Close">
        ×
      </button>
      {total > 1 && (
        <button
          type="button"
          className="lightbox__btn lightbox__prev"
          onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + total) % total); }}
          aria-label="Previous image"
        >
          ‹
        </button>
      )}
      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        <img src={asset(item.image)} alt={item.title} />
        <figcaption>
          {item.title} <span className="lightbox__count">({index + 1} / {total})</span>
        </figcaption>
      </figure>
      {total > 1 && (
        <button
          type="button"
          className="lightbox__btn lightbox__next"
          onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % total); }}
          aria-label="Next image"
        >
          ›
        </button>
      )}
    </div>
  );
}
