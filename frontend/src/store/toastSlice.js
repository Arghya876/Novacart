import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  title: '',
  message: '',
  type: 'success', // 'success' | 'error' | 'info' | 'cart' | 'favorite'
  image: null,
  actionLink: null,
  actionLabel: null,
  isOpen: false,
  duration: 3500,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.title = action.payload.title || '';
      state.message = action.payload.message || '';
      state.type = action.payload.type || 'success';
      state.image = action.payload.image || null;
      state.actionLink = action.payload.actionLink || null;
      state.actionLabel = action.payload.actionLabel || null;
      state.isOpen = true;
      state.duration = action.payload.duration || 3500;
    },
    hideToast: (state) => {
      state.isOpen = false;
      state.message = '';
      state.title = '';
      state.image = null;
      state.actionLink = null;
      state.actionLabel = null;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
