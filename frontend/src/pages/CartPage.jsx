import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { resolveImageUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePreferences } from '../context/PreferencesContext';

const defaultShipping = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'India',
};

/* ── Payment method definitions ─────────────────────────────── */
const PAYMENT_METHODS = [
  {
    id: 'upi',
    group: 'online',
    label: 'UPI (GPay / PhonePe / Paytm)',
    sub: 'Instant 0-fee UPI payment via any app or ID',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#5f259f" />
        <path d="M20 8 L28 20 L20 32 L12 20 Z" fill="white" opacity=".9" />
        <circle cx="20" cy="20" r="4" fill="#5f259f" />
      </svg>
    ),
    badge: 'INSTANT • 0 FEE',
    badgeColor: '#059669',
  },
  {
    id: 'card',
    group: 'online',
    label: 'Credit / Debit Card',
    sub: 'Visa, Mastercard, RuPay & Corporate cards',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#1a56db" />
        <rect x="6" y="12" width="28" height="18" rx="3" fill="white" opacity=".15" stroke="white" strokeWidth="1.2" />
        <rect x="6" y="17" width="28" height="5" fill="white" opacity=".25" />
        <rect x="9" y="24" width="8" height="2.5" rx="1" fill="white" opacity=".7" />
        <circle cx="27" cy="25.5" r="3" fill="#f59e0b" opacity=".9" />
        <circle cx="30" cy="25.5" r="3" fill="#ef4444" opacity=".7" />
      </svg>
    ),
    badge: 'SECURE 256-BIT',
    badgeColor: '#1a56db',
  },
  {
    id: 'netbanking',
    group: 'online',
    label: 'Net Banking',
    sub: 'SBI, HDFC, ICICI, Axis & 50+ Indian banks',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#0f766e" />
        <path d="M8 18h24M20 10l12 8H8l12-8Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
        <rect x="11" y="18" width="4" height="9" rx="1" fill="white" opacity=".8" />
        <rect x="18" y="18" width="4" height="9" rx="1" fill="white" opacity=".8" />
        <rect x="25" y="18" width="4" height="9" rx="1" fill="white" opacity=".8" />
        <rect x="8" y="27" width="24" height="2" rx="1" fill="white" opacity=".6" />
      </svg>
    ),
    badge: 'ALL BANKS',
    badgeColor: '#0f766e',
  },
  {
    id: 'wallet',
    group: 'online',
    label: 'Digital Wallets',
    sub: 'Paytm, Amazon Pay, PhonePe Wallets',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#d97706" />
        <rect x="7" y="13" width="26" height="16" rx="3" fill="white" opacity=".15" stroke="white" strokeWidth="1.2" />
        <rect x="24" y="18" width="9" height="7" rx="2" fill="white" opacity=".3" stroke="white" strokeWidth="1" />
        <circle cx="28.5" cy="21.5" r="2" fill="white" opacity=".9" />
        <path d="M10 19h10M10 23h7" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
      </svg>
    ),
    badge: '1-TAP',
    badgeColor: '#d97706',
  },
  {
    id: 'cod',
    group: 'cod',
    label: 'Cash on Delivery (COD)',
    sub: 'Pay with Cash or QR Code at your doorstep',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#059669" />
        <rect x="9" y="14" width="22" height="14" rx="3" fill="white" opacity=".15" stroke="white" strokeWidth="1.2" />
        <path d="M20 17v8M17 19.5h4.5a1.5 1.5 0 0 1 0 3H17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    badge: 'VERIFIED COD',
    badgeColor: '#059669',
  },
];

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { t, tProductName } = usePreferences();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    ...defaultShipping,
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: 'Near Green Mandir, Farm Road',
    city: 'Ahmedabad',
    postalCode: '380001',
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiApp, setUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('farmgrower@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  /* Coupon State */
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');

  /* Simulation Modal State */
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simStep, setSimStep] = useState('initiating'); // initiating | authorizing | success
  const [authTxnId, setAuthTxnId] = useState('');

  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name && !shipping.name) {
      setShipping((prev) => ({
        ...prev,
        name: user.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod) || PAYMENT_METHODS[0];
  const isOnline = selectedMethod.group === 'online';

  /* Coupon application */
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponMessage('');
    const code = couponInput.trim().toUpperCase();
    if (code === 'FARM10') {
      setAppliedCoupon({ code: 'FARM10', percent: 10, label: '10% Kisan Special Discount' });
      setCouponMessage('✓ Coupon FARM10 applied! You saved 10% on your order.');
    } else if (code === 'KISAN20') {
      setAppliedCoupon({ code: 'KISAN20', percent: 20, label: '20% Mega Harvest Discount' });
      setCouponMessage('✓ Coupon KISAN20 applied! You saved 20% on your order.');
    } else if (!code) {
      setCouponMessage('Please enter a coupon code.');
    } else {
      setCouponMessage('Invalid coupon. Try FARM10 or KISAN20.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMessage('');
  };

  /* Calculations */
  const discountAmount = appliedCoupon ? Math.round((totalAmount * appliedCoupon.percent) / 100) : 0;
  const finalPayable = Math.max(0, totalAmount - discountAmount);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const getOrderItems = () =>
    items.map((item) => ({ productId: item.productId, quantity: item.quantity }));

  const handleCheckout = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }

    if (!shipping.name || !shipping.email || !shipping.address || !shipping.city || !shipping.postalCode) {
      setMessage('Please complete all delivery details (Name, Address, City, PIN).');
      return;
    }

    setIsSubmitting(true);

    if (isOnline) {
      /* Trigger simulated online payment flow */
      const txnId = 'FF_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      setAuthTxnId(txnId);
      setSimStep('initiating');
      setSimModalOpen(true);

      setTimeout(() => {
        setSimStep('authorizing');
      }, 1000);

      setTimeout(() => {
        setSimStep('success');
      }, 2200);

      setTimeout(async () => {
        try {
          await api.post('/orders/cod', {
            items: getOrderItems(),
            shippingAddress: shipping,
          });
          clearCart();
          setSimModalOpen(false);
          setIsSubmitting(false);
          navigate('/orders', {
            replace: true,
            state: {
              orderPlaced: true,
              paymentMethod: selectedMethod.label,
              isOnline: true,
              txnId,
            },
          });
        } catch (err) {
          setSimModalOpen(false);
          setIsSubmitting(false);
          setMessage(err.response?.data?.message || 'Order could not be saved. Please try again.');
        }
      }, 3400);

      return;
    }

    /* Cash on Delivery */
    try {
      await api.post('/orders/cod', {
        items: getOrderItems(),
        shippingAddress: shipping,
      });
      clearCart();
      setIsSuccess(true);
      setMessage('Order confirmed! Pay cash or scan QR when your delivery arrives.');
      navigate('/orders', {
        replace: true,
        state: { orderPlaced: true, paymentMethod: 'Cash on Delivery' },
      });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Empty cart state ─────────────────────────────────────── */
  if (!items.length) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="empty-basket" aria-hidden="true">
            <svg viewBox="0 0 120 110">
              <path d="M22 39h76l-8 51H30l-8-51Z" />
              <path d="m39 42 18-27m24 27L63 15" />
              <path d="M39 57v19m21-19v19m21-19v19" />
              <path d="M44 90v7m33-7v7" />
            </svg>
            <span>🌱</span>
          </div>
          <span className="section-kicker">YOUR NEXT GROWING SEASON STARTS HERE</span>
          <h1>{t('Your cart')} is taking a break.</h1>
          <p>Find something good for your farm, garden or crops, and we will keep it safe here for you.</p>
          <Link to="/shop" className="button-primary">
            {t('Shop farm essentials')} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Cart with items ──────────────────────────────────────── */
  return (
    <div className="cart-page">
      {/* Hero */}
      <div className="cart-heading cart-hero">
        <div className="cart-hero-copy">
          <span className="cart-eyebrow"><i /> FARMFUSION PICKING LIST</span>
          <h1>{t('Your cart')}</h1>
          <p>Quality seeds, tools and crop essentials gathered for your farm.</p>
        </div>
        <div className="cart-hero-side">
          <span className="cart-bag-art" aria-hidden="true">
            <svg viewBox="0 0 80 80">
              <path d="M18 30h44l-5 39H23z" />
              <path d="M29 32c0-15 5-23 11-23s11 8 11 23" />
              <path d="M40 57V40m0 10c-8 0-12-5-12-12 8 0 12 5 12 12Zm2-5c7-1 10-5 10-11-7 1-10 5-10 11Z" />
            </svg>
          </span>
          <span className="cart-hero-count">
            <strong>{items.length.toString().padStart(2, '0')}</strong>
            <small>items selected</small>
          </span>
          <Link to="/shop" className="cart-continue">{t('Shop all')} <span aria-hidden="true">↗</span></Link>
        </div>
      </div>

      <div className="cart-layout">
        {/* ── Left items panel ─────────────────────────────────── */}
        <section className="cart-items-panel">
          <div className="cart-panel-heading">
            <span><i className="cart-list-dot" /> Your selection <b>({items.length})</b></span>
            <span>Line total</span>
          </div>

          {items.map((item, index) => (
            <article key={item.productId} className="cart-item">
              <Link to={`/product/${item.productId}`} className="cart-item-image">
                <img src={resolveImageUrl(item.image)} alt={tProductName(item.name)} />
                <span className="cart-item-index">{String(index + 1).padStart(2, '0')}</span>
              </Link>
              <div className="cart-item-details">
                <span className="cart-product-label">FIELD-READY ESSENTIAL</span>
                <Link to={`/product/${item.productId}`} className="cart-item-title">{tProductName(item.name)}</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="cart-unit-price">₹{Number(item.price).toLocaleString('en-IN')} each</span>
                  <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                    ✓ In Stock
                  </span>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-control" aria-label={`Quantity for ${tProductName(item.name)}`}>
                    <button type="button" onClick={() => updateQuantity(item.productId, -1)} aria-label="Decrease quantity">−</button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, 1)}
                      aria-label="Increase quantity"
                      disabled={Number.isFinite(item.stock) && item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <button type="button" className="remove-item" onClick={() => removeFromCart(item.productId)}>
                    <span aria-hidden="true">×</span> Remove
                  </button>
                </div>
              </div>
              <div className="cart-line-total">
                <small>LINE TOTAL</small>
                <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
              </div>
            </article>
          ))}

          {/* Coupon Box */}
          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--c-surface2)', borderRadius: '14px', border: '1.5px dashed var(--c-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '750', color: 'var(--c-text)' }}>🏷️ Have a Promo / Kisan Coupon?</span>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>Try: FARM10 or KISAN20</span>
            </div>
            {appliedCoupon ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div>
                  <strong style={{ color: '#059669', fontSize: '13px' }}>🎉 {appliedCoupon.code} Applied</strong>
                  <div style={{ fontSize: '12px', color: '#047857' }}>{appliedCoupon.label} (−₹{discountAmount.toLocaleString('en-IN')})</div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  style={{ background: 'transparent', border: 0, color: '#dc2626', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Remove ✕
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter coupon (e.g. FARM10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{ flex: 1, minHeight: '38px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--c-text)' }}
                />
                <button
                  type="submit"
                  style={{ padding: '0 18px', borderRadius: '8px', background: 'var(--c-green)', color: '#fff', border: 0, fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  {t('Apply')}
                </button>
              </form>
            )}
            {couponMessage && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: couponMessage.startsWith('✓') ? '#059669' : '#dc2626', fontWeight: '600' }}>
                {couponMessage}
              </p>
            )}
          </div>

          <div className="cart-reassurance-strip" style={{ marginTop: '20px' }}>
            <span aria-hidden="true">✦</span>
            <p>
              <strong>100% Certified Field Protection Guarantee.</strong>
              <small>Every packet is lab-tested and temperature-preserved directly for rural delivery.</small>
            </p>
          </div>
        </section>

        {/* ── Right checkout panel ─────────────────────────────── */}
        <form className="checkout-panel" onSubmit={handleCheckout}>
          <div className="checkout-panel-header">
            <span className="section-kicker">01 — ORDER & DELIVERY</span>
            <h2>{t('Delivery address')}</h2>
            <p>Enter your field or home address to complete checkout.</p>
          </div>

          {/* Shipping Fields Grid */}
          <div className="checkout-fields-grid">
            <label className="checkout-field">
              {t('Full name')}
              <input name="name" value={shipping.name} onChange={handleChange} autoComplete="name" required placeholder="e.g. Ramesh Patel" />
            </label>
            <div className="checkout-field-row">
              <label className="checkout-field">
                {t('Email address')}
                <input name="email" type="email" value={shipping.email} onChange={handleChange} autoComplete="email" required placeholder="you@example.com" />
              </label>
              <label className="checkout-field">
                {t('Phone number')}
                <input name="phone" type="tel" value={shipping.phone} onChange={handleChange} placeholder="e.g. 9876543210" />
              </label>
            </div>
            <label className="checkout-field">
              {t('Delivery address')}
              <input name="address" value={shipping.address} onChange={handleChange} autoComplete="street-address" required placeholder="Farm / House / Street / Village" />
            </label>
            <div className="checkout-field-row">
              <label className="checkout-field">
                {t('City')}
                <input name="city" value={shipping.city} onChange={handleChange} autoComplete="address-level2" required placeholder="City / Taluka" />
              </label>
              <label className="checkout-field">
                {t('PIN code')}
                <input name="postalCode" value={shipping.postalCode} onChange={handleChange} autoComplete="postal-code" inputMode="numeric" required placeholder="6-digit PIN" />
              </label>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pay-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p className="pay-section-label" style={{ margin: 0 }}>{t('Choose how to pay')}</p>
              <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '999px', fontWeight: '750', border: '1px solid rgba(16,185,129,0.3)' }}>
                ⚡ Instant Online & COD Ready
              </span>
            </div>

            {/* Online payment methods */}
            <div className="pay-group">
              <span className="pay-group-label">Online Payment (UPI, Cards, NetBanking)</span>
              <div className="pay-tiles">
                {PAYMENT_METHODS.filter((m) => m.group === 'online').map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`pay-tile${paymentMethod === m.id ? ' pay-tile--active' : ''}`}
                    onClick={() => setPaymentMethod(m.id)}
                    aria-pressed={paymentMethod === m.id}
                  >
                    <span className="pay-tile-icon">{m.icon}</span>
                    <span className="pay-tile-label">{m.label}</span>
                    <span className="pay-tile-sub">{m.sub}</span>
                    {m.badge && (
                      <span className="pay-tile-badge" style={{ background: m.badgeColor + '18', color: m.badgeColor }}>
                        {m.badge}
                      </span>
                    )}
                    {paymentMethod === m.id && <span className="pay-tile-check" aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive subcard for chosen online method */}
            {paymentMethod === 'upi' && (
              <div style={{ background: 'var(--c-surface2)', padding: '14px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--c-border)' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--c-text)', display: 'block', marginBottom: '8px' }}>
                  Select UPI App or enter UPI ID:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {[
                    { id: 'gpay', name: 'Google Pay' },
                    { id: 'phonepe', name: 'PhonePe' },
                    { id: 'paytm', name: 'Paytm' },
                    { id: 'bhim', name: 'BHIM' },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setUpiApp(app.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: upiApp === app.id ? '2px solid #059669' : '1px solid var(--c-border)',
                        background: upiApp === app.id ? '#ecfdf5' : 'var(--c-surface)',
                        color: upiApp === app.id ? '#059669' : 'var(--c-text)',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {app.name}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  style={{ width: '100%', minHeight: '36px', borderRadius: '6px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '0 10px', fontSize: '12px', color: 'var(--c-text)' }}
                />
              </div>
            )}

            {paymentMethod === 'card' && (
              <div style={{ background: 'var(--c-surface2)', padding: '14px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--c-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--c-text)' }}>Test Card (Instant Sandbox Ready)</span>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>✓ Auto-filled</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '8px' }}>
                  <input
                    type="text"
                    defaultValue="4532 •••• •••• 8892"
                    readOnly
                    style={{ minHeight: '36px', borderRadius: '6px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '0 10px', fontSize: '12px', color: 'var(--c-text)', fontWeight: '700' }}
                  />
                  <input
                    type="text"
                    defaultValue="12/28"
                    readOnly
                    style={{ minHeight: '36px', borderRadius: '6px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '0 10px', fontSize: '12px', color: 'var(--c-text)', textAlign: 'center' }}
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div style={{ background: 'var(--c-surface2)', padding: '14px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--c-border)' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--c-text)', display: 'block', marginBottom: '8px' }}>Select Bank:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'sbi', name: 'State Bank of India' },
                    { id: 'hdfc', name: 'HDFC Bank' },
                    { id: 'icici', name: 'ICICI Bank' },
                    { id: 'axis', name: 'Axis Bank' },
                    { id: 'bob', name: 'Bank of Baroda' },
                  ].map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: selectedBank === bank.id ? '2px solid #059669' : '1px solid var(--c-border)',
                        background: selectedBank === bank.id ? '#ecfdf5' : 'var(--c-surface)',
                        color: selectedBank === bank.id ? '#059669' : 'var(--c-text)',
                        fontWeight: '700',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div style={{ background: 'var(--c-surface2)', padding: '14px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--c-border)' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--c-text)', display: 'block', marginBottom: '8px' }}>Select Wallet:</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: selectedWallet === w ? '2px solid #059669' : '1px solid var(--c-border)',
                        background: selectedWallet === w ? '#ecfdf5' : 'var(--c-surface)',
                        color: selectedWallet === w ? '#059669' : 'var(--c-text)',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Offline COD */}
            <div className="pay-group" style={{ marginTop: '12px' }}>
              <span className="pay-group-label">Offline Payment</span>
              <div className="pay-tiles">
                {PAYMENT_METHODS.filter((m) => m.group === 'cod').map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`pay-tile pay-tile--wide${paymentMethod === m.id ? ' pay-tile--active' : ''}`}
                    onClick={() => setPaymentMethod(m.id)}
                    aria-pressed={paymentMethod === m.id}
                  >
                    <span className="pay-tile-icon">{m.icon}</span>
                    <span className="pay-tile-label">{m.label}</span>
                    <span className="pay-tile-sub">{m.sub}</span>
                    {m.badge && (
                      <span className="pay-tile-badge" style={{ background: m.badgeColor + '18', color: m.badgeColor }}>
                        {m.badge}
                      </span>
                    )}
                    {paymentMethod === m.id && <span className="pay-tile-check" aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Block */}
          <div className="order-summary-block">
            <div className="summary-row">
              <span>{t('Subtotal')}</span>
              <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row" style={{ color: '#059669' }}>
                <span>{t('Discount')} ({appliedCoupon?.code})</span>
                <strong>−₹{discountAmount.toLocaleString('en-IN')}</strong>
              </div>
            )}
            <div className="summary-row">
              <span>{t('Delivery')}</span>
              <strong style={{ color: 'var(--c-green2)', fontWeight: '800' }}>{t('Free')}</strong>
            </div>
            <div className="summary-row total">
              <span>{t('Order total')}</span>
              <strong style={{ fontSize: '1.45rem', color: 'var(--c-green)' }}>₹{finalPayable.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div
              className="checkout-message"
              role="status"
              style={isSuccess
                ? { background: 'rgba(16,185,129,.14)', color: '#047857', borderLeft: '3px solid #10b981', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }
                : { background: 'rgba(212,64,64,.08)', color: '#b52f2f', borderLeft: '3px solid #d14040', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}
            >
              {isSuccess ? '✓ ' : '⚠ '}{message}
            </div>
          )}

          {!user && (
            <p className="checkout-login-note" style={{ fontSize: '13px', margin: '8px 0', color: 'var(--c-text2)' }}>
              Please <Link to="/login?redirect=/cart" style={{ color: 'var(--c-green)', fontWeight: '700' }}>log in</Link> to complete your order.
            </p>
          )}

          {/* Checkout Submit Button */}
          <button
            type="submit"
            className="checkout-submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              minHeight: 52,
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              border: 0,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              fontSize: '14.5px',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            {isSubmitting ? (
              <>
                <span className="checkout-spinner" aria-hidden="true" /> Processing order…
              </>
            ) : paymentMethod === 'cod' ? (
              <>
                Confirm Cash on Delivery (₹{finalPayable.toLocaleString('en-IN')}) <span aria-hidden="true">→</span>
              </>
            ) : (
              <>
                Pay ₹{finalPayable.toLocaleString('en-IN')} via {selectedMethod.label.split(' ')[0]} <span aria-hidden="true">🔒 →</span>
              </>
            )}
          </button>

          <p className="checkout-secure-note" style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--c-text3)' }}>
            <span aria-hidden="true">🔒</span> 256-Bit SSL Encrypted & Verified Indian Agri Payments. Zero transaction charges.
          </p>
        </form>
      </div>

      {/* ── Simulated Online Payment Modal ────────────────────── */}
      {simModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div style={{
            background: 'var(--c-surface)',
            border: '2px solid var(--c-border)',
            borderRadius: '20px',
            width: 'min(440px, 100%)',
            padding: '28px 24px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
            textAlign: 'center',
            position: 'relative',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '800', marginBottom: '16px' }}>
              <span>🛡️</span> Verified Secure Gateway
            </div>

            <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--c-text)' }}>
              FarmFusion Online Pay
            </h3>
            <p style={{ margin: '0 0 18px', color: 'var(--c-text2)', fontSize: '13px' }}>
              Authorizing ₹{finalPayable.toLocaleString('en-IN')} via {selectedMethod.label}
            </p>

            {/* Animation state */}
            <div style={{ padding: '24px 16px', background: 'var(--c-surface2)', borderRadius: '16px', marginBottom: '18px' }}>
              {simStep === 'initiating' && (
                <div>
                  <div style={{ width: '48px', height: '48px', margin: '0 auto 14px', borderRadius: '50%', border: '4px solid #10b981', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--c-text)', marginBottom: '4px' }}>Connecting to Payment Gateway…</strong>
                  <span style={{ fontSize: '12px', color: 'var(--c-text3)' }}>Establishing 256-bit bank handshake</span>
                </div>
              )}

              {simStep === 'authorizing' && (
                <div>
                  <div style={{ width: '48px', height: '48px', margin: '0 auto 14px', borderRadius: '50%', border: '4px solid #059669', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }} />
                  <strong style={{ display: 'block', fontSize: '14px', color: '#059669', marginBottom: '4px' }}>Authenticating Transaction…</strong>
                  <span style={{ fontSize: '12px', color: 'var(--c-text3)' }}>Processing with NPCI / Banking Switch</span>
                </div>
              )}

              {simStep === 'success' && (
                <div>
                  <div style={{ width: '48px', height: '48px', margin: '0 auto 14px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    ✓
                  </div>
                  <strong style={{ display: 'block', fontSize: '15px', color: '#059669', marginBottom: '4px' }}>Payment Approved!</strong>
                  <span style={{ fontSize: '12px', color: 'var(--c-text3)' }}>Ref: {authTxnId} • Finalizing your order</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--c-text3)' }}>
              <span>Merchant: FarmFusion Agri</span>
              <span>Amount: ₹{finalPayable.toLocaleString('en-IN')}</span>
            </div>

            {simStep !== 'success' && (
              <button
                type="button"
                onClick={() => { setSimModalOpen(false); setIsSubmitting(false); }}
                style={{ marginTop: '16px', background: 'transparent', border: 0, color: 'var(--c-text3)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Cancel payment
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
