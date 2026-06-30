import { createSlice } from '@reduxjs/toolkit';

const getLocalWishlist = () => {
  const wishlist = localStorage.getItem('wishlistItems');
  return wishlist ? JSON.parse(wishlist) : [];
};

const initialState = {
  wishlistItems: getLocalWishlist(),
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;
      if (!state.wishlistItems.some((x) => x._id === product._id)) {
        state.wishlistItems.push(product);
        localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlistItems = state.wishlistItems.filter((x) => x._id !== action.payload);
      localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
    },
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.wishlistItems.some((x) => x._id === product._id);
      if (exists) {
        state.wishlistItems = state.wishlistItems.filter((x) => x._id !== product._id);
      } else {
        state.wishlistItems.push(product);
      }
      localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
    },
  },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
