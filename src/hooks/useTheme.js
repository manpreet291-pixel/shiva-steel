import { useCallback, useEffect, useState } from 'react';

const KEY = 'ss-theme';
const byHour = () => {
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? 'light' : 'dark'; // light = day, dark = night
};
const current = () => document.documentElement.dataset.theme || 'light';

function apply(theme, animate) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add('theme-anim');
    window.setTimeout(() => root.classList.remove('theme-anim'), 900);
  }
  root.dataset.theme = theme;
}

// Day/night mode. Until the visitor picks one, it follows the local time (6am-6pm = day).
export default function useTheme() {
  const [theme, setTheme] = useState(current);

  useEffect(() => {
    const id = window.setInterval(() => {
      let saved = null;
      try { saved = localStorage.getItem(KEY); } catch { /* ignore */ }
      if (!saved && byHour() !== current()) {
        apply(byHour(), true);
        setTheme(byHour());
      }
    }, 60000);
    return () => window.clearInterval(id);
  }, []);

  const toggle = useCallback(() => {
    const next = current() === 'dark' ? 'light' : 'dark';
    apply(next, true);
    setTheme(next);
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
  }, []);

  return [theme, toggle];
}
