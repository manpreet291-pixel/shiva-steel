import { useEffect, useState } from 'react';
import { Link } from '../lib/router.jsx';
import { asset, whatsappLink } from '../data/site.js';

export default function ProductCard({ product, image, galleryHref }) {
  const wanted = image || product.image;
  const [src, setSrc] = useState(wanted);
  useEffect(() => setSrc(wanted), [wanted]);
  const message = `Hello SHIVA STEEL, I am interested in ${product.title}. Please share more details.`;
  return (
    <article className="card" id={`product-${product.id}`}>
      <div className="card__media">
        <img
          key={src}
          src={asset(src)}
          alt={product.alt}
          loading="lazy"
          width="800"
          height="600"
          onError={() => src !== product.image && setSrc(product.image)}
        />
      </div>
      <div className="card__body">
        <h3 className="card__title">{product.title}</h3>
        <p className="card__text">{product.description}</p>
        {galleryHref && (
          <Link to={galleryHref} className="card__gallery">
            View photo gallery →
          </Link>
        )}
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--whatsapp btn--block"
          aria-label={`Inquire about ${product.title} on WhatsApp`}
        >
          <WhatsAppIcon /> Inquire on WhatsApp
        </a>
      </div>
    </article>
  );
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8A13 13 0 0 0 16 29c7.2 0 13-5.8 13-13S23.2 3 16 3Zm0 23.6c-2 0-3.9-.6-5.5-1.6l-.4-.2-4 1 1.1-3.9-.3-.4A10.6 10.6 0 1 1 16 26.600Zm5.8-7.900c-.3-.2-1.900-.9-2.200-1-.3-.1-.5-.2-.7.2-.2.300-.8 1-1 1.200-.2.200-.4.200-.7.100-1.900-.9-3.100-1.700-4.300-3.700-.3-.6.300-.5.900-1.700.1-.2 0-.4 0-.5l-1-2.300c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1.100 1.100-1.100 2.600s1.100 3 1.300 3.200c.2.200 2.200 3.400 5.400 4.700 2 .8 2.800.9 3.800.7.600-.1 1.900-.8 2.200-1.500.3-.7.300-1.400.2-1.500-.1-.1-.3-.2-.6-.4Z" />
    </svg>
  );
}
