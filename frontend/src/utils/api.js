import axios from 'axios';
import { store } from '../store';
import { showToast } from '../store/toastSlice';

// Configure defaults globally on the axios instance
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
axios.defaults.withCredentials = true;

// Request Interceptor: Automatically attach the Access Token to all axios requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent refresh on 401 Unauthorized & Global Error Notifications
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Extract user friendly error message
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      (error.message === 'Network Error'
        ? 'Network Connection Error. Please check your internet connection.'
        : null);

    // Suppress toasts for silent background checks if requested
    if (errorMessage && !originalRequest?._suppressToast) {
      // Don't toast 401s if silent refresh is going to attempt refresh
      const isAuthRefresh = originalRequest.url?.includes('/api/auth/refresh');
      if (error.response?.status !== 401 || isAuthRefresh) {
        store.dispatch(showToast({ message: errorMessage, type: 'error' }));
      }
    }

    // Check if error is 401 and not already retried
    const isAuthRequest = 
      originalRequest.url?.includes('/api/auth/login') || 
      originalRequest.url?.includes('/api/auth/refresh') || 
      originalRequest.url?.includes('/api/auth/register') ||
      originalRequest.url?.includes('/api/auth/verifyemail');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Request a new access token using the refresh cookie
        const response = await axios.post('/api/auth/refresh', {}, { _retry: true, withCredentials: true, _suppressToast: true });
        
        if (response.data.success) {
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh token is invalid/expired: clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
