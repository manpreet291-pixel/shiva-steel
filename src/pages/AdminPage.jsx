import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '../lib/router.jsx';
import useGallery from '../hooks/useGallery.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { adminRequest, compressImage, loadGallery } from '../lib/api.js';
import { products } from '../data/products.js';
import { asset } from '../data/site.js';

export default function AdminPage() {
  usePageMeta({ title: 'Admin | SHIVA STEEL', noindex: true });
  const [status, setStatus] = useState({ loading: true, admin: false, configured: true });

  const check = useCallback(async () => {
    try {
      const me = await adminRequest('GET', '/api/me');
      setStatus({ loading: false, admin: me.admin, configured: me.configured });
    } catch {
      setStatus({ loading: false, admin: false, configured: true, offline: true });
    }
  }, []);
  useEffect(() => { check(); }, [check]);

  let body;
  if (status.loading) body = <p className="empty">Loading…</p>;
  else if (status.offline)
    body = <div className="admin-card"><h2>Backend not reachable</h2><p>The admin panel needs the server running (<code>npm run dev</code> or <code>npm start</code>).</p></div>;
  else if (!status.admin) body = <Login configured={status.configured} onDone={check} />;
  else body = <Dashboard onLogout={check} />;

  return (
    <div className="admin">
      <div className="admin__bar">
        <div className="container admin__bar-inner">
          <strong>SHIVA STEEL · Admin</strong>
          <Link to="/" className="admin__link">← View website</Link>
        </div>
      </div>
      <div className="container admin__main">{body}</div>
    </div>
  );
}

function Login({ configured, onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminRequest('POST', '/api/login', { password });
      await onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-card admin-card--narrow" onSubmit={submit}>
      <h2>Admin login</h2>
      {!configured && <p className="msg msg--err">No admin password is set on the server. Create a <code>.env</code> file with <code>ADMIN_PASSWORD=...</code> and restart.</p>}
      <div className="field">
        <label htmlFor="ad-pw">Password</label>
        <input id="ad-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="msg msg--err" role="alert">{error}</p>}
      <button className="btn btn--gold btn--block" disabled={busy || !password}>{busy ? 'Checking…' : 'Log in'}</button>
    </form>
  );
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('photos');
  const [notice, setNotice] = useState(null); // { type, text }
  const { categories, items, loading, offline } = useGallery();

  const say = (type, text) => setNotice({ type, text });
  const refresh = () => loadGallery(true);
  // Wraps an API call: refresh data, show errors, go back to login if the session expired.
  const run = async (fn, okText) => {
    try {
      const r = await fn();
      await refresh();
      if (okText) say('ok', okText);
      return r;
    } catch (err) {
      if (err.status === 401) onLogout();
      say('err', err.message);
      return null;
    }
  };

  const logout = async () => {
    try { await adminRequest('POST', '/api/logout'); } catch { /* ignore */ }
    onLogout();
  };

  return (
    <>
      <div className="admin__head">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'photos'} className={tab === 'photos' ? 'tab tab--on' : 'tab'} onClick={() => setTab('photos')}>Photos</button>
          <button role="tab" aria-selected={tab === 'categories'} className={tab === 'categories' ? 'tab tab--on' : 'tab'} onClick={() => setTab('categories')}>Categories</button>
        </div>
        <button className="btn btn--outline-dark btn--sm" onClick={logout}>Log out</button>
      </div>
      {notice && <p className={`msg msg--${notice.type}`} role="status">{notice.text}</p>}
      {offline && <p className="msg msg--err">Could not load data from the server.</p>}
      {loading ? <p className="empty">Loading…</p> : tab === 'photos'
        ? <PhotosTab categories={categories} items={items} run={run} say={say} />
        : <CategoriesTab categories={categories} run={run} />}
    </>
  );
}

function PhotosTab({ categories, items, run, say }) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [progress, setProgress] = useState('');
  const fileRef = useRef(null);

  const upload = async (e) => {
    e.preventDefault();
    const files = [...(fileRef.current?.files || [])];
    if (!categoryId) return say('err', 'Choose a category first.');
    if (!files.length) return say('err', 'Choose one or more photos.');
    let done = 0;
    for (const file of files) {
      setProgress(`Uploading ${done + 1} of ${files.length}…`);
      try {
        const image = await compressImage(file);
        await adminRequest('POST', '/api/items', { categoryId, image, title: files.length === 1 ? title : '' });
        done += 1;
      } catch (err) {
        say('err', `${file.name}: ${err.message}`);
        break;
      }
    }
    setProgress('');
    if (fileRef.current) fileRef.current.value = '';
    setTitle('');
    await run(async () => {}, done ? `${done} photo${done > 1 ? 's' : ''} added.` : null);
  };

  const shown = filter === 'all' ? items : items.filter((i) => i.categoryId === filter);

  return (
    <>
      <form className="admin-card" onSubmit={upload}>
        <h2>Add photos</h2>
        <div className="admin-row">
          <div className="field">
            <label htmlFor="up-cat">Category</label>
            <select id="up-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="up-title">Title (optional, for a single photo)</label>
            <input id="up-title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Main gate, Phase 7 Mohali" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="up-file">Photos (JPG, PNG or WebP, you can pick many)</label>
          <input id="up-file" ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple />
        </div>
        <button className="btn btn--gold" disabled={!!progress}>{progress || 'Upload'}</button>
        <p className="hint">Photos are resized automatically before upload.</p>
      </form>

      <div className="admin-card">
        <div className="admin__list-head">
          <h2>All photos ({shown.length})</h2>
          <select aria-label="Filter by category" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {shown.length === 0 ? <p className="empty">No photos here yet.</p> : (
          <div className="admin-grid">
            {shown.map((it) => <PhotoCard key={`${it.id}-${it.title}-${it.categoryId}`} item={it} categories={categories} run={run} />)}
          </div>
        )}
      </div>
    </>
  );
}

