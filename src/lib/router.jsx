// Tiny history-based router (no extra dependency).
import { useEffect, useState } from 'react';

let nonce = 0;

export function navigate(to) {
  window.history.pushState({}, '', to);
  nonce += 1;
  window.dispatchEvent(new Event('app:navigate'));
}

const read = () => ({ path: window.location.pathname, hash: window.location.hash, n: nonce });

export function useLocation() {
  const [loc, setLoc] = useState(read);
  useEffect(() => {
    const update = () => setLoc(read());
    window.addEventListener('popstate', update);
    window.addEventListener('app:navigate', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('app:navigate', update);
    };
  }, []);
  return loc;
}

export function Link({ to, onClick, children, ...rest }) {
  const handle = (e) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
