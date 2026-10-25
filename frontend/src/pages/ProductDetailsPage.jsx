import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { resolveImageUrl } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { usePreferences } from '../context/PreferencesContext';
import { toast } from '../components/Toast';
import ProductCard from '../components/ProductCard';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { toggle, has } = useWishlist();
  const { t, tProductName } = usePreferences();

  useEffect(() => {
    setProduct(null);
    setQty(1);
    api.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        return api.get('/products');
      })
      .then(({ data }) => {
        setRelated(
          data.filter((p) => p._id !== id && p.category === data.find((x) => x._id === id)?.category).slice(0, 4)
        );
      })
      .catch((err) => console.error('Failed to fetch product', err));
  }, [id]);

  if (!product) {
    return (
      <div className="pdp-loading">
        <div className="pdp-skeleton-img" />
        <div className="pdp-skeleton-info">
          <div className="skeleton-line w-40" />
          <div className="skeleton-line w-80 mt-3" />
          <div className="skeleton-line w-60 mt-2" />
          <div className="skeleton-line w-32 mt-4" />
        </div>
      </div>
    );
  }

  const wished = has(product._id);
  const maxQty = product.stock > 0 ? Math.min(product.stock, 10) : 0;
  const productName = tProductName(product.name);

  const numId = (product._id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rating = (4.6 + ((numId % 5) * 0.08)).toFixed(1);
  const reviewsCount = 42 + (numId % 140);
  const mrp = Math.round(Number(product.price || 0) * 1.25);
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast(`${qty}× ${productName} added to cart`, 'success');
  };

  const handleWishlist = () => {
    toggle(product._id);
    toast(wished ? 'Removed from wishlist' : 'Saved to wishlist', wished ? 'info' : 'success');
  };

  return (
    <div className="pdp-page">
      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">{t('Home')}</Link>
        <span aria-hidden="true">›</span>
        <Link to="/shop">{t('Shop all')}</Link>
        <span aria-hidden="true">›</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{t(product.category)}</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{productName}</span>
      </nav>

      <div className="pdp-grid">
        <div>
          <div className="pdp-image-frame">
            <img src={resolveImageUrl(product.image)} alt={productName} className="pdp-image" />
            <button
              type="button"
              className={`pdp-wishlist-btn${wished ? ' wished' : ''}`}
              onClick={handleWishlist}
              aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              {wished ? '♥' : '♡'}
            </button>
          </div>
        </div>

        <div className="pdp-info-col">
          <span className="pdp-category-badge">{t(product.category)}</span>
          <h1 className="pdp-title">{productName}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0 14px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--c-surface2)', border: '1px solid var(--c-border)', color: '#059669', padding: '3px 10px', borderRadius: '999px', fontSize: '13px', fontWeight: '700' }}>
              <span style={{ color: '#f59e0b' }}>★</span> {rating}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--c-text3)' }}>
              ({reviewsCount} {t('verified growers') || 'verified growers'})
            </span>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>• ✓ 100% Quality Guaranteed</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <div className="pdp-price" style={{ margin: 0 }}>₹{Number(product.price).toLocaleString('en-IN')}</div>
            {mrp > product.price && (
              <>
                <span style={{ fontSize: '1.15rem', color: 'var(--c-text3)', textDecoration: 'line-through' }}>
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
                <span style={{ background: '#ecfdf5', color: '#059669', fontWeight: '800', fontSize: '12px', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <p className="pdp-description">{product.description}</p>

          <div className="pdp-stock-row">
            <span className={`pdp-stock-dot${product.stock < 1 ? ' out' : product.stock < 10 ? ' low' : ''}`} />
            {product.stock < 1
              ? 'Out of stock'
              : product.stock < 10
              ? `Only ${product.stock} left in stock`
              : `In stock (${product.stock} available)`}
          </div>

          {product.stock > 0 && (
            <div className="pdp-qty-row">
              <span className="pdp-qty-label">Quantity</span>
              <div className="quantity-control">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Increase" disabled={qty >= maxQty}>+</button>
              </div>
            </div>
          )}

          <div className="pdp-actions">
            <button
              type="button"
              className="button-primary pdp-add-btn"
              onClick={handleAdd}
              disabled={product.stock < 1}
            >
              {product.stock < 1 ? t('Sold out') : `Add ${qty > 1 ? `${qty} ` : ''}to cart`}
              {product.stock > 0 && <span aria-hidden="true">→</span>}
            </button>
            <Link to="/cart" className="pdp-cart-link">{t('Cart')} →</Link>
          </div>

          <div className="pdp-perks">
            <span>🚚 Free delivery over ₹999</span>
            <span>🔒 Secure checkout</span>
            <span>🌱 Grown with care</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pdp-related">
          <div className="section-heading">
            <div>
              <span className="section-kicker">YOU MIGHT ALSO LIKE</span>
              <h2>More from {t(product.category)}</h2>
            </div>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="text-link">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="product-grid">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
