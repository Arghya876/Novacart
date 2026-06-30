import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Package, MapPin, Settings, Plus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { updateUserDetails, addUserAddress, deleteUserAddress } from '../../store/authSlice';
import axios from 'axios';

export default function UserDashboard() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { user, token } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [profileSuccess, setProfileSuccess] = useState('');

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
            { id: 'orders', name: 'My Orders', icon: Package },
            { id: 'addresses', name: 'Addresses', icon: MapPin },
            { id: 'profile', name: 'Profile Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-850'
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

                      {/* Shipping Tracking */}
                      {order.trackingNumber && (
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-950/45 rounded-2xl border border-neutral-200 dark:border-neutral-850 text-[10px] text-neutral-400">
                          Tracking Number: <span className="font-bold text-neutral-800 dark:text-neutral-200">{order.trackingNumber}</span>
                        </div>
                      )}

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
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
