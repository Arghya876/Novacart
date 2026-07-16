import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Package, MapPin, Settings, Plus, Trash2, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import { updateUserDetails, addUserAddress, deleteUserAddress, deleteAccount, requestDeleteOtp } from '../../store/authSlice';
import axios from 'axios';

const OrderProgressTracker = ({ status, trackingNumber, deliveredAt, createdAt }) => {
  if (status === 'Cancelled') {
    return (
      <div className="p-4 bg-rose-55/40 dark:bg-rose-950/10 rounded-2xl border border-rose-100 dark:border-rose-950/20 flex items-center gap-3">
        <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400">Order Cancelled</h5>
          <p className="text-[10px] text-neutral-450 dark:text-neutral-500 mt-0.5">This order has been cancelled and will not be delivered.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { label: 'Ordered', statusKey: 'Processing' },
    { label: 'Processing', statusKey: 'Processing' },
    { label: 'Shipped', statusKey: 'Shipped' },
    { label: 'Delivered', statusKey: 'Delivered' },
  ];

  const getStatusIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(status);

  return (
    <div className="p-5 bg-neutral-50 dark:bg-neutral-950/30 rounded-3xl border border-neutral-100 dark:border-neutral-850/50 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-850/40">
        <h5 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
          <Truck className="h-4 w-4 text-violet-500 animate-pulse" /> Delivery Progress
        </h5>
        {trackingNumber && (
          <p className="text-[10px] text-neutral-450 dark:text-neutral-400">
            Tracking Number: <span className="font-bold text-neutral-700 dark:text-neutral-200 select-all">{trackingNumber}</span>
          </p>
        )}
      </div>

      <div className="relative flex items-center justify-between w-full max-w-xl mx-auto px-4 py-2">
        {/* Connection Line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full z-0">
          <div 
            className="h-full bg-violet-600 transition-all duration-500 ease-out rounded-full" 
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          
          return (
            <div key={idx} className="relative flex flex-col items-center z-10">
              {/* Circle indicator */}
              <div 
                className={`w-7.5 h-7.5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/20' 
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-805 text-neutral-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4.5 w-4.5 stroke-[3px]" />
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="absolute top-9 flex flex-col items-center min-w-[70px] text-center">
                <span className={`text-[10px] font-bold ${isCompleted ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400'}`}>
                  {step.label}
                </span>
                {idx === 0 && (
                  <span className="text-[8px] text-neutral-450 dark:text-neutral-500 whitespace-nowrap mt-0.5">
                    {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {idx === 3 && status === 'Delivered' && deliveredAt && (
                  <span className="text-[8px] text-emerald-500 dark:text-emerald-400 whitespace-nowrap mt-0.5">
                    {new Date(deliveredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Spacer to account for absolute labels */}
      <div className="h-5" />
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
    try {
      await axios.put(`/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  const handleCancelItem = async (orderId, productId) => {
    try {
      await axios.put(`/api/orders/${orderId}/items/${productId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel item');
    }
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

    if (window.confirm('WARNING: Are you sure you want to permanently delete your account? This action is irreversible.')) {
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {isOrderSuccess && (
        <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5" /> Order placed successfully! Thank you for shopping with NovaCart. Order ID: {searchParams.get('orderId')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          {[
            ...(user?.role === 'customer' ? [{ id: 'orders', name: 'My Orders', icon: Package }] : []),
            { id: 'addresses', name: 'Addresses', icon: MapPin },
            { id: 'profile', name: 'Profile Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
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
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Order History</h2>
              
              {ordersLoading ? (
                <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : orders.length === 0 ? (
                <p className="text-xs text-neutral-400 py-8">You haven't placed any orders yet.</p>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-850 text-xs">
                        <div>
                          <p className="text-neutral-400">Order Placed</p>
                          <p className="font-semibold mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">Total Price</p>
                          <p className="font-bold mt-0.5">${order.totalPrice}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400 font-bold">Status</p>
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
                          <div key={item.product} className="flex gap-3 text-xs items-center justify-between">
                            <div className="flex gap-3 items-center min-w-0 flex-1">
                              <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-neutral-50" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{item.title}</h4>
                                <p className="text-neutral-450">
                                  Qty {item.quantity} • ${item.price}
                                  {item.status === 'Cancelled' && (
                                    <span className="ml-2 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/25 px-1.5 py-0.5 rounded-md">
                                      Cancelled
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Individual Item Cancel Button */}
                            {order.orderStatus === 'Processing' && item.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleCancelItem(order._id, item.product)}
                                className="ml-4 h-7 px-2.5 rounded-lg border border-rose-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-[10px] font-semibold transition-all shrink-0"
                              >
                                Cancel Item
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Shipping Progress Tracker */}
                      <OrderProgressTracker 
                        status={order.orderStatus} 
                        trackingNumber={order.trackingNumber} 
                        deliveredAt={order.deliveredAt} 
                        createdAt={order.createdAt} 
                      />

                      {(order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
                        <div className="pt-2 border-t border-neutral-150 dark:border-neutral-850 flex justify-end">
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="h-8 px-4 rounded-xl border border-rose-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-xs font-semibold transition-all"
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

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Shipping Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Address
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="p-5 border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl space-y-4 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Street Address</label>
                      <input
                        type="text"
                        required
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">City</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">State</label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Zip Code</label>
                      <input
                        type="text"
                        required
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Country</label>
                      <input
                        type="text"
                        required
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold"
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
                      className="p-5 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex justify-between items-start"
                    >
                      <div className="text-xs space-y-1.5 text-neutral-500">
                        <p className="font-bold text-neutral-850 dark:text-neutral-200 capitalize">{user.name}</p>
                        <p>{addr.street}</p>
                        <p>{`${addr.city}, ${addr.state} ${addr.zipCode}`}</p>
                        <p>{addr.country}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all"
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
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Profile Information</h2>
              
              {profileSuccess && (
                <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="p-6 border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl space-y-4 shadow-sm max-w-lg">
                <div className="grid grid-cols-1 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold"
                >
                  Save Changes
                </button>
              </form>

              {/* Danger Zone */}
              <div className="p-6 border border-rose-200 dark:border-rose-900/30 bg-rose-50/10 dark:bg-rose-950/5 rounded-3xl space-y-4 shadow-sm max-w-lg">
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
                    className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
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
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono text-center tracking-[0.2em]"
                        placeholder="123456"
                      />
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="submit"
                        className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
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
    </div>
  );
}
