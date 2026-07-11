import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// We use relative URLs because we configured a proxy in vite.config.js
const API_URL = '/api/auth';

// Helper to get user from localStorage
const getLocalUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Helper to get token from localStorage
const getLocalToken = () => {
  return localStorage.getItem('accessToken') || null;
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await api.post(`${API_URL}/register`, userData);
      // Notice: we do NOT save user/token on registration anymore because they must verify first
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Registration failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await api.post(`${API_URL}/login`, userData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      // Capture 403 unverified email block
      if (error.response?.status === 403 && error.response?.data?.isVerified === false) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.error,
          isVerified: false,
          email: error.response.data.email,
          previewUrl: error.response.data.previewUrl,
        });
      }
      const message = error.response?.data?.error || error.message || 'Login failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await api.post(`${API_URL}/logout`);
    } catch (error) {
      // Clear token and user anyway
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
    return {};
  }
);

export const updateUserDetails = createAsyncThunk(
  'auth/updateDetails',
  async (userData, thunkAPI) => {
    try {
      const response = await api.put(`${API_URL}/updatedetails`, userData);
      if (response.data.success) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return thunkAPI.rejectWithValue('Update failed');
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Update failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addUserAddress = createAsyncThunk(
  'auth/addAddress',
  async (addressData, thunkAPI) => {
    try {
      const response = await api.post(`${API_URL}/address`, addressData);
      if (response.data.success) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, addresses: response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return thunkAPI.rejectWithValue('Failed to add address');
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to add address';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteUserAddress = createAsyncThunk(
  'auth/deleteAddress',
  async (addressId, thunkAPI) => {
    try {
      const response = await api.delete(`${API_URL}/address/${addressId}`);
      if (response.data.success) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, addresses: response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return thunkAPI.rejectWithValue('Failed to delete address');
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to delete address';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, thunkAPI) => {
    try {
      const response = await api.post(`${API_URL}/forgotpassword`, { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to send OTP';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, thunkAPI) => {
    try {
      const response = await api.post(`${API_URL}/resetpassword`, resetData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Password reset failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (verifyData, thunkAPI) => {
    try {
      const response = await api.post(`${API_URL}/verifyemail`, verifyData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Verification failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (otp, thunkAPI) => {
    try {
      const response = await api.delete(`${API_URL}/deleteme`, { data: { otp } });
      if (response.data.success) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to delete account';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const requestDeleteOtp = createAsyncThunk(
  'auth/requestDeleteOtp',
  async (_, thunkAPI) => {
    try {
      const response = await api.post(`${API_URL}/request-delete-otp`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to send OTP';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  user: getLocalUser(),
  token: getLocalToken(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('accessToken', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // User/token remains null on unverified registration
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload.data || null;
        state.token = action.payload.accessToken || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'object' ? action.payload.message : action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload.data || null;
        state.token = action.payload.accessToken || null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Request Delete OTP
      .addCase(requestDeleteOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestDeleteOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(requestDeleteOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update details & addresses
      .addMatcher(
        (action) =>
          [
            updateUserDetails.fulfilled.type,
            addUserAddress.fulfilled.type,
            deleteUserAddress.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.isLoading = false;
          state.user = action.payload;
        }
      )
      .addMatcher(
        (action) =>
          [
            updateUserDetails.pending.type,
            addUserAddress.pending.type,
            deleteUserAddress.pending.type,
          ].includes(action.type),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [
            updateUserDetails.rejected.type,
            addUserAddress.rejected.type,
            deleteUserAddress.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
