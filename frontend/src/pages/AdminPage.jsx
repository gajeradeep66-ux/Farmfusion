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
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({ code: '', discountPercent: 15, minCartAmount: '', expiresAt: '', description: '', targetType: 'all', allowedEmail: '', assignedUserName: '' });
  const [busyCoupon, setBusyCoupon] = useState('');
  const [dispatchForm, setDispatchForm] = useState({
    couponTarget: 'all',
    selectedCouponId: '',
    userTarget: 'all',
    allowedEmail: '',
    assignedUserName: '',
  });
  const [dispatching, setDispatching] = useState(false);
  const productFileRef = useRef(null);
  const aboutFileRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryResponse, ordersResponse, productsResponse, usersResponse, aboutResponse, couponsResponse] = await Promise.all([
        api.get('/admin/summary'),
        api.get('/admin/orders'),
        api.get('/admin/products'),
        api.get('/admin/users'),
        api.get('/about'),
        api.get('/admin/coupons').catch(() => ({ data: [] })),
      ]);
      setSummary(summaryResponse.data);
      setOrders(ordersResponse.data);
      setProducts(productsResponse.data);
      setUsers(usersResponse.data);
      setAbout({ ...emptyAbout, ...aboutResponse.data });
      setAboutImageSource(aboutResponse.data.image?.startsWith('/uploads/') ? 'file' : 'url');
      setCoupons(couponsResponse?.data || []);
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

  const handleCopyCouponCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setMessage(`📋 Coupon code '${code}' copied! Share this directly with your user.`);
    setTimeout(() => setMessage(''), 4500);
  };

  const handleCreateCoupon = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const isSelected = couponForm.targetType === 'selected';
      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discountPercent: Number(couponForm.discountPercent),
        minCartAmount: Number(couponForm.minCartAmount || 0),
        expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : new Date(Date.now() + 14 * 86400000).toISOString(),
        description: couponForm.description,
        targetType: isSelected ? 'selected' : 'all',
        allowedEmail: isSelected && couponForm.allowedEmail ? couponForm.allowedEmail.trim().toLowerCase() : '',
        assignedUserName: isSelected && couponForm.assignedUserName ? couponForm.assignedUserName.trim() : '',
      };
      const { data } = await api.post('/admin/coupons', payload);
      setCoupons((prev) => [data, ...prev]);
      setCouponForm({ code: '', discountPercent: 15, minCartAmount: '', expiresAt: '', description: '', targetType: 'all', allowedEmail: '', assignedUserName: '' });
      setMessage(`✓ Coupon ${data.code} (${data.discountPercent}% OFF) created and sent to ${data.targetType === 'all' ? 'All Customers' : data.allowedEmail}!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedCoupons = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/admin/coupons/seed');
      setCoupons(data.coupons || []);
      setMessage(`✓ ${data.count} Default Kisan Coupons available!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not seed default coupons.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAssignCoupon = async (c, targetType, email, name) => {
    setBusyCoupon(c._id);
    try {
      const { data } = await api.patch(`/admin/coupons/${c._id}/assign`, {
        targetType,
        allowedEmail: email,
        assignedUserName: name,
      });
      setCoupons((prev) => prev.map((item) => (item._id === c._id ? data : item)));
      setMessage(`✓ Coupon ${c.code} is now sent to ${targetType === 'all' ? 'All Customers' : (email || 'Selected Customer')}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not assign coupon.');
    } finally {
      setBusyCoupon('');
    }
  };

  const handleDispatchCoupons = async (event) => {
    if (event) event.preventDefault();
    setDispatching(true);
    setMessage('');
    setError('');
    try {
      const isCouponAll = dispatchForm.couponTarget === 'all';
      const selectedId = dispatchForm.selectedCouponId;

      if (!isCouponAll && !selectedId) {
        setError('Please select a coupon to send.');
        setDispatching(false);
        return;
      }

      const isUserAll = dispatchForm.userTarget === 'all';
      if (!isUserAll && !dispatchForm.allowedEmail?.trim()) {
        setError('Please choose or enter a customer email address.');
        setDispatching(false);
        return;
      }

      const { data } = await api.post('/admin/coupons/dispatch', {
        couponTarget: dispatchForm.couponTarget,
        selectedCouponIds: isCouponAll ? [] : [selectedId],
        userTarget: dispatchForm.userTarget,
        allowedEmail: dispatchForm.allowedEmail?.trim(),
        assignedUserName: dispatchForm.assignedUserName?.trim(),
      });

      setCoupons(data.coupons || []);
      setMessage(data.message || '✓ Coupons dispatched successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not dispatch coupons.');
    } finally {
      setDispatching(false);
    }
  };

  const handleSelectCouponForDispatch = (c) => {
    setDispatchForm((prev) => ({
      ...prev,
      couponTarget: 'selected',
      selectedCouponId: c._id,
    }));
    const el = document.getElementById('admin-coupon-dispatcher');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('admin-panel-highlight');
      setTimeout(() => el.classList.remove('admin-panel-highlight'), 1800);
    }
    setMessage(`Selected coupon ${c.code} (${c.discountPercent}% OFF) for dispatch. Choose target audience below.`);
  };

  const handleAutoCreateCoupon = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/admin/coupons/auto');
      setCoupons((prev) => [data, ...prev]);
      setMessage(`⚡ Auto-generated coupon ${data.code} (${data.discountPercent}% OFF)!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not auto-generate coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCoupon = async (c) => {
    setBusyCoupon(c._id);
    try {
      const { data } = await api.patch(`/admin/coupons/${c._id}/toggle`);
      setCoupons((prev) => prev.map((item) => (item._id === c._id ? data : item)));
      setMessage(`Coupon ${c.code} is now ${data.isActive ? 'active' : 'disabled'}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update coupon.');
    } finally {
      setBusyCoupon('');
    }
  };

  const handleDeleteCoupon = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    setBusyCoupon(c._id);
    try {
      await api.delete(`/admin/coupons/${c._id}`);
      setCoupons((prev) => prev.filter((item) => item._id !== c._id));
      setMessage(`Coupon ${c.code} deleted.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete coupon.');
    } finally {
      setBusyCoupon('');
    }
  };

  const tabs = [
    ['products', 'Products'],
    ['coupons', `Coupons (${coupons.length})`],
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

          {tab === 'coupons' && (
            <div id="admin-panel-coupons" role="tabpanel" aria-labelledby="admin-tab-coupons" className="admin-products-layout">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* ── CARD 1: Coupon Dispatcher (Select Coupon -> Select User) ── */}
                <form onSubmit={handleDispatchCoupons} id="admin-coupon-dispatcher" className="admin-panel admin-dispatch-card">
                  <div className="admin-panel-heading">
                    <div>
                      <p className="admin-section-label">COUPON DISPATCHER & DISTRIBUTION</p>
                      <h2>🎁 Send Coupons to Customers</h2>
                    </div>
                    <span className="admin-result-count">Distribution Tool</span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--c-text2)', margin: '4px 0 12px' }}>
                    Select which coupon(s) to grant and choose whether to send to <strong>All Users (બધા)</strong> or a <strong>Specific Customer (પસંદગીનો યૂઝર)</strong>.
                  </p>

                  {/* Step 1: Select Coupon(s) */}
                  <div className="admin-dispatch-step">
                    <div className="admin-dispatch-step-title">
                      <span>1️⃣</span> <span>Select Coupon(s) / કૂપન પસંદ કરો:</span>
                    </div>
                    <div className="admin-dispatch-options">
                      <label className={`admin-dispatch-option${dispatchForm.couponTarget === 'all' ? ' active' : ''}`}>
                        <input
                          type="radio"
                          name="couponTarget"
                          value="all"
                          checked={dispatchForm.couponTarget === 'all'}
                          onChange={() => setDispatchForm({ ...dispatchForm, couponTarget: 'all' })}
                        />
                        <span>🌟 All Coupons (બધા {coupons.length} કૂપન્સ)</span>
                      </label>
                      <label className={`admin-dispatch-option${dispatchForm.couponTarget === 'selected' ? ' active' : ''}`}>
                        <input
                          type="radio"
                          name="couponTarget"
                          value="selected"
                          checked={dispatchForm.couponTarget === 'selected'}
                          onChange={() => {
                            const firstCouponId = coupons[0]?._id || '';
                            setDispatchForm({
                              ...dispatchForm,
                              couponTarget: 'selected',
                              selectedCouponId: dispatchForm.selectedCouponId || firstCouponId,
                            });
                          }}
                        />
                        <span>🎯 Specific Coupon (પસંદગીનું કૂપન)</span>
                      </label>
                    </div>

                    {dispatchForm.couponTarget === 'selected' && (
                      <div style={{ marginTop: '10px' }}>
                        <select
                          className="admin-field mt-1"
                          value={dispatchForm.selectedCouponId}
                          onChange={(e) => setDispatchForm({ ...dispatchForm, selectedCouponId: e.target.value })}
                        >
                          <option value="">-- Choose a Coupon ({coupons.length} available) --</option>
                          {coupons.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.code} — {c.discountPercent}% OFF {c.minCartAmount ? `(Min ₹${c.minCartAmount})` : ''} ({c.description || 'Special Promo'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Select User(s) */}
                  <div className="admin-dispatch-step">
                    <div className="admin-dispatch-step-title">
                      <span>2️⃣</span> <span>Select Recipient / કોને મોકલવું:</span>
                    </div>
                    <div className="admin-dispatch-options">
                      <label className={`admin-dispatch-option${dispatchForm.userTarget === 'all' ? ' active' : ''}`}>
                        <input
                          type="radio"
                          name="userTarget"
                          value="all"
                          checked={dispatchForm.userTarget === 'all'}
                          onChange={() => setDispatchForm({ ...dispatchForm, userTarget: 'all', allowedEmail: '', assignedUserName: '' })}
                        />
                        <span>🌐 All Customers (બધા ગ્રાહકો - Public)</span>
                      </label>
                      <label className={`admin-dispatch-option${dispatchForm.userTarget === 'selected' ? ' active' : ''}`}>
                        <input
                          type="radio"
                          name="userTarget"
                          value="selected"
                          checked={dispatchForm.userTarget === 'selected'}
                          onChange={() => setDispatchForm({ ...dispatchForm, userTarget: 'selected' })}
                        />
                        <span>👤 Selected Customer Only (પસંદગીના યૂઝર માટે)</span>
                      </label>
                    </div>

                    {dispatchForm.userTarget === 'selected' && (
                      <div style={{ marginTop: '10px' }}>
                        <label className="admin-label">
                          Choose Registered Customer:
                          <select
                            className="admin-field mt-1"
                            value={dispatchForm.allowedEmail}
                            onChange={(e) => {
                              const found = users.find((u) => u.email === e.target.value);
                              setDispatchForm({
                                ...dispatchForm,
                                allowedEmail: e.target.value,
                                assignedUserName: found ? found.name : '',
                              });
                            }}
                          >
                            <option value="">-- Select customer ({users.length} registered) --</option>
                            {users.map((u) => (
                              <option key={u._id} value={u.email}>
                                {u.name} ({u.email})
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="admin-label mt-2">
                          Or Enter Customer Email Directly:
                          <input
                            type="email"
                            placeholder="e.g. kisan@example.com"
                            value={dispatchForm.allowedEmail}
                            onChange={(e) => setDispatchForm({ ...dispatchForm, allowedEmail: e.target.value })}
                            className="admin-field mt-1"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Live Action Preview */}
                  <div className="admin-dispatch-preview">
                    <div>
                      <span>🚀 <strong>Action Summary:</strong> </span>
                      <span>
                        {dispatchForm.couponTarget === 'all' ? (
                          <strong>All {coupons.length} Available Coupons</strong>
                        ) : (
                          <strong>Coupon {coupons.find((c) => c._id === dispatchForm.selectedCouponId)?.code || 'Selected Promo'}</strong>
                        )}
                      </span>
                      <span> will be assigned to </span>
                      <span>
                        {dispatchForm.userTarget === 'all' ? (
                          <strong>All Registered Users (બધા યૂઝર્સ)</strong>
                        ) : (
                          <strong>
                            {dispatchForm.assignedUserName
                              ? `${dispatchForm.assignedUserName} (${dispatchForm.allowedEmail || 'No email specified'})`
                              : dispatchForm.allowedEmail || 'Selected Customer'}
                          </strong>
                        )}
                      </span>
                      .
                    </div>
                    <span className="admin-dispatch-note">
                      {dispatchForm.userTarget === 'all'
                        ? '✓ Every logged-in user will see this under "Profile > Admin Coupons" and can apply it in Cart.'
                        : '🔒 Only this customer will see and be permitted to apply this coupon.'}
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="admin-form-actions" style={{ marginTop: '14px' }}>
                    <button
                      disabled={dispatching || (dispatchForm.couponTarget === 'selected' && !dispatchForm.selectedCouponId)}
                      type="submit"
                      className="admin-primary-button"
                    >
                      {dispatching ? 'Sending Coupons…' : '🚀 Send / Assign Coupon(s) (કૂપન મોકલો)'}
                    </button>
                  </div>
                </form>

                {/* ── CARD 2: Create Custom Promo Code ── */}
                <form onSubmit={handleCreateCoupon} className="admin-panel admin-product-form">
                  <div className="admin-panel-heading">
                    <div>
                      <p className="admin-section-label">CREATE PROMO</p>
                      <h2>New Custom Coupon</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleSeedCoupons}
                        disabled={saving}
                        style={{
                          background: 'var(--c-surface2)',
                          color: 'var(--c-green2)',
                          border: '1.5px solid var(--c-border)',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '750',
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Seed 16 Standard Coupons
                      </button>
                      <button
                        type="button"
                        onClick={handleAutoCreateCoupon}
                        disabled={saving}
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                          color: '#fff',
                          border: 0,
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        + Quick Auto-Coupon
                      </button>
                    </div>
                  </div>

                  {/* Target Audience: All vs Selected */}
                  <div style={{ marginBottom: '14px', background: 'var(--c-surface2)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--c-border)' }}>
                    <span className="admin-label" style={{ marginBottom: '8px', display: 'block' }}>Initial Target Audience:</span>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: couponForm.targetType === 'all' ? '800' : '500', color: couponForm.targetType === 'all' ? 'var(--c-green)' : 'var(--c-text2)' }}>
                        <input
                          type="radio"
                          name="targetType"
                          value="all"
                          checked={couponForm.targetType === 'all'}
                          onChange={() => setCouponForm({ ...couponForm, targetType: 'all', allowedEmail: '', assignedUserName: '' })}
                        />
                        🌐 All Users (બધા ગ્રાહકો માટે)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: couponForm.targetType === 'selected' ? '800' : '500', color: couponForm.targetType === 'selected' ? 'var(--c-green)' : 'var(--c-text2)' }}>
                        <input
                          type="radio"
                          name="targetType"
                          value="selected"
                          checked={couponForm.targetType === 'selected'}
                          onChange={() => setCouponForm({ ...couponForm, targetType: 'selected' })}
                        />
                        👤 Selected User Only (પસંદગીના યૂઝર માટે)
                      </label>
                    </div>

                    {couponForm.targetType === 'selected' && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--c-border)' }}>
                        <label className="admin-label">
                          Select Registered Customer:
                          <select
                            className="admin-field mt-1"
                            value={couponForm.allowedEmail}
                            onChange={(e) => {
                              const found = users.find((u) => u.email === e.target.value);
                              setCouponForm({
                                ...couponForm,
                                allowedEmail: e.target.value,
                                assignedUserName: found ? found.name : '',
                              });
                            }}
                          >
                            <option value="">-- Choose customer or type email below --</option>
                            {users.map((u) => (
                              <option key={u._id} value={u.email}>
                                {u.name} ({u.email})
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="admin-label mt-2">
                          Or Customer Email Address:
                          <input
                            type="email"
                            placeholder="e.g. grower@example.com"
                            value={couponForm.allowedEmail || ''}
                            onChange={(e) => setCouponForm({ ...couponForm, allowedEmail: e.target.value })}
                            className="admin-field mt-1"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <label className="admin-label">
                    Coupon Code
                    <input
                      required
                      maxLength="25"
                      placeholder="e.g. KISAN25 or HARVEST"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      className="admin-field mt-1"
                      style={{ textTransform: 'uppercase', fontWeight: '750' }}
                    />
                  </label>

                  <div className="admin-field-grid">
                    <label className="admin-label">
                      Discount (%)
                      <input
                        required
                        type="number"
                        min="1"
                        max="90"
                        value={couponForm.discountPercent}
                        onChange={(e) => setCouponForm({ ...couponForm, discountPercent: e.target.value })}
                        className="admin-field mt-1"
                      />
                    </label>
                    <label className="admin-label">
                      Min Order Spend (₹)
                      <input
                        type="number"
                        min="0"
                        placeholder="Optional (e.g. 499)"
                        value={couponForm.minCartAmount}
                        onChange={(e) => setCouponForm({ ...couponForm, minCartAmount: e.target.value })}
                        className="admin-field mt-1"
                      />
                    </label>
                  </div>

                  <label className="admin-label">
                    Expiry Date
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={couponForm.expiresAt}
                      onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                      className="admin-field mt-1"
                    />
                  </label>

                  <label className="admin-label">
                    Description / Offer Note
                    <input
                      placeholder="e.g. 15% off for all Rabi season certified seeds"
                      maxLength="120"
                      value={couponForm.description}
                      onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                      className="admin-field mt-1"
                    />
                  </label>

                  <div className="admin-form-actions">
                    <button disabled={saving} type="submit" className="admin-primary-button">
                      {saving ? 'Creating…' : 'Create Custom Coupon'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Coupons List Panel */}
              <section className="admin-panel admin-inventory-panel">
                <div className="admin-panel-heading">
                  <div>
                    <p className="admin-section-label">ACTIVE & EXPIRED PROMOS</p>
                    <h2>Coupons Directory</h2>
                  </div>
                  <span className="admin-result-count">{coupons.length} coupons</span>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Code & Share</th>
                        <th>Discount</th>
                        <th>Assigned Customer</th>
                        <th>Min Spend</th>
                        <th>Status & Expiry</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => {
                        const isExpired = new Date(c.expiresAt) <= new Date();
                        const expFormatted = new Date(c.expiresAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });

                        return (
                          <tr key={c._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <strong style={{ fontFamily: 'monospace', fontSize: '13px', background: 'var(--c-surface2)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--c-border)' }}>
                                  {c.code}
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCouponCode(c.code)}
                                  title="Copy coupon code to give to user"
                                  style={{
                                    padding: '2px 7px',
                                    borderRadius: '5px',
                                    border: '1px solid var(--c-border)',
                                    background: 'var(--c-surface2)',
                                    color: 'var(--c-green2)',
                                    fontSize: '11px',
                                    fontWeight: '750',
                                    cursor: 'pointer',
                                  }}
                                >
                                  📋 Copy
                                </button>
                              </div>
                              {c.description && <span style={{ display: 'block', fontSize: '11px', color: 'var(--c-text3)', marginTop: '3px' }}>{c.description}</span>}
                            </td>
                            <td>
                              <span style={{ fontWeight: '800', color: 'var(--c-badge-text)', background: 'var(--c-badge-bg)', border: '1px solid var(--c-badge-border)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>
                                {c.discountPercent}% OFF
                              </span>
                            </td>
                            <td>
                              {c.targetType === 'all' ? (
                                <span style={{ fontSize: '11px', fontWeight: '750', color: 'var(--c-green2)' }}>
                                  🌐 All Users (બધા ગ્રાહકો)
                                </span>
                              ) : c.allowedEmail ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '750', color: '#f59e0b' }}>
                                    👤 {c.assignedUserName || c.allowedEmail}
                                  </span>
                                  {c.assignedUserName && c.allowedEmail && (
                                    <span style={{ fontSize: '10px', color: 'var(--c-text3)' }}>{c.allowedEmail}</span>
                                  )}
                                  {c.allowedEmails?.length > 1 && (
                                    <span style={{ fontSize: '10px', color: 'var(--c-green2)' }}>
                                      +{c.allowedEmails.length - 1} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span style={{ fontSize: '11px', color: 'var(--c-text3)' }}>
                                  🌐 All Users (બધા)
                                </span>
                              )}
                            </td>
                            <td>{c.minCartAmount > 0 ? `₹${c.minCartAmount}` : 'None'}</td>
                            <td>
                              {isExpired ? (
                                <span style={{ background: 'var(--c-badge-danger-bg)', color: 'var(--c-badge-danger-text)', border: '1px solid var(--c-badge-danger-border)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '750' }}>
                                  Expired ({expFormatted})
                                </span>
                              ) : !c.isActive ? (
                                <span style={{ background: 'var(--c-badge-neutral-bg)', color: 'var(--c-badge-neutral-text)', border: '1px solid var(--c-badge-neutral-border)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                                  Disabled
                                </span>
                              ) : (
                                <span style={{ background: 'var(--c-badge-bg)', color: 'var(--c-badge-text)', border: '1px solid var(--c-badge-border)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                                  Active (till {expFormatted})
                                </span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectCouponForDispatch(c)}
                                  title="Send or assign this coupon to a customer or all users"
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '5px',
                                    border: '1px solid var(--c-green2)',
                                    background: 'var(--c-badge-bg)',
                                    color: 'var(--c-badge-text)',
                                    fontSize: '11px',
                                    fontWeight: '750',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  📤 Send
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleCoupon(c)}
                                  disabled={busyCoupon === c._id}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '5px',
                                    border: '1px solid var(--c-border)',
                                    background: 'var(--c-surface)',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {c.isActive ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCoupon(c)}
                                  disabled={busyCoupon === c._id}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '5px',
                                    border: '1px solid var(--c-badge-danger-border)',
                                    background: 'var(--c-badge-danger-bg)',
                                    color: 'var(--c-badge-danger-text)',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!coupons.length && (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--c-text3)' }}>
                      <p style={{ margin: '0 0 10px' }}>No coupons created yet.</p>
                      <button
                        type="button"
                        onClick={handleSeedCoupons}
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                          color: '#fff',
                          border: 0,
                          padding: '8px 18px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Seed 16 Standard Kisan Coupons
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
