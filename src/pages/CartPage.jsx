import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePreferences } from '../context/PreferencesContext';

const defaultShipping = {
  name: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'India',
};

/* ── Razorpay script loader ─────────────────────────────────── */
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

/* ── Payment method definitions ─────────────────────────────── */
const PAYMENT_METHODS = [
  {
    id: 'upi',
    group: 'razorpay',
    label: 'UPI',
    sub: 'GPay, PhonePe, Paytm & more',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#5f259f" />
        <path d="M20 8 L28 20 L20 32 L12 20 Z" fill="white" opacity=".9" />
        <circle cx="20" cy="20" r="4" fill="#5f259f" />
      </svg>
    ),
    badge: 'INSTANT',
    badgeColor: '#5f259f',
  },
  {
    id: 'card',
    group: 'razorpay',
    label: 'Credit / Debit Card',
    sub: 'Visa, Mastercard, RuPay',
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
    badge: 'SECURE',
    badgeColor: '#1a56db',
  },
  {
    id: 'netbanking',
    group: 'razorpay',
    label: 'Net Banking',
    sub: 'SBI, HDFC, ICICI & 50+ banks',
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
    badge: null,
    badgeColor: null,
  },
  {
    id: 'wallet',
    group: 'razorpay',
    label: 'Wallets',
    sub: 'Paytm, Amazon Pay, Mobikwik',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#d97706" />
        <rect x="7" y="13" width="26" height="16" rx="3" fill="white" opacity=".15" stroke="white" strokeWidth="1.2" />
        <rect x="24" y="18" width="9" height="7" rx="2" fill="white" opacity=".3" stroke="white" strokeWidth="1" />
        <circle cx="28.5" cy="21.5" r="2" fill="white" opacity=".9" />
        <path d="M10 19h10M10 23h7" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
      </svg>
    ),
    badge: null,
    badgeColor: null,
  },
  {
    id: 'cod',
    group: 'cod',
    label: 'Cash on Delivery',
    sub: 'Pay when your order arrives',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#214b37" />
        <rect x="9" y="14" width="22" height="14" rx="3" fill="white" opacity=".15" stroke="white" strokeWidth="1.2" />
        <path d="M20 17v8M17 19.5h4.5a1.5 1.5 0 0 1 0 3H17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    badge: 'NO FEES',
    badgeColor: '#214b37',
  },
];

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { tProductName } = usePreferences();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    ...defaultShipping,
    name: user?.name || '',
    email: user?.email || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onlinePaymentsAvailable, setOnlinePaymentsAvailable] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/orders/payment/config')
      .then(({ data }) => {
        if (!active) return;
        setOnlinePaymentsAvailable(Boolean(data.onlinePaymentsEnabled));
        if (!data.onlinePaymentsEnabled) setPaymentMethod('cod');
      })
      .catch(() => {
        if (!active) return;
        setOnlinePaymentsAvailable(false);
        setPaymentMethod('cod');
      });
    return () => { active = false; };
  }, []);

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod);
  const isOnline = selectedMethod?.group === 'razorpay';

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
    if (!user) { navigate('/login?redirect=/cart'); return; }
    if (isOnline && onlinePaymentsAvailable !== true) {
      setMessage('Online payments are currently unavailable. Please choose Cash on Delivery.');
      setPaymentMethod('cod');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!isOnline) {
        await api.post('/orders/cod', { items: getOrderItems(), shippingAddress: shipping });
        clearCart();
        setShipping(defaultShipping);
        setIsSuccess(true);
        setMessage('Order confirmed! Pay cash when your delivery arrives.');
        navigate('/orders', { replace: true, state: { orderPlaced: true } });
        return;
      }

      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) throw new Error('Payment window could not load. Check your connection and try again.');

      const { data: paymentOrder } = await api.post('/orders/payment/order', {
        items: getOrderItems(),
        shippingAddress: shipping,
      });

      /* Map our UI method id → Razorpay method key */
      const rzpMethodMap = { upi: 'upi', card: 'card', netbanking: 'netbanking', wallet: 'wallet' };

      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: paymentOrder.storeName,
          description: paymentOrder.description,
          order_id: paymentOrder.razorpayOrderId,
          prefill: paymentOrder.customer,
          theme: { color: '#214b37' },
          /* Pre-select the tab the user already chose */
          config: { display: { defaultBlock: rzpMethodMap[paymentMethod] || 'upi', blocks: { banks: { name: 'Pay via UPI', instruments: [{ method: rzpMethodMap[paymentMethod] || 'upi' }] } }, sequence: [rzpMethodMap[paymentMethod] || 'upi'], preferences: { show_default_blocks: true } } },
          handler: async (response) => {
            try {
              await api.post('/orders/payment/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              setShipping(defaultShipping);
              setIsSuccess(true);
              setMessage('Payment complete! Your order is confirmed.');
              navigate('/orders', { replace: true, state: { orderPlaced: true } });
              resolve();
            } catch (err) {
              reject(new Error(err.response?.data?.message || 'Payment could not be verified. Contact support before retrying.'));
            }
          },
          modal: {
            ondismiss: async () => {
              try { await api.post('/orders/payment/fail', { razorpayOrderId: paymentOrder.razorpayOrderId }); } catch (_) { /* noop */ }
              reject(new Error('Payment was cancelled. Your cart is still saved.'));
            },
          },
        });

        checkout.on('payment.failed', async (response) => {
          try { await api.post('/orders/payment/fail', { razorpayOrderId: paymentOrder.razorpayOrderId }); } catch (_) { /* noop */ }
          reject(new Error(response.error?.description || 'Payment failed. Please try again or choose cash on delivery.'));
        });

        checkout.open();
      });
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Empty cart ─────────────────────────────────────────── */
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
          <h1>Your basket is taking a little break.</h1>
          <p>Find something good for your garden or farm, and we'll keep it safe here for you.</p>
          <Link to="/shop" className="button-primary">
            Explore farm essentials <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Cart with items ────────────────────────────────────── */
  return (
    <div className="cart-page">
      {/* Hero */}
      <div className="cart-heading cart-hero">
        <div className="cart-hero-copy">
          <span className="cart-eyebrow"><i /> FARMFUSION PICKING LIST</span>
          <h1>Your growing cart.</h1>
          <p>Good choices for your next season, all gathered in one place.</p>
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
          <Link to="/shop" className="cart-continue">Continue exploring <span aria-hidden="true">↗</span></Link>
        </div>
      </div>

      <div className="cart-layout">
        {/* ── Items panel ─────────────────────────────────── */}
        <section className="cart-items-panel">
          <div className="cart-panel-heading">
            <span><i className="cart-list-dot" /> Your selection <b>{items.length}</b></span>
            <span>Line total</span>
          </div>

          {items.map((item, index) => (
            <article key={item.productId} className="cart-item">
              <Link to={`/product/${item.productId}`} className="cart-item-image">
                <img src={item.image} alt={tProductName(item.name)} />
                <span className="cart-item-index">{String(index + 1).padStart(2, '0')}</span>
              </Link>
              <div className="cart-item-details">
                <span className="cart-product-label">FIELD-READY ESSENTIAL</span>
                <Link to={`/product/${item.productId}`} className="cart-item-title">{tProductName(item.name)}</Link>
                <span className="cart-unit-price">₹{Number(item.price).toLocaleString('en-IN')} each</span>
                <div className="cart-item-controls">
                  <div className="quantity-control" aria-label={`Quantity for ${tProductName(item.name)}`}>
                    <button type="button" onClick={() => updateQuantity(item.productId, -1)} aria-label="Decrease quantity">−</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.productId, 1)} aria-label="Increase quantity" disabled={Number.isFinite(item.stock) && item.quantity >= item.stock}>+</button>
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

          <div className="cart-reassurance-strip">
            <span aria-hidden="true">✦</span>
            <p>
              <strong>Picked for the way you grow.</strong>
              <small>Every essential is packed with care, ready for the field, garden or balcony.</small>
            </p>
          </div>
        </section>

        {/* ── Checkout panel ──────────────────────────────── */}
        <form className="checkout-panel" onSubmit={handleCheckout}>
          {/* Header */}
          <div className="checkout-panel-header">
            <span className="section-kicker">01 — CHECKOUT</span>
            <h2>Make it yours.</h2>
            <p>A few details and your growing essentials are on their way.</p>
          </div>

          {/* Shipping */}
          <div className="checkout-fields-grid">
            <label className="checkout-field">
              Full name
              <input name="name" value={shipping.name} onChange={handleChange} autoComplete="name" required placeholder="e.g. Aarav Patel" />
            </label>
            <label className="checkout-field">
              Email address
              <input name="email" type="email" value={shipping.email} onChange={handleChange} autoComplete="email" required placeholder="you@example.com" />
            </label>
            <label className="checkout-field">
              Delivery address
              <input name="address" value={shipping.address} onChange={handleChange} autoComplete="street-address" required placeholder="House / street / village" />
            </label>
            <div className="checkout-field-row">
              <label className="checkout-field">
                City
                <input name="city" value={shipping.city} onChange={handleChange} autoComplete="address-level2" required placeholder="City" />
              </label>
              <label className="checkout-field">
                PIN code
                <input name="postalCode" value={shipping.postalCode} onChange={handleChange} autoComplete="postal-code" inputMode="numeric" required placeholder="6-digit PIN" />
              </label>
            </div>
          </div>

          {/* Payment methods */}
          <div className="pay-section">
            <p className="pay-section-label">Choose how to pay</p>

            {/* Online methods group */}
            <div className="pay-group">
              <span className="pay-group-label">Online Payment — via Razorpay</span>
              <div className="pay-tiles">
                {PAYMENT_METHODS.filter((m) => m.group === 'razorpay').map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`pay-tile${paymentMethod === m.id ? ' pay-tile--active' : ''}`}
                    onClick={() => setPaymentMethod(m.id)}
                    aria-pressed={paymentMethod === m.id}
                    disabled={onlinePaymentsAvailable !== true}
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
              {onlinePaymentsAvailable === null && <p className="payment-availability-note">Checking online payment availability…</p>}
              {onlinePaymentsAvailable === false && (
                <p className="payment-availability-note" role="status">
                  Online payment is not set up yet. Please use Cash on Delivery, or ask the store administrator to add Razorpay API keys.
                </p>
              )}
            </div>

            {/* COD */}
            <div className="pay-group">
              <span className="pay-group-label">Offline</span>
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

            {/* Selected method summary pill */}
            <div className="pay-selected-pill">
              <span className="pay-selected-icon">{selectedMethod?.icon}</span>
              <span>
                Paying with <strong>{selectedMethod?.label}</strong>
                {isOnline && <small> · Processed securely by Razorpay</small>}
              </span>
            </div>
          </div>

          {/* Order summary */}
          <div className="order-summary-block">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <strong style={{ color: 'var(--c-green2)' }}>Free</strong>
            </div>
            <div className="summary-row total">
              <span>Order total</span>
              <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className="checkout-message"
              role="status"
              style={isSuccess
                ? { background: 'rgba(116,198,157,.14)', color: 'var(--c-green)', borderLeft: '3px solid var(--c-green2)' }
                : { background: 'rgba(212,64,64,.08)', color: '#b52f2f', borderLeft: '3px solid #d14040' }}
            >
              {isSuccess ? '✓ ' : '⚠ '}{message}
                {isSuccess && <Link to="/orders" className="checkout-success-link">View your orders</Link>}
            </div>
          )}

          {/* Login nudge */}
          {!user && (
            <p className="checkout-login-note">
              Please <Link to="/login?redirect=/cart">log in</Link> to place your order.
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="checkout-submit"
            disabled={isSubmitting || onlinePaymentsAvailable === null}
            style={{ width: '100%', minHeight: 50, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 0, color: '#fff', fontSize: 13, fontWeight: 750, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? (
              <>
                <span className="checkout-spinner" aria-hidden="true" /> Preparing checkout…
              </>
            ) : paymentMethod === 'cod' ? (
              <>Confirm cash on delivery <span aria-hidden="true">→</span></>
            ) : (
              <>Continue to {selectedMethod?.label} payment <span aria-hidden="true">→</span></>
            )}
          </button>

          <p className="checkout-secure-note">
            <span aria-hidden="true">🔒</span> Payments are encrypted and processed by Razorpay. FarmFusion never stores your card details.
          </p>
        </form>
      </div>
    </div>
  );
}
