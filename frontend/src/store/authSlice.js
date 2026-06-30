import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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
      const response = await axios.post(`${API_URL}/register`, userData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('accessToken', response.data.accessToken);
      }
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
      const response = await axios.post(`${API_URL}/login`, userData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Login failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      return {};
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      return {};
    }
  }
);

export const updateUserDetails = createAsyncThunk(
  'auth/updateDetails',
  async (userData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(`${API_URL}/updatedetails`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        // Update user in localStorage
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
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(`${API_URL}/address`, addressData, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = thunkAPI.getState().auth.token;
      const response = await axios.delete(`${API_URL}/address/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
        state.user = action.payload.user || action.payload.data || null;
        state.token = action.payload.accessToken || null;
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
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
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
