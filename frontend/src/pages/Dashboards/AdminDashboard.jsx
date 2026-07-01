import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Tag, Layers, Users, DollarSign, ShoppingBag, Trash2, CheckCircle2, AlertTriangle, ShieldAlert, FileText, Package } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const { token } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('analytics');

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image: '' });
  const [categorySuccess, setCategorySuccess] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: '',
    minActiveValue: '',
    expiryDate: '',
  });
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponError, setCouponError] = useState('');

  // Users State (Admin User Management)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError] = useState('');

  // Products State (Admin Product Management)
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Orders State (Admin Order Management)
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'coupons') fetchCoupons();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'products') fetchAllProducts();
    if (activeTab === 'orders') fetchAllOrders();
  }, [activeTab]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await axios.get('/api/analytics/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await axios.get('/api/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCouponsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUserError('');
    try {
      const res = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data);
    } catch (err) {
      setUserError('Failed to fetch users list');
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchAllOrders = async () => {
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

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryError('');
    setCategorySuccess('');

    try {
      const res = await axios.post('/api/categories', categoryForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setCategorySuccess('Category created successfully!');
        setCategoryForm({ name: '', description: '', image: '' });
        fetchCategories();
      }
    } catch (err) {
      setCategoryError(err.response?.data?.error || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete category');
      console.error(err);
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await axios.post('/api/coupons', couponForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setCouponSuccess('Coupon created successfully!');
        setCouponForm({
          code: '',
          discountType: 'percentage',
          discountAmount: '',
          minActiveValue: '',
          expiryDate: '',
        });
        fetchCoupons();
      }
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await axios.delete(`/api/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete coupon');
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllProducts();
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
      fetchAllOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Admin Dashboard</h1>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-neutral-100 dark:bg-neutral-850 rounded-2xl self-start lg:self-auto">
          {[
            { id: 'analytics', name: 'Overview' },
            { id: 'users', name: 'Users' },
            { id: 'products', name: 'Products' },
            { id: 'orders', name: 'Orders' },
            { id: 'categories', name: 'Categories' },
            { id: 'coupons', name: 'Coupons' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-9 px-4 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-250'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {analyticsLoading || !analytics ? (
            <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-violet-150 dark:bg-violet-950/40 rounded-2xl text-violet-600"><DollarSign className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Revenue</p>
                    <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">${analytics.summary.totalRevenue}</p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-violet-150 dark:bg-violet-950/40 rounded-2xl text-violet-600"><ShoppingBag className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Orders</p>
                    <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{analytics.summary.totalOrders}</p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-violet-150 dark:bg-violet-950/40 rounded-2xl text-violet-600"><Users className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Customers</p>
                    <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{analytics.summary.totalUsers}</p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-violet-150 dark:bg-violet-950/40 rounded-2xl text-violet-600"><Users className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Sellers</p>
                    <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{analytics.summary.totalSellers}</p>
                  </div>
                </div>
              </div>

              {/* Sales Chart (CSS Visual Representation) */}
              {analytics.salesOverTime && analytics.salesOverTime.length > 0 && (
                <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Sales Performance</h3>
                  
                  {/* Bars Container */}
                  <div className="flex items-end justify-between gap-2 h-48 pt-6 border-b border-l border-neutral-150 dark:border-neutral-800 px-4">
                    {analytics.salesOverTime.map((data) => {
                      const maxRevenue = Math.max(...analytics.salesOverTime.map((d) => d.revenue));
                      const heightPercent = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;

                      return (
                        <div key={data.month} className="flex flex-col items-center flex-1 group relative">
                          <div className="absolute bottom-full mb-2 bg-neutral-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold whitespace-nowrap">
                            ${data.revenue} ({data.orders} orders)
                          </div>
                          <div
                            style={{ height: `${Math.max(8, heightPercent)}%` }}
                            className="w-full bg-violet-600 hover:bg-violet-500 rounded-t-lg transition-all"
                          />
                          <span className="text-[10px] text-neutral-455 mt-2 font-semibold">{data.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Users Management Tab */}
      {/* Users Management Tab */}
      {activeTab === 'users' && (() => {
        const customers = users.filter((u) => u.role === 'customer');
        const sellers = users.filter((u) => u.role === 'seller');
        return (
          <div className="space-y-8">
            {/* Customers Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-neutral-450 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-violet-500" /> Customer Accounts ({customers.length})
              </h2>
              {usersLoading ? (
                <div className="py-6 flex justify-center"><div className="h-5 w-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : userError ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 text-rose-500 rounded-2xl">{userError}</div>
              ) : (
                <div className="border border-neutral-100 dark:border-neutral-850 rounded-3xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-950 text-neutral-450 border-b border-neutral-150 dark:border-neutral-850">
                        <th className="px-6 py-4 font-bold">Customer Details</th>
                        <th className="px-6 py-4 font-bold">Email</th>
                        <th className="px-6 py-4 font-bold">Registered Date</th>
                        <th className="px-6 py-4 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-neutral-400">No customers registered</td>
                        </tr>
                      ) : (
                        customers.map((item) => (
                          <tr key={item._id} className="border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20">
                            <td className="px-6 py-4 flex items-center gap-3">
                              {item.avatar ? (
                                <img src={item.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 flex items-center justify-center font-bold">
                                  {item.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-semibold text-neutral-850 dark:text-neutral-200">{item.name}</span>
                            </td>
                            <td className="px-6 py-4 text-neutral-500">{item.email}</td>
                            <td className="px-6 py-4 text-neutral-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDeleteUser(item._id)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sellers Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-neutral-450 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-emerald-500" /> Seller Accounts ({sellers.length})
              </h2>
              {usersLoading ? (
                <div className="py-6 flex justify-center"><div className="h-5 w-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : userError ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 text-rose-500 rounded-2xl">{userError}</div>
              ) : (
                <div className="border border-neutral-100 dark:border-neutral-850 rounded-3xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-950 text-neutral-450 border-b border-neutral-150 dark:border-neutral-850">
                        <th className="px-6 py-4 font-bold">Seller Details</th>
                        <th className="px-6 py-4 font-bold">Email</th>
                        <th className="px-6 py-4 font-bold">Registered Date</th>
                        <th className="px-6 py-4 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-neutral-400">No sellers registered</td>
                        </tr>
                      ) : (
                        sellers.map((item) => (
                          <tr key={item._id} className="border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20">
                            <td className="px-6 py-4 flex items-center gap-3">
                              {item.avatar ? (
                                <img src={item.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold">
                                  {item.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-semibold text-neutral-850 dark:text-neutral-200">{item.name}</span>
                            </td>
                            <td className="px-6 py-4 text-neutral-500">{item.email}</td>
                            <td className="px-6 py-4 text-neutral-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDeleteUser(item._id)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Products Management Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-violet-600" /> System Products
          </h2>

          {productsLoading ? (
            <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="border border-neutral-100 dark:border-neutral-850 rounded-3xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-950 text-neutral-450 border-b border-neutral-150 dark:border-neutral-850">
                    <th className="px-6 py-4 font-bold">Product</th>
                    <th className="px-6 py-4 font-bold">Brand</th>
                    <th className="px-6 py-4 font-bold">Category</th>
                    <th className="px-6 py-4 font-bold">Price</th>
                    <th className="px-6 py-4 font-bold">Stock</th>
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
                      <td className="px-6 py-4 text-neutral-550">{item.brand}</td>
                      <td className="px-6 py-4 text-neutral-550 capitalize">{item.category?.name}</td>
                      <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">${item.discountPrice > 0 ? item.discountPrice : item.price}</td>
                      <td className={`px-6 py-4 font-bold ${item.stock === 0 ? 'text-rose-500' : 'text-neutral-500'}`}>{item.stock}</td>
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

      {/* Orders Management Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-600" /> System Orders
          </h2>

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
                      <p className="text-neutral-400">Customer</p>
                      <p className="font-semibold mt-0.5 capitalize">{order.user?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Total Price</p>
                      <p className="font-bold mt-0.5">${order.totalPrice}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Status</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/25'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/25'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.product} className="flex gap-3 text-xs items-center">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-50" />
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Category Form */}
          <div className="lg:col-span-1 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-600" /> New Category
            </h2>

            {categoryError && <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/25 text-rose-500 rounded-xl">{categoryError}</div>}
            {categorySuccess && <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/25 text-emerald-650 rounded-xl">{categorySuccess}</div>}

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Electronics"
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Description</label>
                <textarea
                  required
                  rows={4}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Premium electronic gadgets..."
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Image URL</label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/10"
              >
                Create Category
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Active Categories ({categories.length})</h2>
            
            {categoriesLoading ? (
              <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="p-4 rounded-2xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {cat.image ? (
                        <img src={cat.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 flex items-center justify-center font-bold text-sm">
                          {cat.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-250 capitalize">{cat.name}</h4>
                        <p className="text-[10px] text-neutral-455 dark:text-neutral-500 line-clamp-2 mt-0.5">{cat.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="p-1.5 rounded-lg text-neutral-450 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Coupon Form */}
          <div className="lg:col-span-1 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-violet-600" /> New Coupon
            </h2>

            {couponError && <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/25 text-rose-500 rounded-xl">{couponError}</div>}
            {couponSuccess && <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/25 text-emerald-655 rounded-xl">{couponSuccess}</div>}

            <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  placeholder="NOVACART50"
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 uppercase font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Discount Type</label>
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-semibold"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Discount Value</label>
                <input
                  type="number"
                  required
                  value={couponForm.discountAmount}
                  onChange={(e) => setCouponForm({ ...couponForm, discountAmount: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Minimum Active Order Subtotal ($)</label>
                <input
                  type="number"
                  required
                  value={couponForm.minActiveValue}
                  onChange={(e) => setCouponForm({ ...couponForm, minActiveValue: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/10"
              >
                Create Coupon
              </button>
            </form>
          </div>

          {/* Coupons List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Active Coupons ({coupons.length})</h2>

            {couponsLoading ? (
              <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="p-5 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 flex items-center justify-between shadow-sm"
                  >
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">{coupon.code}</h4>
                      <p className="text-neutral-500">
                        Discount:{' '}
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `$${coupon.discountAmount}`}
                        </span>
                      </p>
                      <p className="text-neutral-400 text-[10px]">Min Purchase: ${coupon.minActiveValue}</p>
                      <p className="text-neutral-400 text-[10px]">Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="p-1.5 rounded-lg text-neutral-450 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
