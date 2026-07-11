import axios from 'axios';

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

// Response Interceptor: Silent refresh on 401 Unauthorized
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

    // Check if error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        // Pass _retry: true in config to ensure this refresh call doesn't loop
        const response = await axios.post('/api/auth/refresh', {}, { _retry: true, withCredentials: true });
        
        if (response.data.success) {
          const { accessToken } = response.data;
          
          // Save the new token in localStorage
          localStorage.setItem('accessToken', accessToken);
          
          processQueue(null, accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh token is invalid/expired: clear localStorage and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        
        const userStr = localStorage.getItem('user');
        let isAdmin = false;
        try {
          if (userStr) {
            const user = JSON.parse(userStr);
            isAdmin = user.role === 'admin';
          }
        } catch (e) {}

        if (isAdmin) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Export the globally configured axios instance for slices that import 'api'
export default axios;
