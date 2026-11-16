import { Link } from '../lib/router.jsx';
import { asset } from '../data/site.js';

export default function CategoryTile({ category }) {
  return (
    <Link to={`/gallery/${category.slug}`} className="tile" aria-label={`${category.name} gallery`}>
      {category.cover ? (
        <img src={asset(category.cover)} alt="" loading="lazy" width="800" height="600" />
      ) : (
        <div className="tile__empty" />
      )}
      <span className="tile__info">
        <small>{category.count} {category.count === 1 ? 'photo' : 'photos'}</small>
        <strong>{category.name}</strong>
        <span className="tile__more">View gallery →</span>
      </span>
    </Link>
  );
}
