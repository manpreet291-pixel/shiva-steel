import { WhatsAppIcon } from './ProductCard.jsx';
import { SITE, whatsappLink } from '../data/site.js';

export default function WhatsAppFloat() {
  return (
    <div className="float">
      <a href={`tel:${SITE.phoneTel}`} className="float__btn float__btn--call" aria-label="Call SHIVA STEEL">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M6.600 10.800a15.100 15.100 0 0 0 6.600 6.600l2.200-2.200c.3-.3.700-.4 1-.2 1.100.4 2.300.6 3.600.6.600 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.400-1 1-1h3.500c.6 0 1 .4 1 1 0 1.300.2 2.500.6 3.600.1.300 0 .7-.2 1l-2.300 2.200Z" />
        </svg>
      </a>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="float__btn float__btn--wa"
        aria-label="Chat with SHIVA STEEL on WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
          <path d="M16 3C8.800 3 3 8.800 3 16c0 2.300.6 4.500 1.700 6.400L3 29l6.800-1.800A13 13 0 0 0 16 29c7.200 0 13-5.800 13-13S23.200 3 16 3Zm0 23.600c-2 0-3.900-.6-5.500-1.600l-.4-.2-4 1 1.100-3.900-.3-.4A10.600 10.600 0 1 1 16 26.600Zm5.800-7.900c-.3-.2-1.900-.9-2.200-1-.3-.1-.5-.2-.7.2-.2.300-.8 1-1 1.200-.2.200-.4.200-.7.100-1.900-.9-3.100-1.700-4.300-3.700-.3-.6.300-.5.900-1.700.1-.2 0-.4 0-.5l-1-2.300c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1.100 1.100-1.100 2.600s1.100 3 1.300 3.200c.2.200 2.200 3.400 5.400 4.700 2 .8 2.800.9 3.800.7.600-.1 1.900-.8 2.200-1.500.3-.7.300-1.400.2-1.500-.1-.1-.3-.2-.6-.4Z" />
        </svg>
      </a>
    </div>
  );
}
