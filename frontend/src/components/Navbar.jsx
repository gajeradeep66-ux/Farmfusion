import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePreferences } from '../context/PreferencesContext';

const categories = ['Seeds', 'Farming Tools', 'Soil & Nutrition', 'Plant Protection', 'Growing Essentials', 'Smart Farming'];
const navClass = ({ isActive }) => `store-nav-link${isActive ? ' active' : ''}`;

/* Initials avatar */
function Avatar({ name, size = 34 }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <span
      className="user-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences();
  const [query, setQuery] = useState('');
  const [searchParams] = useSearchParams();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropOpen]);

  /* Close on route change */
  useEffect(() => { setDropOpen(false); }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`);
  };

  const handleLogout = () => {
    setDropOpen(false);
    logout();
  };

  /* Member since — format from user._id ObjectId timestamp */
  const memberSince = user?._id
    ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : null;

  return (
    <header className="store-header">
      <div className="header-topline">
        <span>{t('Growing better, together.')}</span>
        <div className="header-top-links">
          <Link to="/about">{t('About')}</Link><span>·</span><Link to="/shop">{t('Shop all')}</Link>
        </div>
      </div>

      <div className="header-main">
        <Link to="/" className="brand" aria-label="FarmFusion home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48"><path d="M24 41V22m0 12c-11 0-17-7-17-17 11 0 17 6 17 17Zm0-8c0-11 7-17 17-17 0 11-6 17-17 17Z" /><path d="M11 40h26" /></svg>
          </span>
          <span className="brand-name">farmfusion<small>GROW GOOD THINGS</small></span>
        </Link>

        <form className="store-search" onSubmit={handleSearch} role="search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('Search seeds, tools and more...')} aria-label={t('Search')} />
          <button type="submit">{t('Search')}</button>
        </form>

        <div className="header-actions">
          <div className="header-preferences" aria-label="Display preferences">
            <label className="language-picker" title="Change Language / ભાષા બદલો">
              <span className="language-picker-icon" aria-hidden="true">🌐</span>
              <span className="sr-only">Language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language">
                <option value="en">English</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </label>
            <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? t('Light theme') : t('Dark theme')}>
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </div>

          {user ? (
            /* ── Logged-in: avatar button + dropdown ── */
            <div className="user-menu-wrap" ref={dropRef}>
              <button
                type="button"
                className={`user-menu-trigger${dropOpen ? ' user-menu-trigger--open' : ''}`}
                onClick={() => setDropOpen((v) => !v)}
                aria-expanded={dropOpen}
                aria-haspopup="true"
                aria-label="Account menu"
              >
                <Avatar name={user.name} size={32} />
                <span className="user-menu-name">{user.name.split(' ')[0]}</span>
                <svg className="user-menu-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {dropOpen && (
                <div className="user-dropdown" role="menu">
                  {/* Profile card */}
                  <Link to="/profile" className="udrop-profile" onClick={() => setDropOpen(false)} style={{ textDecoration: 'none' }}>
                    <Avatar name={user.name} size={46} />
                    <div className="udrop-profile-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      {user.role === 'admin' ? <span className="udrop-role-badge">Admin</span> : <span style={{ fontSize: '10px', color: 'var(--c-green2)', fontWeight: '700' }}>View Profile & Coupons →</span>}
                    </div>
                  </Link>

                  {/* Stats strip */}
                  <div className="udrop-stats">
                    <div className="udrop-stat">
                      <span>🌱</span>
                      <strong>Member</strong>
                      <small>since {memberSince}</small>
                    </div>
                    <div className="udrop-stat-divider" />
                    <div className="udrop-stat">
                      <span>📦</span>
                      <strong>Orders</strong>
                      <small>view in My Orders</small>
                    </div>
                  </div>

                  {/* Links */}
                  <nav className="udrop-links" aria-label="Account links">
                    <Link to="/profile" className="udrop-link" onClick={() => setDropOpen(false)}>
                      <span className="udrop-link-icon">👤</span>
                      <span>My Profile & Coupons</span>
                    </Link>
                    {user.role !== 'admin' && (
                      <Link to="/orders" className="udrop-link" onClick={() => setDropOpen(false)}>
                        <span className="udrop-link-icon">📦</span>
                        <span>My Orders</span>
                      </Link>
                    )}
                    <Link to="/cart" className="udrop-link" onClick={() => setDropOpen(false)}>
                      <span className="udrop-link-icon">🛒</span>
                      <span>My Cart</span>
                      {totalItems > 0 && <span className="udrop-link-badge">{totalItems}</span>}
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="udrop-link" onClick={() => setDropOpen(false)}>
                        <span className="udrop-link-icon">⚙</span>
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </nav>

                  <div className="udrop-divider" />

                  {/* Language switch buttons */}
                  <div className="udrop-lang-section">
                    <span className="udrop-lang-title">🌐 {language === 'gu' ? 'ભાષા' : language === 'hi' ? 'भाषा' : 'Language'}</span>
                    <div className="udrop-lang-pills">
                      <button
                        type="button"
                        className={`udrop-lang-btn${language === 'en' ? ' active' : ''}`}
                        onClick={() => setLanguage('en')}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        className={`udrop-lang-btn${language === 'gu' ? ' active' : ''}`}
                        onClick={() => setLanguage('gu')}
                      >
                        ગુજરાતી (Gujarati)
                      </button>
                      <button
                        type="button"
                        className={`udrop-lang-btn${language === 'hi' ? ' active' : ''}`}
                        onClick={() => setLanguage('hi')}
                      >
                        हिन्दी (Hindi)
                      </button>
                    </div>
                  </div>

                  <div className="udrop-divider" />

                  {/* Logout */}
                  <button type="button" className="udrop-logout" onClick={handleLogout}>
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M13 3h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4M8 14l-4-4 4-4M4 10h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="header-action">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
              <small>{t('Login')}</small>
            </Link>
          )}

          <Link to="/cart" className="header-action cart-action" aria-label={`${t('Cart')}, ${totalItems} items`}>
            <span className="cart-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 11.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6M9 21h.01M18 21h.01" /></svg>
              <i>{totalItems}</i>
            </span>
            <small>{t('Cart')}</small>
          </Link>
        </div>
      </div>

      <nav className="store-nav" aria-label="Main navigation">
        <NavLink to="/" className={navClass}>{t('Home')}</NavLink>
        <NavLink to="/shop" end className={navClass}>{t('Shop all')}</NavLink>
        {categories.map((category) => (
          <Link
            key={category}
            to={`/shop?category=${encodeURIComponent(category)}`}
            className={`store-nav-link${searchParams.get('category') === category ? ' active' : ''}`}
          >
            {t(category)}
          </Link>
        ))}
        {user?.role === 'admin' && <NavLink to="/admin" className={navClass}>{t('Admin')}</NavLink>}
      </nav>
    </header>
  );
}
