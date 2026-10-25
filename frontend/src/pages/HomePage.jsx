import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryIcon from '../components/CategoryIcon';
import ProductCard from '../components/ProductCard';
import api from '../api';
import { usePreferences } from '../context/PreferencesContext';

const categories = [
  { name: 'Seeds', note: 'Start with better seeds' },
  { name: 'Farming Tools', note: 'Tools for every field' },
  { name: 'Soil & Nutrition', note: 'Feed your soil' },
  { name: 'Plant Protection', note: 'Care for every crop' },
  { name: 'Growing Essentials', note: 'Grow anywhere' },
  { name: 'Smart Farming', note: 'Make every drop count' },
];

const stats = [
  { value: '90+', label: 'Products' },
  { value: '6', label: 'Categories' },
  { value: '₹0', label: 'Delivery on ₹999+' },
  { value: '100%', label: 'Grower-focused' },
];

function SkeletonProductCard() {
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

const trustPillars = [
  { icon: '🚚', title: 'Free Rural Delivery', desc: 'Fast doorstep shipping on ₹999+' },
  { icon: '🌱', title: '100% Certified Seeds', desc: 'High germination lab-verified batches' },
  { icon: '🌾', title: 'Direct Maker Prices', desc: 'No distributor markup, maximum savings' },
  { icon: '🛡️', title: 'COD & Secure UPI', desc: 'Pay safely on delivery or via QR' },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = usePreferences();

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => setProducts(data))
      .catch((err) => console.error('Failed to fetch featured products', err))
      .finally(() => setLoading(false));
  }, []);

  const picks = products.slice(0, 5);

  return (
    <div className="storefront">
      <div className="delivery-ribbon">
        <span className="ribbon-live-dot" />
        <span>{t('Fresh picks for a better harvest')}</span>
        <span className="ribbon-separator">•</span>
        <span>{t('Free delivery on orders over ₹999')}</span>
        <Link to="/shop" className="ribbon-action">{t('Explore the store')} <span aria-hidden="true">→</span></Link>
      </div>

      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {t('GOOD THINGS GROW HERE')}
            <span className="eyebrow-badge">★ 4.9 Verified</span>
          </span>
          <h1>
            {t('Everything your farm needs,')}{' '}
            <span className="hero-gradient-text">{t('all in one place.')}</span>
          </h1>
          <p>{t('Thoughtfully picked seeds, trusted tools and crop care essentials for the people who grow our future.')}</p>
          <div className="hero-actions">
            <Link to="/shop" className="button-primary">
              <span>{t('Shop farm essentials')}</span>
              <span className="btn-arrow" aria-hidden="true">↗</span>
            </Link>
            <a href="#categories" className="button-quiet">
              <span>{t('Explore categories')}</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-proof">
            <span className="proof-mark">✓</span>
            <span>
              <strong>{t('Made for growers')}</strong>
              <small>{t('From seed to harvest')} • 15,000+ Farmers</small>
            </span>
          </div>
        </div>
        <div className="hero-art-wrap">
          <div className="hero-art">
            <img className="farm-illustration" src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=90" alt="Sunlit green fields stretching across a farm landscape" />
            <div className="hero-glass-overlay" />
            <span className="hero-photo-label">
              <span className="live-pulse" /> {t('GROWN WITH CARE')}
            </span>
            <div className="hero-floating-stat">
              <span className="floating-stat-icon">🌾</span>
              <div>
                <strong>15,000+</strong>
                <small>Thriving Growers</small>
              </div>
            </div>
          </div>
          <div className="hero-note">
            <span className="note-icon">🌿</span>
            <span>
              <strong>{t('Grow a little greener')}</strong>
              <small>{t('Good choices start here')}</small>
            </span>
          </div>
          <div className="hero-season">
            <span className="season-dot" />
            FIELD NOTES <span>№ 01 — GROWING SEASON</span>
          </div>
        </div>
      </section>

      {/* Trust Pillars Strip */}
      <div className="trust-pillars-grid">
        {trustPillars.map((tp) => (
          <div key={tp.title} className="trust-pillar-card">
            <span className="trust-pillar-icon">{tp.icon}</span>
            <div>
              <strong>{tp.title}</strong>
              <p>{tp.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="home-stats-bar">
        {stats.map((s) => (
          <div key={s.label} className="home-stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <section id="categories" className="store-section category-section">
        <div className="section-heading">
          <div><span className="section-kicker">{t('FIND YOUR FIELD ESSENTIALS')}</span><h2>{t('Shop by category')}</h2></div>
          <Link to="/shop" className="text-link">{t('View all products')} <span aria-hidden="true">→</span></Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link key={category.name} to={`/shop?category=${encodeURIComponent(category.name)}`} className="category-tile">
              <span className={`category-art category-art-${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <span className="category-symbol"><CategoryIcon name={category.name} /></span>
                <span className="category-arrow" aria-hidden="true">↗</span>
              </span>
              <strong>{t(category.name)}</strong>
              <small>{t(category.note)}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="picks-band">
        <div className="store-section">
          <div className="section-heading">
            <div><span className="section-kicker">{t("THE GROWER'S SHORTLIST")}</span><h2>{t('Top picks from the fields')}</h2><p>{t('Reliable favourites, chosen for everyday growing.')}</p></div>
            <Link to="/shop" className="text-link">{t('Shop everything')} <span aria-hidden="true">→</span></Link>
          </div>
          <div className="product-grid">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonProductCard key={i} />)
              : picks.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
          {!loading && products.length === 0 && (
            <div className="empty-products">{t('Our growing season is just getting started. Check back soon.')}</div>
          )}
        </div>
      </section>

      <section className="store-section offer-section">
        <div className="offer-banner">
          <div className="offer-copy">
            <span className="section-kicker">{t('A LITTLE SOMETHING EXTRA')}</span>
            <h2>{t('Good growing starts with a good deal.')}</h2>
            <p>Find practical essentials for your next season, all picked with growers in mind.</p>
            <Link to="/shop" className="button-light">Find your next favourite <span aria-hidden="true">→</span></Link>
          </div>
          <div className="offer-stamp"><span>GROW</span><strong>MORE</strong><span>WASTE LESS</span><i>✳</i></div>
          <div className="offer-leaf offer-leaf-one">❧</div>
          <div className="offer-leaf offer-leaf-two">❧</div>
        </div>
      </section>

      <section className="store-section grow-section">
        <div className="grow-copy">
          <span className="section-kicker">A BETTER WAY TO GROW</span>
          <h2>From the first seed to the final harvest.</h2>
          <p>Whether you're tending a balcony garden or acres of farmland, find the essentials that help your hard work flourish.</p>
          <Link to="/shop" className="text-link">Find what you need <span aria-hidden="true">→</span></Link>
        </div>
        <div className="grow-points">
          <div><span>01</span><strong>Picked for growers</strong><p>Practical products for real farms and gardens.</p></div>
          <div><span>02</span><strong>Simple, honest shopping</strong><p>Clear choices to help you grow with confidence.</p></div>
          <div><span>03</span><strong>Here for every season</strong><p>From planting time through harvest and beyond.</p></div>
        </div>
      </section>
    </div>
  );
}
