import { useEffect, useRef } from 'react';

// Adds the "is-visible" class when the element scrolls into view (drives the fade-up and
// staggered animations). Pass a value that changes when the element first appears (e.g. loading).
export default function useReveal(dep) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [dep]);

  return ref;
}
