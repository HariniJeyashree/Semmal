import axios from "axios";

const host = typeof window !== "undefined" ? window.location.origin : "http://localhost:8000";
export const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || host + "/api/v1").replace(/\/analyze\/?$/, ""),
  withCredentials: true, // Needed to send and receive HttpOnly cookies for refresh token
});

// Add request interceptor to automatically attach token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Add response interceptor for 401 refresh token and network retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // 1. Handle Network Errors on GET requests (transient failures)
    if (originalRequest.method === 'get' && (!error.response || error.code === 'ERR_NETWORK')) {
      originalRequest._retry = true;
      console.warn("Network error on GET request. Retrying in 1s...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(originalRequest);
    }
    
    // 2. Handle 401 Token Expiration via Refresh Token
    if (error.response && error.response.status === 401) {
      // Don't retry if the refresh endpoint itself failed
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      try {
        // Attempt to get a new token
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        if (res.data && res.data.access_token) {
          localStorage.setItem('access_token', res.data.access_token);
          // Update the original request's authorization header
          originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token is expired or invalid, log out the user
        localStorage.removeItem('access_token');
        if (typeof window !== "undefined" && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
