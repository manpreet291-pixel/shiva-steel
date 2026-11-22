import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { asset } from '../data/site.js';

const MIN = 1;
const MAX = 5;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Full-screen photo viewer with zoom.
//  - Zoom: + / - buttons, mouse wheel, double-click / double-tap, pinch (touch)
//  - Move a zoomed photo by dragging it; swipe left/right (when not zoomed) for next/previous
//  - Keyboard: arrows, + / -, 0 to reset, Esc to close
// items: [{ image, title }]; index: number; onClose(); onIndex(newIndex)
export default function Lightbox({ items, index, onClose, onIndex }) {
  const total = items.length;
  const item = items[index];
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const imgRef = useRef(null);
  const closeRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null); // { type: 'drag' | 'pinch', ... }
  const lastTap = useRef(0);
  const state = useRef({ zoom: 1, pos: { x: 0, y: 0 } });
  state.current = { zoom, pos };

  const limit = useCallback((z, p) => {
    const img = imgRef.current;
    const w = img ? img.clientWidth : 0;
    const h = img ? img.clientHeight : 0;
    const mx = Math.max(0, ((z - 1) * w) / 2);
    const my = Math.max(0, ((z - 1) * h) / 2);
    return { x: clamp(p.x, -mx, mx), y: clamp(p.y, -my, my) };
  }, []);

  const applyZoom = useCallback(
    (next) => {
      const z = clamp(next, MIN, MAX);
      setZoom(z);
      setPos((p) => (z <= 1 ? { x: 0, y: 0 } : limit(z, p)));
    },
    [limit]
  );

  const reset = useCallback(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const goTo = useCallback(
    (i) => {
      reset();
      onIndex((i + total) % total);
    },
    [onIndex, reset, total]
  );

  // keyboard + scroll lock
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goTo(index + 1);
      else if (e.key === 'ArrowLeft') goTo(index - 1);
      else if (e.key === '+' || e.key === '=') applyZoom(state.current.zoom + 0.5);
      else if (e.key === '-' || e.key === '_') applyZoom(state.current.zoom - 0.5);
      else if (e.key === '0') reset();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, goTo, applyZoom, reset, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ---- pointer gestures on the stage ----
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const onImage = e.target === imgRef.current;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { type: 'pinch', startDist: Math.hypot(a.x - b.x, a.y - b.y) || 1, startZoom: state.current.zoom };
      setDragging(true);
    } else {
      gesture.current = {
        type: 'drag', onImage, moved: false,
        startX: e.clientX, startY: e.clientY,
        startPos: { ...state.current.pos },
      };
      setDragging(true);
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.type === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      applyZoom(g.startZoom * (dist / g.startDist));
      return;
    }
    if (g.type === 'drag') {
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true;
      if (state.current.zoom > 1) setPos(limit(state.current.zoom, { x: g.startPos.x + dx, y: g.startPos.y + dy }));
    }
  };

  const onPointerUp = (e) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) {
      gesture.current = null; // finished a pinch
      return;
    }
    setDragging(false);
    gesture.current = null;
    if (!g || g.type !== 'drag') return;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (g.moved) {
      // swipe to change photo (only when not zoomed in)
      if (state.current.zoom <= 1 && Math.abs(dx) > 60 && Math.abs(dy) < 90 && total > 1) goTo(index + (dx < 0 ? 1 : -1));
      return;
    }
    // a tap / click
    if (!g.onImage) {
      onClose(); // tapped the dark background
      return;
    }
    const now = Date.now();
    if (now - lastTap.current < 320) {
      lastTap.current = 0;
      if (state.current.zoom > 1) reset();
      else applyZoom(2.5);
    } else {
      lastTap.current = now;
    }
  };

  const onWheel = (e) => {
    applyZoom(state.current.zoom + (e.deltaY < 0 ? 0.4 : -0.4));
  };

  if (!item) return null;
  const zoomed = zoom > 1.01;

  // Rendered on <body> so page animations/transforms can't trap it under the header or float buttons.
  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="lb__top">
        <div className="lb__title">
          {item.title} <span>({index + 1} / {total})</span>
        </div>
        <div className="lb__tools">
          <button type="button" className="lb__btn" onClick={() => applyZoom(zoom - 0.5)} disabled={zoom <= MIN} aria-label="Zoom out">−</button>
          <span className="lb__zoom" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" className="lb__btn" onClick={() => applyZoom(zoom + 0.5)} disabled={zoom >= MAX} aria-label="Zoom in">+</button>
          <button type="button" className="lb__btn lb__btn--text" onClick={reset} disabled={!zoomed} aria-label="Reset zoom">Reset</button>
          <button ref={closeRef} type="button" className="lb__btn lb__close" onClick={onClose} aria-label="Close">×</button>
        </div>
      </div>

      <div
        className={`lb__stage ${zoomed ? 'is-zoomed' : ''} ${dragging ? 'is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <img
          key={item.image}
          ref={imgRef}
          className="lb__img"
          src={asset(item.image)}
          alt={item.title}
          draggable="false"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})` }}
        />
        {total > 1 && (
          <>
            <button type="button" className="lb__nav lb__nav--prev" onPointerDown={(e) => e.stopPropagation()} onClick={() => goTo(index - 1)} aria-label="Previous photo">‹</button>
            <button type="button" className="lb__nav lb__nav--next" onPointerDown={(e) => e.stopPropagation()} onClick={() => goTo(index + 1)} aria-label="Next photo">›</button>
          </>
        )}
      </div>

      <p className="lb__hint">Double-tap or scroll to zoom · drag to move · swipe or use arrows to change photo</p>

      {total > 1 && (
        <div className="lb__thumbs">
          {items.map((t, i) => (
            <button key={`${t.image}-${i}`} type="button" className={`lb__thumb ${i === index ? 'is-active' : ''}`} onClick={() => goTo(i)} aria-label={`Show photo ${i + 1}`}>
              <img src={asset(t.image)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
