import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package,
  MapPin,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Search,
  Copy,
  Check,
  FileText,
  X,
} from 'lucide-react';
import {
  updateUserDetails,
  addUserAddress,
  deleteUserAddress,
  deleteAccount,
  requestDeleteOtp,
} from '../../store/authSlice';
import { showToast } from '../../store/toastSlice';
import { formatPrice } from '../../utils/formatCurrency';
import axios from 'axios';

const OrderProgressTracker = ({ status, trackingNumber, deliveredAt, createdAt }) => {
  if (status === 'Cancelled') {
    return (
      <div className="p-4 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 flex items-center gap-3">
        <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-500 shrink-0">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400">Order Cancelled</h5>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            This order has been cancelled and refunded if payment was collected.
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', desc: 'Order received & verified' },
    { label: 'Shipped', desc: 'Dispatched in transit' },
    { label: 'Out for Delivery', desc: 'Courier assigned' },
    { label: 'Delivered', desc: 'Handed over to buyer' },
  ];

  const getStatusIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'Order Placed':
      case 'Pending':
      case 'Processing':
        return 0;
      case 'Shipped':
        return 1;
      case 'Out for Delivery':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(status);

  // Calculate estimated delivery date (4 days after createdAt)
  const orderDate = new Date(createdAt);
  const estimatedDelivery = new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(
    'en-US',
    { weekday: 'short', month: 'short', day: 'numeric' }
  );

  return (
    <div className="p-3.5 sm:p-5 bg-neutral-50/80 dark:bg-neutral-950/40 rounded-2xl sm:rounded-3xl border border-neutral-150 dark:border-neutral-850 space-y-4 sm:space-y-5">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-3 pb-3 border-b border-neutral-200/60 dark:border-neutral-850">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 shrink-0">
            <Truck className="h-4 w-4 animate-bounce" />
          </div>
          <div>
            <h5 className="text-[11px] sm:text-xs font-bold text-neutral-850 dark:text-neutral-150 uppercase tracking-wider">
              {status === 'Delivered' ? 'Package Delivered' : `Estimated Delivery: ${estimatedDelivery}`}
            </h5>
            <p className="text-[10px] text-neutral-400 font-medium">Carrier Partner: NovaExpress Priority Logistics</p>
          </div>
        </div>

        {trackingNumber && (
          <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] self-start sm:self-auto">
            <span className="text-neutral-400 font-medium">Tracking ID:</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono">{trackingNumber}</span>
          </div>
        )}
      </div>

      {/* Progress Stepper Visual Bar */}
      <div className="relative px-2 sm:px-4 py-2">
        {/* Line container positioning */}
        <div className="absolute left-[12.5%] right-[12.5%] top-[22px] sm:top-[26px] h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full z-0">
          <div
            className="h-full bg-linear-to-r from-violet-600 to-indigo-600 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step Nodes */}
        <div className="relative z-10 grid grid-cols-4 gap-1 w-full text-center">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={idx} className="flex flex-col items-center group">
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/20'
                      : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-400'
                  } ${isCurrent ? 'ring-4 ring-violet-500/20 scale-105 sm:scale-110' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 stroke-[3px]" />
                  ) : (
                    <span className="text-[10px] sm:text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                <div className="mt-2 text-center flex flex-col items-center max-w-[70px] sm:max-w-none">
                  <span
                    className={`text-[9px] sm:text-xs font-bold leading-tight ${
                      isCompleted ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-600'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[8px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 hidden md:block mt-0.5">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user, token } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || (user?.role === 'seller' ? 'profile' : 'orders')
  );
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('All');
  const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [profileSuccess, setProfileSuccess] = useState('');

  // Account Deletion States
  const [showDeleteOtpField, setShowDeleteOtpField] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');
  const [deletePreviewUrl, setDeletePreviewUrl] = useState('');
  const [deleteLocalError, setDeleteLocalError] = useState('');

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchMyOrders();
    }
  }, [activeTab]);

  const fetchMyOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get('/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this entire order?')) return;
    try {
      await axios.put(`/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(showToast({ message: 'Order cancelled successfully', type: 'info' }));
      fetchMyOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  const handleCancelItem = async (orderId, productId) => {
    if (!window.confirm('Are you sure you want to cancel this item?')) return;
    try {
      await axios.put(`/api/orders/${orderId}/items/${productId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(showToast({ message: 'Item cancelled successfully', type: 'info' }));
      fetchMyOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel item');
    }
  };

  const handleCopyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
    dispatch(showToast({ message: 'Order ID copied to clipboard!', type: 'success' }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileSuccess('');
    dispatch(updateUserDetails(profileForm)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setProfileSuccess('Profile updated successfully!');
      }
    });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    dispatch(addUserAddress(addressForm)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setShowAddressForm(false);
        setAddressForm({ street: '', city: '', state: '', zipCode: '', country: '', isDefault: false });
      }
    });
  };

  const handleDeleteAddress = (id) => {
    dispatch(deleteUserAddress(id));
  };

  const handleRequestDeleteOtp = () => {
    setDeleteLocalError('');
    setDeleteSuccessMsg('');
    setDeletePreviewUrl('');

    dispatch(requestDeleteOtp()).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setShowDeleteOtpField(true);
        setDeleteSuccessMsg('A 6-digit deletion OTP has been sent to your email.');
        if (res.payload?.previewUrl) {
          setDeletePreviewUrl(res.payload.previewUrl);
        }
      } else {
        setDeleteLocalError(res.payload || 'Failed to send OTP.');
      }
    });
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    setDeleteLocalError('');
    setDeleteSuccessMsg('');

    if (deleteOtp.length !== 6 || isNaN(deleteOtp)) {
      setDeleteLocalError('OTP must be a 6-digit number');
      return;
    }

    if (
      window.confirm(
        'WARNING: Are you sure you want to permanently delete your account? This action is irreversible.'
      )
    ) {
      dispatch(deleteAccount(deleteOtp)).then((res) => {
        if (res.meta.requestStatus === 'fulfilled') {
          alert('Account deleted successfully. We are sorry to see you go!');
          navigate('/login');
        } else {
          setDeleteLocalError(res.payload || 'Failed to delete account.');
        }
      });
    }
  };

  const isOrderSuccess = searchParams.get('success') === 'true';

  // Filter orders by search query & status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.orderItems.some((item) => item.title.toLowerCase().includes(orderSearchQuery.toLowerCase()));

    if (selectedOrderStatus === 'All') return matchesSearch;
    if (selectedOrderStatus === 'In Progress')
      return matchesSearch && ['Order Placed', 'Pending', 'Processing', 'Shipped', 'Out for Delivery'].includes(order.orderStatus);
    return matchesSearch && order.orderStatus === selectedOrderStatus;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {isOrderSuccess && (
        <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center gap-2 text-sm shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" /> Order placed successfully! Thank you for shopping with NovaCart. Order ID: {searchParams.get('orderId')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          {[
            ...(user?.role === 'customer' ? [{ id: 'orders', name: 'My Orders & Tracking', icon: Package }] : []),
            { id: 'addresses', name: 'Saved Addresses', icon: MapPin },
            { id: 'profile', name: 'Profile & Security', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-355 hover:bg-neutral-100 dark:hover:bg-neutral-850'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* My Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Orders & Delivery Tracking</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Manage your order history, track shipments, and download invoices.</p>
                </div>
              </div>

              {/* Order Search & Status Filter Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-150 dark:border-neutral-850 shadow-xs">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by Order ID or Product Title..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:border-violet-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'In Progress', 'Delivered', 'Cancelled'].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => setSelectedOrderStatus(statusOption)}
                      className={`h-9 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedOrderStatus === statusOption
                          ? 'bg-neutral-900 dark:bg-neutral-800 text-white'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-850'
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              {ordersLoading ? (
                <div className="py-16 flex justify-center">
                  <div className="h-7 w-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-3">
                  <Package className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
                  <p className="text-xs text-neutral-400 font-medium">No orders found matching your search.</p>
                  <button
                    onClick={() => {
                      setOrderSearchQuery('');
                      setSelectedOrderStatus('All');
                    }}
                    className="h-8 px-4 text-xs font-semibold text-violet-600 hover:underline"
                  >
                    Clear Search Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOrders.map((order) => (
                    <div
                      key={order._id}
                      className="p-6 rounded-3xl border border-neutral-150 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-6 overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-150 dark:border-neutral-850 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-400 font-medium">Order #</span>
                            <span className="font-bold text-neutral-900 dark:text-white font-mono">{order._id}</span>
                            <button
                              onClick={() => handleCopyOrderId(order._id)}
                              className="text-neutral-400 hover:text-violet-600 transition-colors p-1"
                              title="Copy Order ID"
                            >
                              {copiedOrderId === order._id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider">Total Amount</p>
                            <p className="font-bold text-sm text-neutral-900 dark:text-white mt-0.5">{formatPrice(order.totalPrice)}</p>
                          </div>

                          <button
                            onClick={() => setInvoiceModalOrder(order)}
                            className="h-9 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-500 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <FileText className="h-3.5 w-3.5 text-violet-500" /> Invoice
                          </button>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-3">
                        {order.orderItems.map((item) => (
                          <div key={item.product} className="flex gap-4 text-xs items-center justify-between p-3 rounded-2xl bg-neutral-50/50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-850/40">
                            <div className="flex gap-3 items-center min-w-0 flex-1">
                              <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-900 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <Link to={`/product/${item.product}`} className="font-bold text-neutral-850 dark:text-neutral-150 hover:text-violet-600 transition-colors truncate block">
                                  {item.title}
                                </Link>
                                <div className="flex items-center gap-2 text-neutral-450 mt-1 text-[11px]">
                                  <span>Qty: {item.quantity}</span>
                                  <span>•</span>
                                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">{formatPrice(item.price)}</span>
                                  {item.status === 'Cancelled' && (
                                    <span className="ml-2 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md">
                                      Cancelled
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Individual Item Cancel Button */}
                            {(order.orderStatus === 'Order Placed' || order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && item.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleCancelItem(order._id, item.product)}
                                className="h-7 px-2.5 rounded-lg border border-rose-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-[10px] font-semibold transition-all shrink-0 cursor-pointer"
                              >
                                Cancel Item
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Visual Order Progress Stepper */}
                      <OrderProgressTracker
                        status={order.orderStatus}
                        trackingNumber={order.trackingNumber}
                        deliveredAt={order.deliveredAt}
                        createdAt={order.createdAt}
                      />

                      {/* Footer Actions */}
                      {(order.orderStatus === 'Order Placed' || order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
                        <div className="pt-2 border-t border-neutral-150 dark:border-neutral-850 flex justify-end">
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="h-8 px-4 rounded-xl border border-rose-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Cancel Entire Order
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Shipping Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Address
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="p-5 border border-neutral-150 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl space-y-4 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Street Address</label>
                      <input
                        type="text"
                        required
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">City</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">State</label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Zip Code</label>
                      <input
                        type="text"
                        required
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Country</label>
                      <input
                        type="text"
                        required
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Address
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="p-5 rounded-3xl border border-neutral-150 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-xs flex justify-between items-start"
                    >
                      <div className="text-xs space-y-1.5 text-neutral-500 dark:text-neutral-400">
                        <p className="font-bold text-neutral-850 dark:text-neutral-200 capitalize">{user.name}</p>
                        <p>{addr.street}</p>
                        <p>{`${addr.city}, ${addr.state} ${addr.zipCode}`}</p>
                        <p>{addr.country}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400 py-8 sm:col-span-2">No saved addresses found.</p>
                )}
              </div>
            </div>
          )}

          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Profile & Security Settings</h2>

              {profileSuccess && (
                <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="p-6 border border-neutral-150 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl space-y-4 shadow-xs max-w-lg">
                <div className="grid grid-cols-1 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </form>

              {/* Danger Zone */}
              <div className="p-6 border border-rose-200 dark:border-rose-900/30 bg-rose-50/10 dark:bg-rose-950/5 rounded-3xl space-y-4 shadow-xs max-w-lg">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-rose-550 dark:text-rose-400 uppercase tracking-wider">Danger Zone</h3>
                  <p className="text-[11px] text-neutral-450 dark:text-neutral-400">
                    Permanently delete your account and all associated data. This action is irreversible and requires OTP verification.
                  </p>
                </div>

                {deleteSuccessMsg && (
                  <div className="p-3 text-[11px] bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                    {deleteSuccessMsg}
                  </div>
                )}

                {deletePreviewUrl && (
                  <div className="p-3 text-[11px] bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-350">
                      [Dev Mode] Email sent! Open Ethereal inbox to copy deletion OTP:
                    </p>
                    <a
                      href={deletePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold underline text-[10px]"
                    >
                      View OTP Email ↗
                    </a>
                  </div>
                )}

                {deleteLocalError && (
                  <div className="p-3 text-[11px] bg-rose-50 dark:bg-rose-950/25 text-rose-500 border border-rose-200 dark:border-rose-900/30 rounded-xl">
                    {deleteLocalError}
                  </div>
                )}

                {!showDeleteOtpField ? (
                  <button
                    type="button"
                    onClick={handleRequestDeleteOtp}
                    className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                  >
                    Request Deletion OTP
                  </button>
                ) : (
                  <form onSubmit={handleDeleteAccount} className="space-y-3.5">
                    <div className="space-y-1.5 text-xs">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Enter Deletion OTP</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={deleteOtp}
                        onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono text-center tracking-[0.2em] text-neutral-900 dark:text-white"
                        placeholder="123456"
                      />
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="submit"
                        className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                      >
                        Confirm Delete Account
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteOtpField(false);
                          setDeleteOtp('');
                          setDeleteLocalError('');
                          setDeleteSuccessMsg('');
                          setDeletePreviewUrl('');
                        }}
                        className="h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-600" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Order Invoice</h3>
              </div>
              <button
                onClick={() => setInvoiceModalOrder(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Content Container */}
            <div id="printable-invoice" className="space-y-6 text-xs text-neutral-800 dark:text-neutral-200">
              {/* Company & Order Meta */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-lg font-bold text-violet-600">NovaCart Inc.</h4>
                  <p className="text-[11px] text-neutral-400">Official Purchase Invoice</p>
                  <p className="text-[11px] text-neutral-400 mt-1">support@novacart.com</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-sm text-neutral-900 dark:text-white">Invoice #{invoiceModalOrder._id.substring(0, 10).toUpperCase()}</p>
                  <p className="text-neutral-400 text-[11px]">
                    Date: {new Date(invoiceModalOrder.createdAt).toLocaleDateString()}
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    {invoiceModalOrder.orderStatus}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              {invoiceModalOrder.shippingAddress && (
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                  <h5 className="font-bold uppercase tracking-wider text-[10px] text-neutral-400">Billed & Shipped To:</h5>
                  <p className="font-bold">{invoiceModalOrder.shippingAddress.name || user?.name}</p>
                  <p>{invoiceModalOrder.shippingAddress.street}</p>
                  <p>{`${invoiceModalOrder.shippingAddress.city}, ${invoiceModalOrder.shippingAddress.state} ${invoiceModalOrder.shippingAddress.zipCode}`}</p>
                  <p>{invoiceModalOrder.shippingAddress.country}</p>
                </div>
              )}

              {/* Items Table */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 font-bold uppercase text-[10px]">
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {invoiceModalOrder.orderItems.map((item) => (
                      <tr key={item.product}>
                        <td className="p-3 font-semibold">{item.title}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">{formatPrice(item.price)}</td>
                        <td className="p-3 text-right font-bold">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-full max-w-xs space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(invoiceModalOrder.itemsPrice || invoiceModalOrder.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Shipping</span>
                    <span>{formatPrice(invoiceModalOrder.shippingPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Tax</span>
                    <span>{formatPrice(invoiceModalOrder.taxPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <span>Grand Total</span>
                    <span className="text-violet-600 dark:text-violet-400">{formatPrice(invoiceModalOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => window.print()}
                className="h-10 px-5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/10 cursor-pointer"
              >
                Print / Save Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
