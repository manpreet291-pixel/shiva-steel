import ContactForm from './ContactForm.jsx';
import useReveal from '../hooks/useReveal.js';
import { SITE, mapsEmbed, mapsLink } from '../data/site.js';

export default function Contact() {
  const ref = useReveal();
  return (
    <section id="contact" className="section section--grey">
      <div className="container">
        <div className="section__head reveal" ref={ref}>
          <p className="eyebrow eyebrow--dark">Contact Us</p>
          <h2 className="section__title">Let&apos;s discuss your steel project</h2>
        </div>

        <div className="contact">
          <div className="contact__info">
            <ul className="info">
              <li>
                <span className="info__label">Owner</span>
                <span>{SITE.owner}</span>
              </li>
              <li>
                <span className="info__label">Phone</span>
                <a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a>
              </li>
              <li>
                <span className="info__label">Address</span>
                <address>
                  {SITE.addressLines.map((l) => (
                    <span key={l}>{l}<br /></span>
                  ))}
                </address>
              </li>
            </ul>
            <div className="contact__buttons">
              <a href={`tel:${SITE.phoneTel}`} className="btn btn--dark">Call Now</a>
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn btn--outline-dark">
                Open in Google Maps
              </a>
            </div>
            <div className="map">
              <iframe
                title="SHIVA STEEL location on Google Maps"
                src={mapsEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
