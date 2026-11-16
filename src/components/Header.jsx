import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';
import { Link } from '../lib/router.jsx';
import { whatsappLink } from '../data/site.js';

const links = [
  { to: '/', label: 'Home' },
  { to: '/#about', label: 'About Us' },
  { to: '/#products', label: 'Products' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/#contact', label: 'Contact Us' },
];

export default function Header({ solid = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`header ${scrolled || open || solid ? 'header--solid' : ''}`}>
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="SHIVA STEEL home" onClick={close}>
          <Logo />
        </Link>

        <nav className={`nav ${open ? 'nav--open' : ''}`} aria-label="Main navigation">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="nav__link" onClick={close}>
              {l.label}
            </Link>
          ))}
          <a
            href={whatsappLink('Hello SHIVA STEEL, I would like to get a quote for steel work.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--gold nav__cta"
            onClick={close}
          >
            Get a Quote
          </a>
        </nav>

        <button
          type="button"
          className={`burger ${open ? 'burger--open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