function PhotoCard({ item, categories, run }) {
  const [title, setTitle] = useState(item.title);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const dirty = title !== item.title || categoryId !== item.categoryId;
  return (
    <div className="photo">
      <img src={asset(item.image)} alt={item.title} loading="lazy" />
      {item.sample && <span className="gallery__sample">Sample image</span>}
      <input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} aria-label="Photo title" />
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Category">
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="photo__actions">
        <button className="btn btn--dark btn--sm" disabled={!dirty} onClick={() => run(() => adminRequest('PUT', `/api/items/${item.id}`, { title, categoryId }), 'Photo updated.')}>Save</button>
        <button className="btn btn--danger btn--sm" onClick={() => window.confirm('Delete this photo?') && run(() => adminRequest('DELETE', `/api/items/${item.id}`), 'Photo deleted.')}>Delete</button>
      </div>
    </div>
  );
}

function CategoriesTab({ categories, run }) {
  const [form, setForm] = useState({ name: '', description: '', productId: '' });
  const add = async (e) => {
    e.preventDefault();
    const r = await run(() => adminRequest('POST', '/api/categories', form), 'Category added.');
    if (r) setForm({ name: '', description: '', productId: '' });
  };
  return (
    <>
      <form className="admin-card" onSubmit={add}>
        <h2>Add a category</h2>
        <div className="admin-row">
          <div className="field">
            <label htmlFor="nc-name">Name</label>
            <input id="nc-name" value={form.name} maxLength={60} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <ProductSelect id="nc-prod" value={form.productId} onChange={(v) => setForm({ ...form, productId: v })} />
        </div>
        <div className="field">
          <label htmlFor="nc-desc">Short description</label>
          <textarea id="nc-desc" rows="2" maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn btn--gold">Add category</button>
      </form>

      <div className="admin-card">
        <h2>Categories ({categories.length})</h2>
        <div className="cat-list">
          {categories.map((c) => <CategoryRow key={`${c.id}-${c.name}-${c.description}-${c.productId}`} cat={c} run={run} />)}
        </div>
      </div>
    </>
  );
}

function ProductSelect({ id, value, onChange }) {
  return (
    <div className="field">
      <label htmlFor={id}>Linked product (for the “Explore” button)</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">None (links to all products)</option>
        {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
      </select>
    </div>
  );
}

function CategoryRow({ cat, run }) {
  const [v, setV] = useState({ name: cat.name, description: cat.description || '', productId: cat.productId || '' });
  const dirty = v.name !== cat.name || v.description !== (cat.description || '') || v.productId !== (cat.productId || '');
  return (
    <div className="cat-row">
      <div className="admin-row">
        <div className="field">
          <label htmlFor={`cn-${cat.id}`}>Name</label>
          <input id={`cn-${cat.id}`} value={v.name} maxLength={60} onChange={(e) => setV({ ...v, name: e.target.value })} />
        </div>
        <ProductSelect id={`cp-${cat.id}`} value={v.productId} onChange={(x) => setV({ ...v, productId: x })} />
      </div>
      <div className="field">
        <label htmlFor={`cd-${cat.id}`}>Description</label>
        <textarea id={`cd-${cat.id}`} rows="2" maxLength={300} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
      </div>
      <div className="photo__actions">
        <span className="hint">{cat.count} photo{cat.count === 1 ? '' : 's'} · /gallery/{cat.slug}</span>
        <button className="btn btn--dark btn--sm" disabled={!dirty} onClick={() => run(() => adminRequest('PUT', `/api/categories/${cat.id}`, v), 'Category updated.')}>Save</button>
        <button className="btn btn--danger btn--sm" onClick={() => window.confirm(`Delete "${cat.name}" and its ${cat.count} photo(s)?`) && run(() => adminRequest('DELETE', `/api/categories/${cat.id}`), 'Category deleted.')}>Delete</button>
      </div>
    </div>
  );
}
