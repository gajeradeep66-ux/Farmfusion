import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../api';
import { usePreferences } from '../context/PreferencesContext';

const categories = ['All', 'Seeds', 'Farming Tools', 'Soil & Nutrition', 'Plant Protection', 'Growing Essentials', 'Smart Farming'];
const sortOptions = [
  { value: 'default',    label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc',   label: 'Name: A–Z' },
  { value: 'stock-desc', label: 'In Stock First' },
];

function SkeletonCard() {
  return (
    <div className="product-tile skeleton-card" aria-hidden="true">
      <div className="skeleton-img" />
      <div className="product-info">
        <div className="skeleton-line w-80" />
        <div className="skeleton-line w-60 mt-2" />
        <div className="skeleton-line w-40 mt-3" />
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, tProductName }           = usePreferences();

  const searchTerm       = searchParams.get('search')   || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const sortBy           = searchParams.get('sort')     || 'default';

  useEffect(() => {
    setLoading(true);
    api.get('/products')
      .then(({ data }) => setProducts(data))
      .catch((err) => console.error('Failed to fetch products', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const text = `${p.name} ${tProductName(p.name)} ${p.category} ${t(p.category)} ${p.description}`.toLowerCase();
      return matchCat && text.includes(searchTerm.toLowerCase());
    });
    if (sortBy === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'name-asc')   list = [...list].sort((a, b) => tProductName(a.name).localeCompare(tProductName(b.name)));
    if (sortBy === 'stock-desc') list = [...list].sort((a, b) => b.stock - a.stock);
    return list;
  }, [products, searchTerm, selectedCategory, sortBy, t, tProductName]);

  const setParam = (key, value) => {
    const next = Object.fromEntries(searchParams.entries());
    if (!value || value === 'All' || value === 'default') delete next[key];
    else next[key] = value;
    setSearchParams(next);
  };

  return (
    <div className="shop-page">
      {/* Header row */}
      <div className="shop-header-row">
        <div>
          <p className="section-kicker">{t('THE FARMFUSION COLLECTION')}</p>
          <h1 className="shop-title">
            {searchTerm
              ? `Search: "${searchTerm}"`
              : t(selectedCategory === 'All' ? 'Farm essentials' : selectedCategory)}
          </h1>
        </div>
        <div className="shop-header-controls">
          <span className="shop-count-badge">{filteredProducts.length} {t('products available')}</span>
          <select
            value={sortBy}
            onChange={(e) => setParam('sort', e.target.value)}
            className="shop-sort-select"
            aria-label="Sort products"
          >
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Search bar */}
      <div className="shop-search-row">
        <div className="shop-search-wrap">
          <span className="shop-search-icon" aria-hidden="true">⌕</span>
          <input
            value={searchTerm}
            onChange={(e) => setParam('search', e.target.value)}
            placeholder={t('Find seeds, tools, soil care...')}
            aria-label={t('Search')}
            className="shop-search-input"
          />
          {searchTerm && (
            <button type="button" className="shop-search-clear" onClick={() => setParam('search', '')} aria-label="Clear search">×</button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="shop-pills-row">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setParam('category', cat)}
            className={`shop-cat-pill${selectedCategory === cat ? ' active' : ''}`}
          >
            {t(cat)}
            {selectedCategory === cat && cat !== 'All' && (
              <span className="cat-pill-count">{filteredProducts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="shop-product-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="shop-empty">
          <span className="shop-empty-icon">🌱</span>
          <h2>Nothing found</h2>
          <p>Try a different search term or browse another category.</p>
          <button
            className="button-primary"
            onClick={() => { setParam('search', ''); setParam('category', 'All'); }}
          >
            Clear filters <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : (
        <div className="shop-product-grid">
          {filteredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
