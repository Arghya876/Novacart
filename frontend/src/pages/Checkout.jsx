import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, Truck, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { clearCart } from '../store/cartSlice';
import axios from 'axios';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, coupon, shippingPrice, taxPrice, totalPrice } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);

  // Form States
  const [shippingDetails, setShippingDetails] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Address selection from saved addresses
  const handleSavedAddressSelect = (addr) => {
    setShippingDetails({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
    });
  };

  const handleInputChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    return (
      shippingDetails.street &&
      shippingDetails.city &&
      shippingDetails.state &&
      shippingDetails.zipCode &&
      shippingDetails.country
    );
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (!validateForm()) {
      setCheckoutError('Please fill in all shipping details');
      return;
    }

    if (paymentMethod === 'COD') {
      submitOrder();
    } else {
      // Open Payment Gateway Modal
      setPaymentModalOpen(true);
    }
  };

  const handleMockPaymentSuccess = async () => {
    setPaymentProcessing(true);
    // Simulate API call to gateway
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentModalOpen(false);
      submitOrder({
        transactionId: 'mock_tx_' + Math.random().toString(36).substring(2, 12),
      });
    }, 2000);
  };

  const submitOrder = async (paymentDetails = {}) => {
    setIsLoading(true);
    try {
      const orderData = {
        orderItems: cartItems,
        shippingAddress: shippingDetails,
        paymentMethod,
        paymentDetails,
        shippingPrice,
        taxPrice,
        couponCode: coupon?.code || null,
      };

      const res = await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        dispatch(clearCart());
        navigate(`/dashboard?tab=orders&success=true&orderId=${res.data.data._id}`);
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Failed to place order. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-950 dark:text-white">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all"
        >
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <h1 className="text-2xl font-bold text-neutral-950 dark:text-white">Checkout</h1>

      {checkoutError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 text-rose-500 rounded-2xl flex items-center gap-2 text-sm">
          <AlertTriangle className="h-5 w-5" /> {checkoutError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Shipping & Payment Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-8">
          
          {/* Shipping Address */}
          <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-violet-600 dark:text-violet-400" /> Shipping Details
            </h2>

            {/* Saved Addresses Selector */}
            {user?.addresses && user.addresses.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Use a Saved Address</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.addresses.map((addr) => (
                    <button
                      type="button"
                      key={addr._id}
                      onClick={() => handleSavedAddressSelect(addr)}
                      className="p-3 text-left rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-950/50 text-xs hover:border-violet-500 transition-colors"
                    >
                      <p className="font-bold capitalize">{user.name}</p>
                      <p className="text-neutral-400 mt-1 truncate">{`${addr.street}, ${addr.city}`}</p>
                      <p className="text-neutral-400">{`${addr.state}, ${addr.zipCode}`}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Address Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={shippingDetails.street}
                  onChange={handleInputChange}
                  required
                  placeholder="123 Main St, Apt 4B"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingDetails.city}
                  onChange={handleInputChange}
                  required
                  placeholder="New York"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">State / Region</label>
                <input
                  type="text"
                  name="state"
                  value={shippingDetails.state}
                  onChange={handleInputChange}
                  required
                  placeholder="NY"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Zip / Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingDetails.zipCode}
                  onChange={handleInputChange}
                  required
                  placeholder="10001"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Country</label>
                <input
                  type="text"
                  name="country"
                  value={shippingDetails.country}
                  onChange={handleInputChange}
                  required
                  placeholder="United States"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" /> Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'Stripe', name: 'Credit Card (Stripe)' },
                { id: 'Razorpay', name: 'UPI / Wallet (Razorpay)' },
                { id: 'COD', name: 'Cash on Delivery (COD)' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`p-4 rounded-2xl border flex flex-col gap-1.5 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'border-violet-600 bg-violet-50/20 dark:bg-violet-950/15'
                      : 'border-neutral-250 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-950/20 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold text-neutral-850 dark:text-neutral-200">{method.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-650 text-white font-bold text-sm transition-all shadow-md shadow-violet-500/10 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Place Order'}
          </button>
        </form>

        {/* Right: Cart Summary */}
        <div className="lg:col-span-1 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-neutral-950 dark:text-white uppercase tracking-wider">Order Items</h3>
          
          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.product} className="flex gap-3 text-xs">
                <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-neutral-50" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{item.title}</h4>
                  <p className="text-neutral-400 mt-0.5">Qty {item.quantity}</p>
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">${item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-500">
              <span>Shipping</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {shippingPrice === 0 ? 'Free' : `$${shippingPrice}`}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Estimated Tax</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">${taxPrice}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-neutral-950 dark:text-white pt-3 border-t border-neutral-100 dark:border-neutral-850">
              <span>Total</span>
              <span>${totalPrice}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Mock Payment Gateway Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {paymentMethod === 'Stripe' ? 'Stripe Secure Checkout' : 'Razorpay Secure Payment'}
              </h3>
              <p className="text-xs text-neutral-400">Sandbox / Simulation Mode</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/45 border border-neutral-200 dark:border-neutral-850 space-y-4">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-neutral-400">Merchant:</span>
                <span className="text-neutral-800 dark:text-neutral-200">NovaCart Inc.</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-neutral-400">Amount:</span>
                <span className="text-neutral-900 dark:text-white text-sm font-bold">${totalPrice}</span>
              </div>
            </div>

            {paymentProcessing ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="text-xs text-neutral-400">Processing transaction securely...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleMockPaymentSuccess}
                  className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" /> Authorize Payment (Success)
                </button>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="w-full h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300 text-xs font-bold transition-all"
                >
                  Cancel Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
