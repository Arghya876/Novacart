import { createSlice } from '@reduxjs/toolkit';

const getLocalCart = () => {
  const cart = localStorage.getItem('cartItems');
  return cart ? JSON.parse(cart) : [];
};

const getLocalSaved = () => {
  const saved = localStorage.getItem('savedForLater');
  return saved ? JSON.parse(saved) : [];
};

const getLocalCoupon = () => {
  const coupon = localStorage.getItem('coupon');
  return coupon ? JSON.parse(coupon) : null;
};

const initialState = {
  cartItems: getLocalCart(),
  savedForLater: getLocalSaved(),
  coupon: getLocalCoupon(),
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
};

// Helper to calculate totals
const calculateTotals = (state) => {
  const subtotal = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  let discount = 0;
  if (state.coupon) {
    if (state.coupon.discountType === 'percentage') {
      discount = (subtotal * state.coupon.discountAmount) / 100;
    } else {
      discount = state.coupon.discountAmount;
    }
  }

  // Free shipping above $100, otherwise $10
  state.shippingPrice = subtotal > 0 && subtotal < 100 ? 10 : 0;
  
  // Tax is 8% of subtotal after discount
  const taxableAmount = Math.max(0, subtotal - discount);
  state.taxPrice = Math.round(taxableAmount * 0.08 * 100) / 100;

  state.totalPrice = Math.round((taxableAmount + state.shippingPrice + state.taxPrice) * 100) / 100;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product ? { ...x, quantity: Math.min(item.stock, x.quantity + item.quantity) } : x
        );
      } else {
        state.cartItems.push(item);
      }

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      calculateTotals(state);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      calculateTotals(state);
    },
    updateCartQty: (state, action) => {
      const { product, qty } = action.payload;
      state.cartItems = state.cartItems.map((x) =>
        x.product === product ? { ...x, quantity: qty } : x
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      calculateTotals(state);
    },
    saveForLater: (state, action) => {
      const itemId = action.payload;
      const item = state.cartItems.find((x) => x.product === itemId);
      
      if (item) {
        state.cartItems = state.cartItems.filter((x) => x.product !== itemId);
        if (!state.savedForLater.some((x) => x.product === itemId)) {
          state.savedForLater.push(item);
        }
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        localStorage.setItem('savedForLater', JSON.stringify(state.savedForLater));
        calculateTotals(state);
      }
    },
    moveToCart: (state, action) => {
      const itemId = action.payload;
      const item = state.savedForLater.find((x) => x.product === itemId);

      if (item) {
        state.savedForLater = state.savedForLater.filter((x) => x.product !== itemId);
        if (!state.cartItems.some((x) => x.product === itemId)) {
          state.cartItems.push(item);
        }
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        localStorage.setItem('savedForLater', JSON.stringify(state.savedForLater));
        calculateTotals(state);
      }
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      localStorage.setItem('coupon', JSON.stringify(state.coupon));
      calculateTotals(state);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      localStorage.removeItem('coupon');
      calculateTotals(state);
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.coupon = null;
      localStorage.removeItem('cartItems');
      localStorage.removeItem('coupon');
      calculateTotals(state);
    },
  },
});

// Calculate totals initially
initialState.cartItems && calculateTotals(initialState);

export const {
  addToCart,
  removeFromCart,
  updateCartQty,
  saveForLater,
  moveToCart,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
