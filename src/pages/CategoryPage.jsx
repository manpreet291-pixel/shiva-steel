import { useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { WhatsAppIcon } from '../components/ProductCard.jsx';
import { Link } from '../lib/router.jsx';
import useGallery from '../hooks/useGallery.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { products } from '../data/products.js';
import { asset, whatsappLink } from '../data/site.js';

export default function CategoryPage({ slug }) {
  const { categories, items, loading } = useGallery();
  const [active, setActive] = useState(null);
  const category = categories.find((c) => c.slug === slug);
  const photos = category ? items.filter((i) => i.categoryId === category.id) : [];
  const product = category ? products.find((p) => p.id === category.productId) : null;

  usePageMeta({
    title: category ? `${category.name} Gallery | SHIVA STEEL, Kharar, Mohali` : 'Gallery | SHIVA STEEL',
    description: category
      ? `${category.name} by SHIVA STEEL, Kharar, Mohali. ${category.description}`.slice(0, 300)
      : undefined,
  });

  if (loading) {
    return <section className="section"><div className="container"><p className="empty">Loading…</p></div></section>;
  }
  if (!category) {
    return (
      <>
        <PageHero title="Gallery not found" text="We could not find that gallery category." />
        <section className="section">
          <div className="container center-buttons">
            <Link to="/gallery" className="btn btn--dark">Back to Gallery</Link>
          </div>
        </section>
      </>
    );
  }

  const message = `Hello SHIVA STEEL, I saw your ${category.name} gallery. Please share more details.`;

  return (
    <>
      <PageHero eyebrow="Gallery" title={category.name} text={category.description}>
        <div className="page-hero__buttons">
          {product ? (
            <Link to={`/#product-${product.id}`} className="btn btn--gold">
              Explore {product.title}
            </Link>
          ) : (
            <Link to="/#products" className="btn btn--gold">Explore Our Products</Link>
          )}
          <Link to="/#products" className="btn btn--outline">All Products</Link>
        </div>
      </PageHero>

      <section className="section">
        <div className="container">
          <nav className="chips" aria-label="Gallery categories">
            <Link to="/gallery" className="chip">All</Link>
            {categories.map((c) => (
              <Link key={c.id} to={`/gallery/${c.slug}`} className={`chip ${c.id === category.id ? 'chip--active' : ''}`} aria-current={c.id === category.id ? 'page' : undefined}>
                {c.name}
              </Link>
            ))}
          </nav>

          {photos.length === 0 ? (
            <p className="empty">Photos for this category are coming soon. Message us on WhatsApp to see our latest work.</p>
          ) : (
            <div className="gallery">
              {photos.map((g, i) => (
                <button type="button" key={g.id} className="gallery__item" onClick={() => setActive(i)} aria-label={`Open image: ${g.title}`}>
                  <img src={asset(g.image)} alt={`${g.title} by SHIVA STEEL`} loading="lazy" width="800" height="600" />
                  {g.sample && <span className="gallery__sample">Sample image</span>}
                  <span className="gallery__caption"><small>{category.name}</small>{g.title}</span>
                </button>
              ))}
            </div>
          )}

          <div className="cta-band">
            <div>
              <h2>Like what you see?</h2>
              <p>Tell us what you need and we will help with design and measurements.</p>
            </div>
            <div className="cta-band__buttons">
              <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
                <WhatsAppIcon /> Inquire on WhatsApp
              </a>
              <Link to="/#products" className="btn btn--gold">Explore Our Products</Link>
            </div>
          </div>
        </div>
      </section>

      {active !== null && <Lightbox items={photos} index={active} onClose={() => setActive(null)} onIndex={setActive} />}
    </>
  );
}
