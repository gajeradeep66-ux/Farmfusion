import { useEffect, useRef, useState } from 'react';
import api, { resolveImageUrl } from '../api';
import './AdminPage.css';

const categories = ['Seeds', 'Farming Tools', 'Soil & Nutrition', 'Plant Protection', 'Growing Essentials', 'Smart Farming'];
const orderStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
const emptyProduct = { name: '', category: 'Seeds', price: '', stock: '', image: '', description: '', featured: false };
const emptyAbout = { title: '', story: '', contactEmail: '', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=90' };
const imageTypes = 'image/jpeg,image/png,image/webp,image/avif';

const previewFor = (file, image) => file ? URL.createObjectURL(file) : image;

function ImagePicker({ label, image, file, source, onSourceChange, onImageChange, onChange, inputRef }) {
  const [preview, setPreview] = useState(image);
  useEffect(() => {
    const nextPreview = previewFor(file, image || '');
    setPreview(nextPreview);
    return () => {
      if (file && nextPreview) URL.revokeObjectURL(nextPreview);
    };
  }, [file, image]);

  return (
    <div className="image-picker">
      <span className="block text-sm font-semibold text-slate-700">{label}</span>
      <div className="image-source-switch" role="group" aria-label={`${label} source`}>
        <button type="button" aria-pressed={source === 'url'} onClick={() => onSourceChange('url')} className={source === 'url' ? 'selected' : ''}>Image URL</button>
        <button type="button" aria-pressed={source === 'file'} onClick={() => onSourceChange('file')} className={source === 'file' ? 'selected' : ''}>Choose file</button>
      </div>
      {source === 'url' ? (
        <input type="text" inputMode="url" value={image.startsWith('data:') ? '' : image} onChange={(event) => onImageChange(event.target.value)} placeholder="https://example.com/photo.jpg" className="admin-field mt-2" />
      ) : (
        <input ref={inputRef} type="file" accept={imageTypes} onChange={onChange} className="admin-field mt-2" />
      )}
      {preview && <img src={resolveImageUrl(preview)} alt={`${label} preview`} className="mt-3 h-36 w-full rounded-xl bg-stone-100 object-cover" />}
      <span className="mt-1 block text-xs font-normal text-slate-500">{source === 'url' ? 'Paste a direct image URL (HTTPS recommended).' : 'JPG, PNG, WebP or AVIF · max 5 MB'}</span>
    </div>
  );
}

export default function AdminPage() {
  const [summary, setSummary] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [about, setAbout] = useState(emptyAbout);
  const [product, setProduct] = useState(emptyProduct);
  const [editingId, setEditingId] = useState('');
  const [productFile, setProductFile] = useState(null);
  const [aboutFile, setAboutFile] = useState(null);
  const [productImageSource, setProductImageSource] = useState('url');
  const [aboutImageSource, setAboutImageSource] = useState('url');
  const [productQuery, setProductQuery] = useState('');
  const [productCategory, setProductCategory] = useState('All categories');
  const [tab, setTab] = useState('products');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyUser, setBusyUser] = useState('');
  const [busyOrder, setBusyOrder] = useState('');
  const productFileRef = useRef(null);
  const aboutFileRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryResponse, ordersResponse, productsResponse, usersResponse, aboutResponse] = await Promise.all([
        api.get('/admin/summary'),
        api.get('/admin/orders'),
        api.get('/admin/products'),
        api.get('/admin/users'),
        api.get('/about'),
      ]);
      setSummary(summaryResponse.data);
      setOrders(ordersResponse.data);
      setProducts(productsResponse.data);
      setUsers(usersResponse.data);
      setAbout({ ...emptyAbout, ...aboutResponse.data });
      setAboutImageSource(aboutResponse.data.image?.startsWith('/uploads/') ? 'file' : 'url');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load the admin dashboard. Refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearProductForm = () => {
    setProduct(emptyProduct);
    setEditingId('');
    setProductFile(null);
    setProductImageSource('url');
    if (productFileRef.current) productFileRef.current.value = '';
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      let image = product.image;
      if (productImageSource === 'file' && productFile) {
        const body = new FormData();
        body.append('image', productFile);
        const uploadResponse = await api.post('/admin/upload', body);
        image = uploadResponse.data.image;
      }
      const payload = { ...product, image, price: Number(product.price), stock: Number(product.stock) };
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        setMessage('Product updated successfully.');
      } else {
        await api.post('/admin/products', payload);
        setMessage('Product created successfully.');
      }
      clearProductForm();
      await fetchData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (item) => {
    setEditingId(item._id);
    setProduct({
      name: item.name,
      category: item.category,
      price: String(item.price),
      stock: String(item.stock),
      image: item.image,
      description: item.description,
      featured: Boolean(item.featured),
    });
    setProductFile(null);
    setProductImageSource(item.image?.startsWith('/uploads/') ? 'file' : 'url');
    if (productFileRef.current) productFileRef.current.value = '';
    setMessage('Editing product. Save changes when ready.');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/admin/products/${item._id}`);
      if (editingId === item._id) clearProductForm();
      setMessage('Product deleted.');
      await fetchData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete product.');
    }
  };

  const toggleUser = async (user) => {
    setBusyUser(user._id);
    setError('');
    setMessage('');
    try {
      const { data } = await api.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      setUsers((current) => current.map((entry) => entry._id === data._id ? { ...entry, ...data } : entry));
      setMessage(`${user.name}'s account ${data.isActive ? 'enabled' : 'disabled'}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to change account status.');
    } finally {
      setBusyUser('');
    }
  };

  const updateOrderStatus = async (order, status) => {
    setBusyOrder(order._id);
    setError('');
    setMessage('');
    try {
      const { data } = await api.patch(`/admin/orders/${order._id}/status`, { status });
      setOrders((current) => current.map((entry) => entry._id === data._id ? { ...entry, status: data.status } : entry));
      setMessage(`Order status changed to ${data.status}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update order status.');
    } finally {
      setBusyOrder('');
    }
  };

  const saveAbout = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      let image = about.image;
      if (aboutImageSource === 'file' && aboutFile) {
        const body = new FormData();
        body.append('image', aboutFile);
        const uploadResponse = await api.post('/admin/upload', body);
        image = uploadResponse.data.image;
      }
      const { data } = await api.put('/admin/about', { ...about, image });
      setAbout({ ...emptyAbout, ...data });
      setAboutFile(null);
      setAboutImageSource('url');
      if (aboutFileRef.current) aboutFileRef.current.value = '';
      setMessage('About page saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save About page.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    ['products', 'Products'],
    ['users', `Customers (${users.length})`],
    ['about', 'About page'],
    ['orders', `Orders (${orders.length})`],
  ];
  const filteredProducts = products.filter((item) => {
    const matchesQuery = `${item.name} ${item.category}`.toLowerCase().includes(productQuery.trim().toLowerCase());
    const matchesCategory = productCategory === 'All categories' || item.category === productCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="admin-page mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="admin-hero">
        <div>
          <p className="admin-eyebrow"><span /> FARMFUSION · CONTROL ROOM</p>
          <h1>Good to see you, admin.</h1>
          <p>Keep your catalog, customers and storefront running smoothly.</p>
        </div>
        <button type="button" onClick={fetchData} disabled={loading} className="admin-refresh">
          <span aria-hidden="true">↻</span> {loading ? 'Refreshing…' : 'Refresh data'}
        </button>
        <div className="admin-hero-mark" aria-hidden="true">✳</div>
      </header>

      {error && <div role="alert" className="admin-notice admin-notice-error">{error}</div>}
      {message && <div role="status" className="admin-notice admin-notice-success">{message}</div>}

      <div className="admin-stats">
        {[
          ['Products', summary.products, '01'],
          ['Orders', summary.orders, '02'],
          ['Customers', summary.users, '03'],
          ['Paid revenue', `₹${Number(summary.revenue || 0).toLocaleString('en-IN')}`, '04'],
        ].map(([label, value, index]) => (
          <div key={label} className="admin-stat-card">
            <span className="admin-stat-index">{index}</span>
            <div className="admin-stat-label">{label}</div>
            <div className="admin-stat-value">{value}</div>
          </div>
        ))}
      </div>

      <nav className="admin-tabs" role="tablist" aria-label="Admin sections">
        {tabs.map(([id, label]) => (
          <button key={id} id={`admin-tab-${id}`} type="button" role="tab" aria-selected={tab === id} aria-controls={`admin-panel-${id}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      {loading ? <div className="admin-loading" role="status"><span className="page-spinner" />Loading your workspace…</div> : (
        <>
          {tab === 'products' && (
            <div id="admin-panel-products" role="tabpanel" aria-labelledby="admin-tab-products" className="admin-products-layout">
              <form onSubmit={handleProductSubmit} className="admin-panel admin-product-form">
                <div className="admin-panel-heading">
                  <div>
                    <p className="admin-section-label">{editingId ? 'EDIT LISTING' : 'ADD TO YOUR CATALOG'}</p>
                    <h2>{editingId ? 'Edit product' : 'Create a product'}</h2>
                  </div>
                  {editingId && <span className="admin-edit-indicator">Editing</span>}
                </div>
                <label className="admin-label">Product name
                  <input required maxLength="120" value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} className="admin-field mt-1" />
                </label>
                <label className="admin-label">Category
                  <select value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} className="admin-field mt-1">
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
                <div className="admin-field-grid">
                  <label className="admin-label">Price (₹)
                    <input required min="0" step="0.01" type="number" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} className="admin-field mt-1" />
                  </label>
                  <label className="admin-label">Stock quantity
                    <input required min="0" step="1" type="number" value={product.stock} onChange={(event) => setProduct({ ...product, stock: event.target.value })} className="admin-field mt-1" />
                  </label>
                </div>
                <ImagePicker label="Product photo" image={product.image} file={productFile} source={productImageSource} inputRef={productFileRef}
                  onSourceChange={(source) => {
                    setProductImageSource(source);
                    if (source === 'url') setProductFile(null);
                    if (product.image.startsWith('data:')) setProduct({ ...product, image: '' });
                  }}
                  onImageChange={(image) => setProduct({ ...product, image })}
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] || null;
                    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
                      setError('Choose a product image smaller than 5 MB.');
                      event.target.value = '';
                      return;
                    }
                    setError('');
                    setProductFile(selectedFile);
                  }} />
                <label className="admin-label">Description
                  <textarea required maxLength="2000" rows="4" value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} className="admin-field mt-1" />
                </label>
                <label className="admin-feature-toggle">
                  <input type="checkbox" checked={product.featured} onChange={(event) => setProduct({ ...product, featured: event.target.checked })} /> Feature this product
                </label>
                <div className="admin-form-actions">
                  <button disabled={saving} type="submit" className="admin-primary-button">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create product'}</button>
                  {editingId && <button type="button" onClick={clearProductForm} className="admin-secondary-button">Cancel</button>}
                </div>
              </form>
              <section className="admin-panel admin-inventory-panel">
                <div className="admin-panel-heading">
                  <div><p className="admin-section-label">YOUR CATALOG</p><h2>Product inventory</h2></div>
                  <span className="admin-result-count">{filteredProducts.length} of {products.length} products</span>
                </div>
                <div className="admin-inventory-tools">
                  <label className="admin-search">
                    <span aria-hidden="true">⌕</span>
                    <input type="search" value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Search products or categories" aria-label="Search products or categories" />
                  </label>
                  <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)} aria-label="Filter products by category">
                    <option>All categories</option>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </div>
                <div className="admin-product-list">
                  {filteredProducts.map((item) => (
                    <article key={item._id} className={`admin-product-row ${editingId === item._id ? 'is-editing' : ''}`}>
                      <img src={resolveImageUrl(item.image)} alt={item.name} />
                      <div className="admin-product-details">
                        <h3>{item.name}</h3>
                        <p>{item.category}</p>
                      </div>
                      <div className="admin-product-price">₹{Number(item.price).toLocaleString('en-IN')}</div>
                      <span className={`admin-stock ${item.stock <= 5 ? 'is-low' : ''}`}>{item.stock <= 5 ? 'Low stock' : 'In stock'} · {item.stock}</span>
                      {item.featured && <span className="admin-featured-badge">Featured</span>}
                      <div className="admin-product-actions">
                        <button type="button" onClick={() => editProduct(item)} aria-label={`Edit ${item.name}`}>Edit</button>
                        <button type="button" onClick={() => deleteProduct(item)} aria-label={`Delete ${item.name}`}>Delete</button>
                      </div>
                    </article>
                  ))}
                  {!products.length && <p className="admin-empty-state">No products yet. Add your first catalog item using the form.</p>}
                  {!!products.length && !filteredProducts.length && <p className="admin-empty-state">No products match your search. Try another name or category.</p>}
                </div>
              </section>
            </div>
          )}

          {tab === 'users' && (
            <section id="admin-panel-users" role="tabpanel" aria-labelledby="admin-tab-users" className="admin-panel admin-secondary-panel">
              <div className="admin-panel-heading"><div><p className="admin-section-label">CUSTOMER ACCESS</p><h2>Customer accounts</h2></div><span className="admin-result-count">{users.length} accounts</span></div>
              <div className="admin-user-list">
                {users.map((user) => (
                  <article key={user._id} className="admin-user-row">
                    <div className="admin-user-avatar" aria-hidden="true">{user.name?.trim().charAt(0).toUpperCase()}</div>
                    <div className="admin-user-details"><h3>{user.name}</h3><p>{user.email} · Joined {new Date(user.createdAt).toLocaleDateString()}</p></div>
                    <span className={`admin-user-status ${user.isActive ? 'is-active' : 'is-disabled'}`}>{user.isActive ? 'Enabled' : 'Disabled'}</span>
                    <button type="button" disabled={busyUser === user._id} onClick={() => toggleUser(user)} className="admin-secondary-button">{busyUser === user._id ? 'Updating…' : user.isActive ? 'Disable account' : 'Enable account'}</button>
                  </article>
                ))}
                {!users.length && <p className="admin-empty-state">No customer accounts yet.</p>}
              </div>
            </section>
          )}

          {tab === 'about' && (
            <form id="admin-panel-about" role="tabpanel" aria-labelledby="admin-tab-about" onSubmit={saveAbout} className="admin-panel admin-about-panel">
              <div className="admin-about-fields">
                <div className="admin-panel-heading"><div><p className="admin-section-label">STOREFRONT CONTENT</p><h2>About FarmFusion</h2></div></div>
                <label className="admin-label">Page headline
                  <input required maxLength="140" value={about.title} onChange={(event) => setAbout({ ...about, title: event.target.value })} className="admin-field mt-1" />
                </label>
                <label className="admin-label">Our story
                  <textarea required maxLength="3000" rows="7" value={about.story} onChange={(event) => setAbout({ ...about, story: event.target.value })} className="admin-field mt-1" />
                </label>
                <label className="admin-label">Public contact email
                  <input required type="email" value={about.contactEmail} onChange={(event) => setAbout({ ...about, contactEmail: event.target.value })} className="admin-field mt-1" />
                </label>
              </div>
              <div className="admin-about-artwork">
                <ImagePicker label="About page photo / artwork" image={about.image} file={aboutFile} source={aboutImageSource} inputRef={aboutFileRef}
                  onSourceChange={(source) => {
                    setAboutImageSource(source);
                    if (source === 'url') setAboutFile(null);
                    if (about.image.startsWith('data:') || about.image.startsWith('/images/about-farm.svg')) setAbout({ ...about, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=90' });
                  }}
                  onImageChange={(image) => setAbout({ ...about, image })}
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] || null;
                    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
                      setError('Choose an About image smaller than 5 MB.');
                      event.target.value = '';
                      return;
                    }
                    setError('');
                    setAboutFile(selectedFile);
                  }} />
                <p>This artwork and contact email are shown to visitors on the About page. Only administrators can change them.</p>
                <button type="submit" disabled={saving} className="admin-primary-button">{saving ? 'Saving…' : 'Save About page'}</button>
              </div>
            </form>
          )}

          {tab === 'orders' && (
            <section id="admin-panel-orders" role="tabpanel" aria-labelledby="admin-tab-orders" className="admin-panel admin-secondary-panel">
              <div className="admin-panel-heading"><div><p className="admin-section-label">RECENT ACTIVITY</p><h2>Orders</h2></div><span className="admin-result-count">{orders.length} orders</span></div>
              <div className="admin-order-table-wrap">
                <table className="admin-order-table">
                  <thead><tr><th>Customer</th><th>Ordered products</th><th>Delivery address</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
                  <tbody>{orders.map((order) => {
                    const canUpdateStatus = order.status !== 'Payment failed' &&
                      !(order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid');
                    const address = order.shippingAddress || {};
                    return (
                      <tr key={order._id}>
                        <td><strong>{order.user?.name || address.name || 'Customer'}</strong><span>{order.user?.email || address.email || ''}</span></td>
                        <td className="admin-order-items">{order.items?.map((item, index) => <span key={`${order._id}-${item.product || index}`}>{item.name} × {item.quantity}</span>)}</td>
                        <td className="admin-order-address"><strong>{address.name}</strong><span>{[address.address, address.city, address.postalCode, address.country].filter(Boolean).join(', ') || 'Address not available'}</span><span>{address.email}</span></td>
                        <td>₹{Number(order.total || 0).toLocaleString('en-IN')}</td>
                        <td>{order.paymentStatus || order.paymentMethod}</td>
                        <td>
                          <select
                            className="admin-order-status-select"
                            value={order.status}
                            aria-label={`Status for order ${order._id}`}
                            disabled={!canUpdateStatus || busyOrder === order._id}
                            onChange={(event) => updateOrderStatus(order, event.target.value)}
                          >
                            {!orderStatuses.includes(order.status) && <option value={order.status}>{order.status}</option>}
                            {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </td>
                      </tr>
                    );
                  })}</tbody>
                </table>
                {!orders.length && <p className="admin-empty-state">No orders yet.</p>}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
