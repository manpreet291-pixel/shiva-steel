import CategoryTile from './CategoryTile.jsx';
import { Link } from '../lib/router.jsx';
import useReveal from '../hooks/useReveal.js';
import useGallery from '../hooks/useGallery.js';

// Home page gallery: one tile per category, each opening its own gallery page.
export default function GallerySection() {
  const ref = useReveal();
  const { categories } = useGallery();
  const gridRef = useReveal(categories.length);
  return (
    <section id="gallery" className="section">
      <div className="container">
        <div className="section__head reveal" ref={ref}>
          <p className="eyebrow eyebrow--dark">Featured Projects / Gallery</p>
          <h2 className="section__title">A look at our steel work</h2>
          <p className="section__lead">Choose a category to see photos of that work.</p>
        </div>
        <div className="tiles stagger" ref={gridRef}>
          {categories.map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>
        <div className="center-buttons">
          <Link to="/gallery" className="btn btn--dark">View Full Gallery</Link>
          <Link to="/#products" className="btn btn--outline-dark">Explore Our Products</Link>
        </div>
      </div>
    </section>
  );
}
