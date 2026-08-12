import axios from 'axios';

let API_BASE = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') 
  : 'https://creationhub-production.up.railway.app';

if (API_BASE && !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
  API_BASE = `https://${API_BASE}`;
}

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token to every outbound request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle 401 globally and implement cold-start auto-retry
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // If config doesn't exist, reject immediately
    if (!config) {
      return Promise.reject(error);
    }
    
    // Check if error is a network error or timeout
    // Network errors (connection refused/server sleeping) have no response object
    const isNetworkError = !error.response;
    const isTimeout = error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'));
    
    if (isNetworkError || isTimeout) {
      // Initialize retry count
      config.__retryCount = config.__retryCount || 0;
      
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 3000;
      
      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        console.warn(`[API Helper] Network error/timeout detected. Cold-start retry attempt ${config.__retryCount}/${MAX_RETRIES} in ${RETRY_DELAY_MS}ms...`);
        
        // Wait 3 seconds
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        
        // Re-execute request with the exact same config
        return API(config);
      }
    }
    
    // Global 401 handling
    if (error.response && error.response.status === 401) {
      // If we get a 401 on a non-auth route, clear credentials
      const isAuthRoute = config.url && config.url.includes('/api/auth/');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;
