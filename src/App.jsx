import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Products from './components/Products.jsx';
import WhyChoose from './components/WhyChoose.jsx';
import GallerySection from './components/GallerySection.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppFloat from './components/WhatsAppFloat.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import PageHero from './components/PageHero.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import { Link, useLocation } from './lib/router.jsx';

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Products />
      <WhyChoose />
      <GallerySection />
      <Contact />
    </>
  );
}

function NotFound() {
  return (
    <>
      <PageHero title="Page not found" text="The page you are looking for does not exist." />
      <section className="section">
        <div className="container center-buttons">
          <Link to="/" className="btn btn--dark">Back to Home</Link>
        </div>
      </section>
    </>
  );
}

export default function App() {
  const { path, hash, n } = useLocation();

  // After navigation: jump to the #section if there is one, otherwise to the top.
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    return undefined;
  }, [path, hash, n]);

  const clean = path.replace(/\/+$/, '') || '/';

  if (clean === '/admin') return <AdminPage />;

  let page;
  if (clean === '/') page = <Home />;
  else if (clean === '/gallery') page = <GalleryPage />;
  else if (clean.startsWith('/gallery/')) page = <CategoryPage slug={decodeURIComponent(clean.slice('/gallery/'.length))} />;
  else page = <NotFound />;

  return (
    <>
      <ScrollProgress />
      <Header solid={clean !== '/'} />
      <main key={clean} className="page">{page}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
