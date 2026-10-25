import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { usePreferences } from '../context/PreferencesContext';
import { toast } from './Toast';
import { resolveImageUrl } from '../api';
import { getProductPricing } from '../utils/pricing';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggle, has } = useWishlist();
  const { t, tProductName } = usePreferences();
  const [added, setAdded] = useState(false);
  const wished = has(product._id);
  const productName = tProductName(product.name);

  // Deterministic realistic rating & reviews from product ID
  const rating = useMemo(() => {
    const hash = (product._id || 'seed').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const score = (4.7 + (hash % 3) * 0.1).toFixed(1);
    const reviews = 38 + (hash % 115);
    return { score, reviews };
  }, [product._id]);

  // MRP and discount between 5% and 30%
  const pricing = useMemo(() => getProductPricing(product), [product]);

  const handleAdd = () => {
    if (product.stock < 1) return;
    addToCart(product);
    toast(`${productName} added to cart`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product._id);
    toast(wished ? 'Removed from wishlist' : 'Saved to wishlist', wished ? 'info' : 'success');
  };

  return (
    <article className="product-tile group">
      <Link to={`/product/${product._id}`} className="product-image-link" aria-label={`View ${productName}`}>
        <div className="product-image-wrap">
          <img src={resolveImageUrl(product.image)} alt={productName} className="product-image" loading="lazy" />
          <span className="product-category">{t(product.category)}</span>
          <span className="product-rating-badge">
            <span className="star-icon">★</span>
            <span className="rating-score">{rating.score}</span>
            <span className="rating-count">({rating.reviews})</span>
          </span>
          <button
            type="button"
            className={`wishlist-btn${wished ? ' wished' : ''}`}
            onClick={handleWishlist}
            aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            {wished ? '♥' : '♡'}
          </button>
        </div>
      </Link>
      <div className="product-info">
        <Link to={`/product/${product._id}`} className="product-title" title={productName}>
          {productName}
        </Link>
        <p className="product-description">{product.description}</p>
        
        <div className="product-pricing">
          <div className="price-stack">
            <span className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
            <span className="product-mrp">₹{pricing.mrp.toLocaleString('en-IN')}</span>
          </div>
          {pricing.discountPercent > 0 && (
            <span className="product-discount-tag">-{pricing.discountPercent}%</span>
          )}
        </div>

        <div className="product-buy-row">
          <span className={`stock-note${product.stock > 0 ? '' : ' out-of-stock'}`}>
            <span className="stock-beacon" />
            {product.stock > 0
              ? product.stock < 10
                ? `Only ${product.stock} left`
                : t('In Stock')
              : t('Currently out of stock')}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className={`product-add${added ? ' add-pulse' : ''}`}
            aria-label={`Add ${productName} to cart`}
            disabled={product.stock < 1}
          >
            <span className="add-icon" aria-hidden="true">{added ? '✓' : '+'}</span>
            <span className="add-text">
              {product.stock < 1 ? t('Sold out') : added ? t('Added!') : t('Add')}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

