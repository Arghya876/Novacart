import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: '',
  type: 'success', // 'success' | 'error' | 'info'
  isOpen: false,
  duration: 3000,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type || 'success';
      state.isOpen = true;
      state.duration = action.payload.duration || 3000;
    },
    hideToast: (state) => {
      state.isOpen = false;
      state.message = '';
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
