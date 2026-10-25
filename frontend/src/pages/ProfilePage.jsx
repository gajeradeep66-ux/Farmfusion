import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePreferences } from '../context/PreferencesContext';
import api, { resolveImageUrl } from '../api';
import { toast } from '../components/Toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const cart = useCart();
  const cartItems = Array.isArray(cart?.items) ? cart.items : (Array.isArray(cart?.cartItems) ? cart.cartItems : []);
  const totalAmount = Number(cart?.totalAmount || 0);
  const totalItems = Number(cart?.totalItems || 0);
  const { t, tProductName } = usePreferences();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // profile | cart | orders | coupons
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [couponsLoading, setCouponsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postalCode: user?.postalCode || '',
    currentPassword: '',
    newPassword: '',
  });

  const [notice, setNotice] = useState({ type: '', text: '' });

  // Sync form with user when user loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || '',
      }));
    }
  }, [user]);

  // Load orders and admin-assigned coupons
  useEffect(() => {
    if (!user) return;

    setOrdersLoading(true);
    api.get('/orders/my')
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));

    setCouponsLoading(true);
    api.get('/coupons/my-coupons')
      .then(({ data }) => setCoupons(Array.isArray(data) ? data : []))
      .catch(() => setCoupons([]))
      .finally(() => setCouponsLoading(false));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice({ type: '', text: '' });

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      await updateProfile(payload);
      setNotice({ type: 'success', text: 'Profile details saved successfully!' });
      toast('Profile updated successfully!', 'success');
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Could not update profile.';
      setNotice({ type: 'error', text: errMsg });
      toast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyCoupon = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    toast(`Coupon '${code}' copied! Paste it in Cart to apply discount.`, 'success');
  };

  const applyInCart = (code) => {
    sessionStorage.setItem('farmfusion_auto_coupon', code);
    navigate('/cart');
  };

  const memberSince = user?._id && typeof user._id === 'string' && user._id.length >= 8
    ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Member';

  const initials = (user?.name || user?.email || 'U')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="profile-page">
      {/* ── Profile Hero Header ─────────────────────────────────── */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            <span>{initials}</span>
          </div>
          <div className="profile-hero-details">
            <div className="profile-hero-badges">
              <span className="profile-role-tag">
                {user?.role === 'admin' ? '🛡️ Administrator' : '🌱 Registered Farmer'}
              </span>
              <span className="profile-member-tag">Grower since {memberSince}</span>
            </div>
            <h1>{user?.name}</h1>
            <p>{user?.email} {user?.phone ? `• ${user.phone}` : ''}</p>
          </div>
        </div>

        {/* Quick stat chips */}
        <div className="profile-quick-stats">
          <div className="profile-stat-box" onClick={() => setActiveTab('cart')}>
            <span className="stat-icon">🛒</span>
            <div>
              <strong>{totalItems} Items</strong>
              <small>in Cart (₹{totalAmount.toLocaleString('en-IN')})</small>
            </div>
          </div>
          <div className="profile-stat-box" onClick={() => setActiveTab('orders')}>
            <span className="stat-icon">📦</span>
            <div>
              <strong>{orders.length} Orders</strong>
              <small>Order history</small>
            </div>
          </div>
          <div className="profile-stat-box" onClick={() => setActiveTab('coupons')}>
            <span className="stat-icon">🏷️</span>
            <div>
              <strong>{coupons.length} Coupons</strong>
              <small>From Farm Admin</small>
            </div>
          </div>
        </div>
      </section>

      {/* ── Profile Navigation Tabs ─────────────────────────────── */}
      <nav className="profile-nav-tabs" aria-label="Profile navigation">
        <button
          type="button"
          className={`profile-tab-btn${activeTab === 'profile' ? ' active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Edit Profile (પ્રોફાઇલ એડિટ)
        </button>
        <button
          type="button"
          className={`profile-tab-btn${activeTab === 'cart' ? ' active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          🛒 Active Cart ({totalItems}) (કાર્ટ ડેટા)
        </button>
        <button
          type="button"
          className={`profile-tab-btn${activeTab === 'orders' ? ' active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 My Orders ({orders.length}) (ઓર્ડર ડેટા)
        </button>
        <button
          type="button"
          className={`profile-tab-btn${activeTab === 'coupons' ? ' active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          🏷️ Admin Coupons ({coupons.length})
        </button>
      </nav>

      {/* ── Tab 1: Edit Profile ─────────────────────────────────── */}
      {activeTab === 'profile' && (
        <section className="profile-card profile-edit-section">
          <div className="profile-card-header">
            <div>
              <h2>Edit Personal & Farm Delivery Details</h2>
              <p>Keep your contact details up to date for fast agricultural doorstep delivery.</p>
            </div>
          </div>

          {notice.text && (
            <div className={`profile-notice profile-notice--${notice.type}`} role="alert">
              {notice.type === 'success' ? '✓' : '⚠'} {notice.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="profile-form-grid">
              <label className="profile-field">
                <span>Full Name *</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </label>

              <label className="profile-field">
                <span>Email Address (Account ID)</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  title="Email cannot be changed"
                  style={{ opacity: 0.75, cursor: 'not-allowed' }}
                />
              </label>

              <label className="profile-field">
                <span>Phone / WhatsApp Number</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                />
              </label>

              <label className="profile-field">
                <span>Village / Farm / Street Address</span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House, Survey No., Farm address"
                />
              </label>

              <label className="profile-field">
                <span>Taluka / City / District</span>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City or district"
                />
              </label>

              <label className="profile-field">
                <span>State</span>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Gujarat, Maharashtra"
                />
              </label>

              <label className="profile-field">
                <span>Postal PIN Code</span>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  maxLength="8"
                />
              </label>
            </div>

            {/* Optional Password Update */}
            <div className="profile-password-box">
              <h3>🔒 Security & Password Update (Optional)</h3>
              <p>Leave blank if you do not wish to change your current password.</p>
              <div className="profile-form-grid mt-3">
                <label className="profile-field">
                  <span>Current Password</span>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </label>
                <label className="profile-field">
                  <span>New Password (min 8 characters)</span>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="New strong password"
                    autoComplete="new-password"
                  />
                </label>
              </div>
            </div>

            <div className="profile-actions">
              <button type="submit" className="button-primary profile-save-btn" disabled={saving}>
                {saving ? 'Saving changes…' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ── Tab 2: Cart Data ────────────────────────────────────── */}
      {activeTab === 'cart' && (
        <section className="profile-card profile-cart-section">
          <div className="profile-card-header">
            <div>
              <h2>Current Field Basket (Active Cart Data)</h2>
              <p>Items waiting in your cart ready for rural doorstep dispatch.</p>
            </div>
            {totalItems > 0 && (
              <Link to="/cart" className="button-primary profile-checkout-btn">
                <span>Proceed to Checkout</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="profile-empty-state">
              <span className="empty-icon">🛒</span>
              <h3>Your cart is currently empty</h3>
              <p>Add certified seeds, organic fertilizers, and tools from our catalog.</p>
              <Link to="/shop" className="button-primary mt-3">Explore Farm Essentials</Link>
            </div>
          ) : (
            <>
              <div className="profile-cart-list">
                {cartItems.map((item, index) => {
                  const price = Number(item?.price || 0);
                  const qty = Number(item?.quantity || 1);
                  const lineTotal = price * qty;
                  const pId = item?.productId || item?._id || index;
                  const name = item?.name || 'Field Item';

                  return (
                    <article key={pId} className="profile-cart-item">
                      <img
                        src={resolveImageUrl(item?.image)}
                        alt={name}
                        className="profile-cart-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                        }}
                      />
                      <div className="profile-cart-info">
                        <Link to={`/product/${pId}`} className="profile-cart-title">
                          {tProductName ? tProductName(name) : name}
                        </Link>
                        <span className="profile-cart-price">
                          ₹{price.toLocaleString('en-IN')} × {qty} unit{qty > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="profile-cart-subtotal">
                        <small>TOTAL</small>
                        <strong>₹{lineTotal.toLocaleString('en-IN')}</strong>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="profile-cart-summary">
                <div className="profile-cart-summary-line">
                  <span>Total Cart Items:</span>
                  <strong>{totalItems} units</strong>
                </div>
                <div className="profile-cart-summary-line total">
                  <span>Grand Total:</span>
                  <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="profile-cart-summary-actions">
                  <Link to="/cart" className="button-primary w-full">
                    Complete Order in Cart (₹{totalAmount.toLocaleString('en-IN')})
                  </Link>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Tab 3: Order History ────────────────────────────────── */}
      {activeTab === 'orders' && (
        <section className="profile-card profile-orders-section">
          <div className="profile-card-header">
            <div>
              <h2>My Order History ({orders.length})</h2>
              <p>Track all previous and ongoing agricultural shipments.</p>
            </div>
            <Link to="/orders" className="profile-link-btn">
              View Detailed Orders Page →
            </Link>
          </div>

          {ordersLoading ? (
            <div className="profile-empty-state">
              <p>Loading your field orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="profile-empty-state">
              <span className="empty-icon">📦</span>
              <h3>No orders placed yet</h3>
              <p>Start your harvest journey with genuine certified seeds and tools.</p>
              <Link to="/shop" className="button-primary mt-3">Start Shopping</Link>
            </div>
          ) : (
            <div className="profile-orders-list">
              {orders.map((order) => {
                const orderId = String(order?._id || '');
                const dateStr = order?.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent';

                const orderItems = Array.isArray(order?.items) ? order.items : [];
                const shippingAddress = order?.shippingAddress || {};
                const orderTotal = Number(order?.total || 0);

                return (
                  <div key={order._id} className="profile-order-card">
                    <div className="profile-order-card-header">
                      <div>
                        <strong className="profile-order-id">
                          Order #{orderId.length > 8 ? orderId.slice(-8).toUpperCase() : orderId.toUpperCase() || 'ORDER'}
                        </strong>
                        <span className="profile-order-date">Placed on {dateStr}</span>
                      </div>
                      <span className={`profile-status-pill status-${(order?.status || 'Processing').toLowerCase().replace(/\s+/g, '-')}`}>
                        {order?.status || 'Processing'}
                      </span>
                    </div>

                    <div className="profile-order-items">
                      {orderItems.map((it, idx) => {
                        const itPrice = Number(it?.price || 0);
                        const itQty = Number(it?.quantity || 1);
                        return (
                          <div key={it?.productId || it?._id || idx} className="profile-order-row">
                            <img
                              src={resolveImageUrl(it?.image)}
                              alt={it?.name || 'Item'}
                              className="profile-order-thumb"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                              }}
                            />
                            <div className="profile-order-meta">
                              <strong>{it?.name || 'Field Item'}</strong>
                              <small>Qty: {itQty} • ₹{itPrice.toLocaleString('en-IN')} each</small>
                            </div>
                            <span className="profile-order-item-total">
                              ₹{(itPrice * itQty).toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="profile-order-card-footer">
                      <div>
                        <small>DELIVERED TO:</small>
                        <span>
                          {[shippingAddress.address, shippingAddress.city, shippingAddress.postalCode].filter(Boolean).join(', ') || 'Rural address on file'}
                        </span>
                      </div>
                      <div className="profile-order-total-block">
                        <small>TOTAL PAID:</small>
                        <strong>₹{orderTotal.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Tab 4: Exclusive Coupons from Admin ─────────────────── */}
      {activeTab === 'coupons' && (
        <section className="profile-card profile-coupons-section">
          <div className="profile-card-header">
            <div>
              <h2>Exclusive Coupons from Admin ({coupons.length})</h2>
              <p>Promotional codes created and provided by FarmFusion Admin specifically for your account.</p>
            </div>
          </div>

          {couponsLoading ? (
            <div className="profile-empty-state">
              <p>Checking available coupons…</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="profile-empty-state">
              <span className="empty-icon">🏷️</span>
              <h3>No coupons currently assigned</h3>
              <p>Coupons will appear here as soon as the Admin sends or grants promo codes to your account.</p>
            </div>
          ) : (
            <div className="profile-coupons-grid">
              {coupons.map((c) => {
                const expDate = c?.expiresAt
                  ? new Date(c.expiresAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Ongoing';

                return (
                  <div key={c._id} className="profile-coupon-card">
                    <div className="profile-coupon-top">
                      <span className="profile-coupon-badge">{c.discountPercent}% OFF</span>
                      {c.targetType === 'selected' ? (
                        <span className="profile-coupon-exclusive-tag">⭐ Exclusive For You</span>
                      ) : (
                        <span className="profile-coupon-all-tag">🌐 All Growers Offer</span>
                      )}
                      <span className="profile-coupon-exp">Valid till {expDate}</span>
                    </div>

                    <div className="profile-coupon-code-box">
                      <strong className="profile-coupon-code">{c.code}</strong>
                      <button
                        type="button"
                        onClick={() => copyCoupon(c.code)}
                        className="profile-coupon-copy-btn"
                        title="Copy code"
                      >
                        📋 Copy
                      </button>
                    </div>

                    <p className="profile-coupon-desc">
                      {c.description || 'Special grower seasonal promotion'}
                    </p>

                    <div className="profile-coupon-footer">
                      <span className="profile-coupon-min">
                        {c.minCartAmount > 0 ? `Min order: ₹${c.minCartAmount}` : 'No minimum spend'}
                      </span>
                      <button
                        type="button"
                        onClick={() => applyInCart(c.code)}
                        className="button-primary profile-coupon-apply-btn"
                      >
                        Apply in Cart →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
