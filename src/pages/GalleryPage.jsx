import CategoryTile from '../components/CategoryTile.jsx';
import PageHero from '../components/PageHero.jsx';
import { Link } from '../lib/router.jsx';
import useGallery from '../hooks/useGallery.js';
import usePageMeta from '../hooks/usePageMeta.js';

export default function GalleryPage() {
  const { categories, loading } = useGallery();
  usePageMeta({
    title: 'Gallery | SHIVA STEEL, Steel Gates & Railings in Kharar, Mohali',
    description:
      'Photo gallery of steel gates, SS gates, railings, grilles, CNC gates and CNC chokhat by SHIVA STEEL, Kharar, Mohali.',
  });

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Our Steel Work"
        text="Pick a category to see photos of profile gates, SS gates, railings, CNC chokhat, door frames and more."
      >
        <div className="page-hero__buttons">
          <Link to="/#products" className="btn btn--gold">Explore Our Products</Link>
        </div>
      </PageHero>
      <section className="section">
        <div className="container">
          {loading ? (
            <p className="empty">Loading gallery…</p>
          ) : (
            <div className="tiles">
              {categories.map((c) => (
                <CategoryTile key={c.id} category={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
