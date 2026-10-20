import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';
import './OrdersPage.css';

const formatAddress = (address) =>
  [address?.address, address?.city, address?.postalCode, address?.country]
    .filter(Boolean)
    .join(', ');

export default function OrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.get('/orders/my')
      .then(({ data }) => {
        if (!active) return;
        if (!Array.isArray(data)) {
          setError('The order history response was invalid. Please try again.');
          return;
        }
        setOrders(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load your orders. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [reload]);

  return (
    <div className="orders-page">
      <header className="orders-heading">
        <span className="section-kicker">YOUR FARMFUSION ACCOUNT</span>
        <h1>My orders</h1>
        <p>View the products, delivery address and status for every order you have placed.</p>
      </header>

      {location.state?.orderPlaced && (
        <div className="orders-confirmation" role="status">Your order was placed successfully. You can follow its status below.</div>
      )}
      {loading && <div className="orders-state" role="status"><span className="page-spinner" />Loading your orders…</div>}
      {!loading && error && (
        <div className="orders-state orders-error" role="alert">
          <p>{error}</p>
          <button type="button" className="button-primary" onClick={() => setReload((current) => current + 1)}>Try again</button>
        </div>
      )}
      {!loading && !error && !orders.length && (
        <div className="orders-state">
          <h2>No orders yet</h2>
          <p>Your completed purchases will appear here with their delivery details.</p>
          <Link to="/shop" className="button-primary">Explore the shop <span aria-hidden="true">→</span></Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="customer-order-card" key={order._id}>
              <header className="customer-order-header">
                <div>
                  <span className="orders-label">ORDER PLACED</span>
                  <strong>{new Date(order.createdAt).toLocaleString('en-IN')}</strong>
                  <small>Order #{order._id.slice(-8).toUpperCase()}</small>
                </div>
                <span className="customer-order-status">{order.status}</span>
              </header>

              <div className="customer-order-items">
                {order.items?.map((item, index) => (
                  <div className="customer-order-item" key={`${order._id}-${item.product || index}`}>
                    {item.image && <img src={item.image} alt="" />}
                    <div className="customer-order-item-name">
                      <strong>{item.name}</strong>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <strong className="customer-order-item-price">
                      ₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
                    </strong>
                  </div>
                ))}
              </div>

              <footer className="customer-order-footer">
                <div>
                  <span className="orders-label">DELIVERING TO</span>
                  <strong>{order.shippingAddress?.name}</strong>
                  <span>{formatAddress(order.shippingAddress) || 'Address not available'}</span>
                  {order.shippingAddress?.email && <span>{order.shippingAddress.email}</span>}
                </div>
                <div className="customer-order-total">
                  <span className="orders-label">ORDER TOTAL</span>
                  <strong>₹{Number(order.total || 0).toLocaleString('en-IN')}</strong>
                  <span>{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment'} · {order.paymentStatus}</span>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
