import useGallery from '../hooks/useGallery.js';
import { SITE, mapsLink, whatsappLink } from '../data/site.js';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

const ICONS = {
  whatsapp: (
    <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8A13 13 0 0 0 16 29c7.2 0 13-5.8 13-13S23.2 3 16 3Zm0 23.6c-2 0-3.9-.6-5.5-1.6l-.4-.2-4 1 1.1-3.9-.3-.4A10.6 10.6 0 1 1 16 26.6Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1.9-.9-3.1-1.7-4.3-3.7-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.2 3.4 5.4 4.7 2 .8 2.8.9 3.8.7.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4Z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" width="20" height="20" {...stroke} aria-hidden="true">
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
    </svg>
  ),
  // map: (
  //   <svg viewBox="0 0 24 24" width="20" height="20" {...stroke} aria-hidden="true">
  //     <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.500-7 11-7 11Z" />
  //     <circle cx="12" cy="10" r="2.5" />
  //   </svg>
  // ),
  instagram: (
    <svg viewBox="0 0 24 24" width="20" height="20" {...stroke} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M14 8.5V6.9c0-.8.2-1.2 1.300-1.200H17V2.600C16.600 2.500 15.600 2.400 14.500 2.400 12 2.400 10.300 3.900 10.300 6.600v1.900H7.500V12h2.800v9.600H14V12h2.700l.5-3.500H14Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="2.5" y="5.500" width="19" height="13" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 9.200v5.600l4.800-2.800L10 9.200Z" fill="currentColor" />
    </svg>
  ),
};

// Footer icons. WhatsApp, call and map always show (from site.js). Instagram, Facebook and YouTube
// show as soon as you add their links in the admin panel (Settings tab).
export default function SocialLinks() {
  const { settings } = useGallery();
  const s = settings?.social || {};
  const list = [
    s.instagram && { key: 'instagram', label: 'Instagram', href: s.instagram },
    s.facebook && { key: 'facebook', label: 'Facebook', href: s.facebook },
    s.youtube && { key: 'youtube', label: 'YouTube', href: s.youtube },
    { key: 'whatsapp', label: 'WhatsApp', href: whatsappLink() },
    { key: 'phone', label: `Call ${SITE.phoneDisplay}`, href: `tel:${SITE.phoneTel}`, internal: true },
   // { key: 'map', label: 'Find us on Google Maps', href: mapsLink },
  ].filter(Boolean);

  return (
    <ul className="social" aria-label="Social media and contact links">
      {list.map((l) => (
        <li key={l.key}>
          <a
            href={l.href}
            className={`social__link social__link--${l.key}`}
            aria-label={l.label}
            title={l.label}
            {...(l.internal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {ICONS[l.key]}
          </a>
        </li>
      ))}
    </ul>
  );
}
