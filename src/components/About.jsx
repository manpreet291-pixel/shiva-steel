import { Link } from '../lib/router.jsx';
import useReveal from '../hooks/useReveal.js';
import { SITE, asset } from '../data/site.js';

export default function About() {
  const ref = useReveal();
  return (
    <section id="about" className="section">
      <div className="container about reveal" ref={ref}>
        <div className="about__media">
          <img
            src={asset('images/custom-fabrication.svg')}
            alt="Steel fabrication work at SHIVA STEEL"
            loading="lazy"
          />
          <div className="about__badge">Custom · Modern · Built to Order</div>
        </div>
        <div className="about__text">
          <p className="eyebrow eyebrow--dark">About Us</p>
          <h2 className="section__title">Steel work shaped around your requirements</h2>
          <p>
            SHIVA STEEL is a steel fabrication business owned by {SITE.owner}, based in Kharar,
            Mohali. We make gates, railings and architectural steel accessories for homes and
            other spaces.
          </p>
          <p>
            Our focus is on custom steel designs, careful craftsmanship and modern styles. Every
            piece is planned around what you need, from a villa main gate to a staircase railing
            or a custom fabrication job.
          </p>
          <Link to="/#contact" className="btn btn--dark">
            Talk to Us
          </Link>
        </div>
      </div>
    </section>
  );
}
