import { useEffect } from 'react';

const DEFAULT_TITLE = 'SHIVA STEEL | Steel Gates, Railings & CNC Fabrication in Kharar, Mohali';

function setMeta(name, content) {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  const previous = el.getAttribute('content');
  el.setAttribute('content', content);
  return previous;
}

// Sets the page title, description and (optionally) noindex for the current page.
export default function usePageMeta({ title, description, noindex = false }) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;
    const prevDesc = description ? setMeta('description', description) : null;
    const prevRobots = noindex ? setMeta('robots', 'noindex, nofollow') : null;
    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      if (description && prevDesc) setMeta('description', prevDesc);
      if (noindex) {
        document.head.querySelector('meta[name="robots"]')?.remove();
        if (prevRobots) setMeta('robots', prevRobots);
      }
    };
  }, [title, description, noindex]);
}
