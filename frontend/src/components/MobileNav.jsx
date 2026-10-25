import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePreferences } from '../context/PreferencesContext';

export default function MobileNav() {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { t } = usePreferences();

  const getNavLinkClass = ({ isActive }) =>
    `mobile-nav-item${isActive ? ' active' : ''}`;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink to="/" end className={getNavLinkClass}>
        <span className="mobile-nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </span>
        <span className="mobile-nav-label">{t('Home')}</span>
      </NavLink>

      <NavLink to="/shop" className={getNavLinkClass}>
        <span className="mobile-nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </span>
        <span className="mobile-nav-label">{t('Shop all')}</span>
      </NavLink>

      <NavLink to={user ? "/orders" : "/login?redirect=/orders"} className={getNavLinkClass}>
        <span className="mobile-nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </span>
        <span className="mobile-nav-label">{t('Orders') || 'Orders'}</span>
      </NavLink>

      <NavLink to="/cart" className={getNavLinkClass}>
        <span className="mobile-nav-icon mobile-cart-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {totalItems > 0 && <span className="mobile-cart-badge">{totalItems}</span>}
        </span>
        <span className="mobile-nav-label">{t('Cart')}</span>
      </NavLink>

      <NavLink to={user ? "/profile" : "/login"} className={getNavLinkClass}>
        <span className="mobile-nav-icon">
          {user ? (
            <span className="mobile-user-avatar">
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </span>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </span>
        <span className="mobile-nav-label">
          {user ? (user.role === 'admin' ? t('Admin') : t('Account') || 'Profile') : t('Login')}
        </span>
      </NavLink>
    </nav>
  );
}
