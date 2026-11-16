import { Link } from '../lib/router.jsx';
import { asset, whatsappLink } from '../data/site.js';

export default function Hero() {
  return (
    <section id="home" className="hero" style={{ backgroundImage: `url(${asset('images/hero.svg')})` }}>
      <div className="hero__overlay" />
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
      <Link to="/#about" className="hero__scroll" aria-label="Scroll to About section">
        <span />
      </Link>
    </section>
  );
}
