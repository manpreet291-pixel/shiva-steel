import { asset } from '../data/site.js';

// Emblem taken from the SHIVA STEEL visiting card (public/logo.png), shown on a white badge.
export default function Logo() {
  return (
    <span className="logo">
      <span className="logo__badge">
        <img src={asset('logo.png')} alt="" width="40" height="40" />
      </span>
      <span className="logo__text">
        SHIVA <b>STEEL</b>
      </span>
    </span>
  );
}
