import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Package, ShoppingBag, DollarSign, TrendingUp, Edit, Trash2, Check, X, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function SellerDashboard() {
  const { token } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('analytics');
  
  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Categories list for product creation
  const [categories, setCategories] = useState([]);

  // Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'], // Default premium mockup image
    category: '',
    brand: '',
    stock: '',
    tags: '',
    specificationsKey: '',
    specificationsValue: '',
  });
  const [specs, setSpecs] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'products') fetchSellerProducts();
    if (activeTab === 'orders') fetchSellerOrders();
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.data);
      if (res.data.data.length > 0) {
        setProductForm((prev) => ({ ...prev, category: res.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await axios.get('/api/analytics/seller', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchSellerProducts = async () => {
    setProductsLoading(true);
    try {
      // Decode JWT to get seller ID, or let backend handle it.
      // Actually, we can fetch `/api/products` and filter by seller ID on client, or backend can support a seller filter.
      // Wait, let's look at `productController.js` `getProducts`. It filters by whatever is in `req.query`!
      // So if we pass `seller` query parameter, it will filter by that seller!
      // Wait, where do we get the seller's ID? It's in `user.id`.
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await axios.get(`/api/products?seller=${user.id}`);
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchSellerOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAddSpec = () => {
    if (productForm.specificationsKey && productForm.specificationsValue) {
      setSpecs((prev) => ({
        ...prev,
        [productForm.specificationsKey.trim()]: productForm.specificationsValue.trim(),
      }));
      setProductForm((prev) => ({ ...prev, specificationsKey: '', specificationsValue: '' }));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      const tagsArray = productForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const postData = {
        title: productForm.title,
        description: productForm.description,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : 0,
        images: productForm.images,
        category: productForm.category,
        brand: productForm.brand,
        stock: Number(productForm.stock),
        tags: tagsArray,
        specifications: specs,
      };

      const res = await axios.post('/api/products', postData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setFormSuccess('Product created successfully!');
        setSpecs({});
        setProductForm({
          title: '',
          description: '',
          price: '',
          discountPrice: '',
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'],
          category: categories[0]?._id || '',
          brand: '',
          stock: '',
          tags: '',
          specificationsKey: '',
          specificationsValue: '',
        });
        fetchSellerProducts();
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSellerProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product');
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSellerOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Seller Portal</h1>
        
        {/* Tab Selection */}
        <div className="flex gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-850 rounded-2xl self-start sm:self-auto">
          {[
            { id: 'analytics', name: 'Dashboard' },
            { id: 'products', name: 'Products' },
            { id: 'orders', name: 'Orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-9 px-4 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Summary Cards */}
          {analyticsLoading || !analytics ? (
            <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600"><DollarSign className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Revenue</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">${analytics.summary.totalRevenue}</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600"><Package className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">My Products</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{analytics.summary.totalProducts}</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600"><ShoppingBag className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Items Sold</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{analytics.summary.totalItemsSold}</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Products */}
          {analytics && analytics.topProducts.length > 0 && (
            <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Top Selling Products</h3>
              <div className="space-y-4">
                {analytics.topProducts.map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-xs pb-3 border-b border-neutral-100 dark:border-neutral-850 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">{item.title}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 dark:text-white">${item.revenue}</p>
                      <p className="text-neutral-400 mt-0.5">{item.quantitySold} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Product Catalog</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <form onSubmit={handleProductSubmit} className="p-6 border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl space-y-6 shadow-md">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Add New Product</h3>
              
              {formError && <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/25 text-rose-500 rounded-xl">{formError}</div>}
              {formSuccess && <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/25 text-emerald-650 rounded-xl">{formSuccess}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Brand</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 capitalize font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Discount Price ($)</label>
                  <input
                    type="number"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    placeholder="nike, running, sports, shoes"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>

                {/* Specs Creator */}
                <div className="sm:col-span-3 space-y-3">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Specifications</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Specification Name (e.g. Color)"
                      value={productForm.specificationsKey}
                      onChange={(e) => setProductForm({ ...productForm, specificationsKey: e.target.value })}
                      className="flex-1 h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                    />
                    <input
                      type="text"
                      placeholder="Specification Value (e.g. Red)"
                      value={productForm.specificationsValue}
                      onChange={(e) => setProductForm({ ...productForm, specificationsValue: e.target.value })}
                      className="flex-1 h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="h-10 px-4 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white font-semibold"
                    >
                      Add Spec
                    </button>
                  </div>

                  {/* Display Added Specs */}
                  {Object.keys(specs).length > 0 && (
                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 flex flex-wrap gap-2">
                      {Object.entries(specs).map(([key, val]) => (
                        <span key={key} className="inline-flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1 text-xs">
                          <span className="font-bold capitalize">{key}:</span> {val}
                          <button type="button" onClick={() => setSpecs((prev) => { const c = { ...prev }; delete c[key]; return c; })} className="text-rose-500 font-bold ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full h-11 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/10 flex items-center justify-center gap-2"
              >
                {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Product'}
              </button>
            </form>
          )}

          {/* Catalog Table */}
          {productsLoading ? (
            <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="border border-neutral-100 dark:border-neutral-850 rounded-3xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-950 text-neutral-450 border-b border-neutral-150 dark:border-neutral-850">
                    <th className="px-6 py-4 font-bold">Product</th>
                    <th className="px-6 py-4 font-bold">Stock</th>
                    <th className="px-6 py-4 font-bold">Price</th>
                    <th className="px-6 py-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item._id} className="border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={item.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-semibold text-neutral-850 dark:text-neutral-200 line-clamp-1">{item.title}</span>
                      </td>
                      <td className={`px-6 py-4 font-bold ${item.stock === 0 ? 'text-rose-500' : 'text-neutral-500'}`}>{item.stock}</td>
                      <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">${item.discountPrice > 0 ? item.discountPrice : item.price}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteProduct(item._id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Customer Orders</h2>

          {ordersLoading ? (
            <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-850 text-xs">
                    <div>
                      <p className="text-neutral-400">Order ID</p>
                      <p className="font-semibold mt-0.5">{order._id}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Date</p>
                      <p className="font-semibold mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Items Status</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                        order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.product} className="flex gap-3 text-xs items-center">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">{item.title}</h4>
                          <p className="text-neutral-400">Qty {item.quantity} • ${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Action Buttons */}
                  {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                    <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-850">
                      {order.orderStatus === 'Processing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'Shipped')}
                          className="h-8 px-4 rounded-lg bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-850 text-white text-xs font-semibold"
                        >
                          Mark as Shipped
                        </button>
                      )}
                      {order.orderStatus === 'Shipped' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'Delivered')}
                          className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                        >
                          Mark as Delivered
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'Cancelled')}
                        className="h-8 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
