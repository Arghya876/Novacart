import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (queryParams = {}, thunkAPI) => {
    try {
      const response = await axios.get('/api/products', { params: queryParams });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch products';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchDetails',
  async (idOrSlug, thunkAPI) => {
    try {
      const response = await axios.get(`/api/products/${idOrSlug}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch product details';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/api/categories');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch categories';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'products/fetchRecommendations',
  async ({ recentlyViewedIds, limit }, thunkAPI) => {
    try {
      const response = await axios.post('/api/products/recommendations', {
        recentlyViewedIds,
        limit,
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch recommendations';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  products: [],
  totalProducts: 0,
  pagination: {},
  currentProduct: null,
  categories: [],
  recommendations: [],
  isLoading: false,
  detailsLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload?.data || [];
        state.totalProducts = action.payload?.total || action.payload?.data?.length || 0;
        state.pagination = action.payload?.pagination || {};
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentProduct = action.payload || null;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload || [];
      })
      // Fetch Recommendations
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload || [];
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
