import SocialLinks from './SocialLinks.jsx';
import { WhatsAppIcon } from './ProductCard.jsx';
import { Link } from '../lib/router.jsx';
import { products } from '../data/products.js';
import { SITE, whatsappLink } from '../data/site.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <h4>Follow Us</h4>
          <SocialLinks />
          <p className="footer__about">
            Steel fabrication, gates, railings and architectural steel accessories in Kharar, Mohali.
          </p>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
        </div>

        <nav aria-label="Quick navigation">
          <h4>Quick Navigation</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/#about">About Us</Link></li>
            <li><Link to="/#products">Products</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/#contact">Contact Us</Link></li>
          </ul>
        </nav>

        <div>
          <h4>Product Categories</h4>
          <ul>
            {products.map((p) => (
              <li key={p.id}><Link to={`/#product-${p.id}`}>{p.title}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Contact Details</h4>
          <ul>
            <li>{SITE.owner}</li>
            <li><a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a></li>
            <li>
              {SITE.addressLines.map((l) => (
                <span key={l}>{l}<br /></span>
              ))}
            </li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          © {new Date().getFullYear()} SHIVA STEEL. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
