import { useEffect, useState } from 'react';
import { Link } from '../lib/router.jsx';
import useGallery from '../hooks/useGallery.js';
import { whatsappLink } from '../data/site.js';

// Shown until you upload your own banner images in the admin panel (Banners tab).
const DEFAULT_SLIDES = [{ id: 'default', image: 'images/hero-day.svg' }];
const INTERVAL = 6500;

// [left %, size px, rise seconds, delay seconds, drift px]
const SPARKS = [[8.4, 4.5, 8.1, 1.0, 0], [51.9, 4.2, 5.7, 4.1, 6], [53.8, 2.5, 8.2, 4.2, 27], [35.6, 4.7, 6.3, 6.6, 12], [82.0, 2.3, 7.7, 0.6, -20], [81.4, 2.8, 8.4, 6.4, 4], [82.1, 2.6, 8.5, 1.7, -36], [74.9, 3.9, 6.7, 1.8, -37], [71.1, 5.0, 9.9, 6.5, 38], [21.2, 4.9, 6.5, 3.6, 0], [22.0, 2.3, 7.1, 2.4, -4], [75.0, 2.6, 8.5, 6.1, -38], [51.1, 2.3, 7.0, 6.4, -34], [63.2, 4.0, 8.4, 0.2, 3]];
// Glowing sparks rising over the banner
function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      {SPARKS.map(([l, s, d, dl, x], i) => (
        <span key={`p${i}`} className="spark" style={{ left: `${l}%`, '--s': `${s}px`, '--d': `${d}s`, '--dl': `${dl}s`, '--x': `${x}px` }} />
      ))}
    </div>
  );
}

export default function Hero() {
  const { banners, loading } = useGallery();
  const slides = loading ? [] : banners.length ? banners.map((b) => ({ id: b.id, image: b.image })) : DEFAULT_SLIDES;
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => window.clearInterval(t);
  }, [count, paused]);

  const go = (i) => setIndex((i + count) % count);
  const asset = (p) => (/^(https?:)?\/\//.test(p) || p.startsWith('/') ? p : `${import.meta.env.BASE_URL}${p}`);

  return (
    <section id="home" className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {slides.map((s, i) => (
        <div key={s.id} className={`hero__slide ${i === index ? 'is-active' : ''}`} aria-hidden={i !== index}>
          <div className="hero__bg" style={{ backgroundImage: `url(${asset(s.image)})` }} />
        </div>
      ))}
      <div className="hero__overlay" />
      <Sky />
      <div className="container hero__content">
        <p className="eyebrow">Kharar · Mohali · Punjab</p>
        <h1 className="hero__title">
          Premium Steel Gates <span>&amp; Architectural Designs</span>
        </h1>
        <p className="hero__sub">
          Combining Strength, Security and Modern Design to Transform Your Spaces.
        </p>
        <div className="hero__buttons">
          <Link to="/#products" className="btn btn--gold">
            Explore Our Products
          </Link>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
            Contact Us on WhatsApp
          </a>
        </div>
      </div>

      {count > 1 && (
        <div className="hero__nav">
          <button type="button" className="hero__arrow" onClick={() => go(index - 1)} aria-label="Previous banner">‹</button>
          <div className="hero__dots">
            {slides.map((s, i) => (
              <button key={s.id} type="button" className={`hero__dot ${i === index ? 'is-active' : ''}`} onClick={() => go(i)} aria-label={`Show banner ${i + 1}`} />
            ))}
          </div>
          <button type="button" className="hero__arrow" onClick={() => go(index + 1)} aria-label="Next banner">›</button>
        </div>
      )}

      <Link to="/#about" className="hero__scroll" aria-label="Scroll to About section">
        <span />
      </Link>
    </section>
  );
}
