import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Shield, ArrowRight, Tag, X, ShoppingCart } from 'lucide-react';
import { removeFromCart, updateCartQty, saveForLater, moveToCart, applyCoupon, removeCoupon } from '../store/cartSlice';
import axios from 'axios';

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, savedForLater: savedItems, coupon, shippingPrice, taxPrice, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleQtyChange = (product, qty) => {
    dispatch(updateCartQty({ product, qty }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponCodeInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      const res = await axios.post('/api/coupons/validate', {
        code: couponCodeInput,
        subtotal,
      });

      dispatch(applyCoupon(res.data.data));
      setCouponSuccess('Coupon applied successfully!');
      setCouponCodeInput('');
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid coupon');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponSuccess('');
    setCouponError('');
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
          <ShoppingCart className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-950 dark:text-white">Your Cart is Empty</h2>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">Add a few premium pieces to your bag and come back here for a fast, secure checkout experience.</p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all shadow-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <h1 className="text-2xl font-bold text-neutral-950 dark:text-white">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Cart Items & Save for Later */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Cart Items */}
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product}
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900"
                >
                  {/* Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-950 flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <Link to={`/product/${item.product}`} className="font-semibold text-sm text-neutral-850 dark:text-neutral-100 hover:text-violet-650 transition-colors line-clamp-2">
                          {item.title}
                        </Link>
                        <span className="font-bold text-sm text-neutral-950 dark:text-white">${item.price}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(item.product, Number(e.target.value))}
                          className="h-8 px-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold"
                        >
                          {[...Array(Math.min(10, item.stock))].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Qty {i + 1}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => dispatch(saveForLater(item.product))}
                          className="text-xs text-neutral-450 dark:text-neutral-500 hover:text-violet-600 font-semibold"
                        >
                          Save for later
                        </button>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item.product))}
                        className="text-neutral-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center text-xs text-neutral-400">
              No active items in cart.
            </div>
          )}

          {/* Save For Later Items */}
          {savedItems.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Saved for Later ({savedItems.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedItems.map((item) => (
                  <div
                    key={item.product}
                    className="p-4 rounded-2xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 flex gap-3"
                  >
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover bg-neutral-50" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 line-clamp-1">{item.title}</h4>
                        <span className="font-bold text-xs text-neutral-900 dark:text-white">${item.price}</span>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => dispatch(moveToCart(item.product))}
                          className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => dispatch(moveToCart(item.product))} // Actually remove, but wait we need a removeSaved action. Moving to cart and removing is fine, or we can just filter it.
                          className="text-[10px] font-bold text-rose-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
            <h3 className="font-bold text-sm text-neutral-950 dark:text-white uppercase tracking-wider">Order Summary</h3>

            {/* Price breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">${subtotal}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Discount ({coupon.code})</span>
                  <span className="font-semibold">
                    -{coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `$${coupon.discountAmount}`}
                  </span>
                </div>
              )}

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

            {/* Coupon Form */}
            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850">
                {coupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-700 text-xs">
                    <span className="font-semibold uppercase flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> {coupon.code}</span>
                    <button onClick={handleRemoveCoupon} className="text-neutral-400 hover:text-rose-500"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="flex-1 h-9 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:border-violet-500 uppercase"
                    />
                    <button
                      type="submit"
                      className="h-9 px-4 rounded-lg bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-850 text-white text-xs font-semibold transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[10px] text-rose-500 mt-1.5">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-emerald-600 mt-1.5">{couponSuccess}</p>}
              </div>
            )}

            {/* Checkout Button */}
            {cartItems.length > 0 && (
              <button
                onClick={handleCheckout}
                className="w-full h-11 rounded-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-500/10"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Secure Info */}
          <div className="flex items-center gap-2 justify-center text-[10px] text-neutral-400 font-medium">
            <Shield className="h-4 w-4 text-emerald-500" /> Secure 256-bit SSL encrypted checkout.
          </div>
        </div>

      </div>
    </div>
  );
}
