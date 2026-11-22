import { useEffect, useState } from 'react';
import { Link } from '../lib/router.jsx';
import useGallery from '../hooks/useGallery.js';
import { whatsappLink } from '../data/site.js';

// Shown until you upload your own banner images in the admin panel (Banners tab).
const DEFAULT_SLIDES = [{ id: 'default', day: 'images/hero-day.svg', night: 'images/hero.svg' }];
const INTERVAL = 6500;

// [left %, top %, size px, twinkle seconds, delay seconds]
const STARS = [[59.7, 18.0, 1.7, 4.1, 4.0], [10.3, 58.7, 3.1, 2.7, 1.3], [34.2, 46.4, 3.0, 4.4, 0.1], [1.0, 26.0, 2.6, 3.8, 0.9], [0.8, 33.8, 1.3, 4.7, 2.2], [44.6, 57.9, 2.2, 4.4, 1.8], [42.6, 23.6, 2.8, 2.4, 3.3], [73.4, 38.0, 1.2, 2.9, 3.7], [61.2, 24.9, 1.1, 4.6, 0.6], [48.0, 24.5, 1.5, 2.5, 0.4], [27.4, 48.9, 1.5, 3.8, 2.4], [87.7, 38.8, 1.7, 2.0, 2.1], [27.1, 58.3, 2.1, 4.0, 2.4], [46.9, 32.3, 1.9, 4.2, 0.5], [26.0, 43.6, 2.7, 2.0, 2.2], [51.8, 15.8, 2.6, 4.8, 3.4], [32.0, 13.3, 1.2, 3.9, 3.9], [94.1, 53.8, 1.7, 3.1, 3.3], [76.7, 4.1, 1.7, 2.6, 0.1], [82.3, 59.8, 1.9, 3.6, 2.7], [13.1, 16.4, 3.0, 2.8, 2.0], [67.7, 40.3, 1.8, 2.5, 0.3], [65.8, 19.1, 1.3, 4.7, 0.6], [73.1, 60.0, 1.5, 4.7, 3.7], [17.9, 45.4, 2.2, 3.5, 1.2], [56.8, 27.5, 2.5, 3.2, 1.8], [5.4, 46.1, 2.0, 3.9, 3.9], [12.1, 53.3, 2.1, 2.7, 1.2], [58.5, 56.4, 1.7, 4.3, 0.6], [42.1, 44.0, 2.0, 4.6, 0.1], [13.6, 8.9, 2.9, 3.2, 2.8], [27.8, 23.5, 2.2, 4.3, 2.9], [60.1, 41.5, 1.8, 2.3, 1.1], [30.0, 41.7, 2.3, 3.3, 3.9], [17.6, 25.9, 1.3, 4.2, 0.9], [2.2, 19.9, 2.2, 2.5, 1.5]];
// [left %, size px, rise seconds, delay seconds, drift px]
const SPARKS = [[8.4, 4.5, 8.1, 1.0, 0], [51.9, 4.2, 5.7, 4.1, 6], [53.8, 2.5, 8.2, 4.2, 27], [35.6, 4.7, 6.3, 6.6, 12], [82.0, 2.3, 7.7, 0.6, -20], [81.4, 2.8, 8.4, 6.4, 4], [82.1, 2.6, 8.5, 1.7, -36], [74.9, 3.9, 6.7, 1.8, -37], [71.1, 5.0, 9.9, 6.5, 38], [21.2, 4.9, 6.5, 3.6, 0], [22.0, 2.3, 7.1, 2.4, -4], [75.0, 2.6, 8.5, 6.1, -38], [51.1, 2.3, 7.0, 6.4, -34], [63.2, 4.0, 8.4, 0.2, 3]];
const CLOUDS = [
  { top: '14%', w: '260px', dur: '70s', delay: '-10s' },
  { top: '26%', w: '180px', dur: '95s', delay: '-55s' },
  { top: '8%', w: '320px', dur: '120s', delay: '-80s' },
];

// Clouds by day, twinkling stars by night, glowing sparks all the time.
function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      {STARS.map(([l, t, s, d, dl], i) => (
        <span key={`s${i}`} className="star" style={{ left: `${l}%`, top: `${t}%`, '--s': `${s}px`, '--d': `${d}s`, '--dl': `${dl}s` }} />
      ))}
      {CLOUDS.map((c, i) => (
        <span key={`c${i}`} className="cloud" style={{ top: c.top, '--w': c.w, '--dur': c.dur, '--dl': c.delay }} />
      ))}
      {SPARKS.map(([l, s, d, dl, x], i) => (
        <span key={`p${i}`} className="spark" style={{ left: `${l}%`, '--s': `${s}px`, '--d': `${d}s`, '--dl': `${dl}s`, '--x': `${x}px` }} />
      ))}
    </div>
  );
}

export default function Hero() {
  const { banners, loading } = useGallery();
  const slides = loading ? [] : banners.length ? banners.map((b) => ({ id: b.id, day: b.image, night: b.image })) : DEFAULT_SLIDES;
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
          <div className="hero__bg hero__bg--day" style={{ backgroundImage: `url(${asset(s.day)})` }} />
          <div className="hero__bg hero__bg--night" style={{ backgroundImage: `url(${asset(s.night)})` }} />
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
