import { useEffect, useState } from 'react';
import { loadGallery, subscribeGallery } from '../lib/api.js';

// Returns { categories, items, loading, offline }
export default function useGallery() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    loadGallery().then((d) => alive && setData(d));
    const off = subscribeGallery((d) => alive && setData(d));
    return () => {
      alive = false;
      off();
    };
  }, []);
  return {
    categories: data?.categories || [],
    items: data?.items || [],
    banners: data?.banners || [],
    settings: data?.settings || { social: {} },
    loading: !data,
    offline: !!data?.offline,
  };
}
