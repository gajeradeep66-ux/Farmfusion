import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { usePreferences } from '../context/PreferencesContext';
import { toast } from './Toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggle, has } = useWishlist();
  const { t, tProductName } = usePreferences();
  const [added, setAdded] = useState(false);
  const wished = has(product._id);
  const productName = tProductName(product.name);

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
    <article className="product-tile">
      <Link to={`/product/${product._id}`} className="product-image-link" aria-label={`View ${productName}`}>
        <div className="product-image-wrap">
          <img src={product.image} alt={productName} className="product-image" loading="lazy" />
          <span className="product-category">{t(product.category)}</span>
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
        <Link to={`/product/${product._id}`} className="product-title">{productName}</Link>
        <p className="product-description">{product.description}</p>
        <div className="product-buy-row">
          <span className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          <button
            type="button"
            onClick={handleAdd}
            className={`product-add${added ? ' add-pulse' : ''}`}
            aria-label={`Add ${productName} to cart`}
            disabled={product.stock < 1}
          >
            <span aria-hidden="true">{added ? '✓' : '+'}</span>
            {product.stock < 1 ? t('Sold out') : added ? t('Added!') : t('Add')}
          </button>
        </div>
        <span className={`stock-note${product.stock > 0 ? '' : ' out-of-stock'}`}>
          <i /> {product.stock > 0
            ? product.stock < 10
              ? `Only ${product.stock} left`
              : t('Ready for your next season')
            : t('Currently out of stock')}
        </span>
      </div>
    </article>
  );
}
