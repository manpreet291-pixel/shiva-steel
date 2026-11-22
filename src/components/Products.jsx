import ProductCard from './ProductCard.jsx';
import useReveal from '../hooks/useReveal.js';
import useGallery from '../hooks/useGallery.js';
import { products } from '../data/products.js';

export default function Products() {
  const ref = useReveal();
  const gridRef = useReveal();
  const { categories, items } = useGallery();
  const galleryFor = (productId) => {
    const cat = categories.find((c) => c.productId === productId && c.count > 0) || categories.find((c) => c.productId === productId);
    return cat ? `/gallery/${cat.slug}` : '/gallery';
  };

  // The newest real photo uploaded to a gallery category linked to this product becomes its card image.
  const imageFor = (product) => {
    const ids = new Set(categories.filter((c) => c.productId === product.id).map((c) => c.id));
    const photo = items.find((i) => ids.has(i.categoryId) && !i.sample);
    return photo ? photo.image : product.image;
  };

  return (
    <section id="products" className="section section--grey">
      <div className="container">
        <div className="section__head reveal" ref={ref}>
          <p className="eyebrow eyebrow--dark">Our Products</p>
          <h2 className="section__title">Steel gates, railings &amp; architectural fabrication</h2>
          <p className="section__lead">
            Browse our categories and message us on WhatsApp for any product you like.
          </p>
        </div>
        <div className="grid stagger" ref={gridRef}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} image={imageFor(p)} galleryHref={galleryFor(p.id)} />
          ))}
        </div>
        <p className="note">Photos update automatically from the gallery. Tap "View photo gallery" to see more of our work.</p>
      </div>
    </section>
  );
}
