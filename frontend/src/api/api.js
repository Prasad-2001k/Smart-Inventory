import axios from 'axios';

// In-memory + persisted tokens
let accessToken = null;
let refreshToken = localStorage.getItem('refresh_token') || null;

// Use Vite env variable if provided, otherwise default to backend dev server
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';

export function setAccessToken(token) {
  accessToken = token;
}

export function setRefreshToken(token) {
  refreshToken = token;
  if (token) {
    localStorage.setItem('refresh_token', token);
  } else {
    localStorage.removeItem('refresh_token');
  }
}

export function clearAccessToken() {
  accessToken = null;
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // allow cookies if present
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On 401: try body-based refresh using stored refresh token, then retry
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        // Use body-based refresh endpoint
        const r = await api.post('token/refresh-body/', { refresh: refreshToken });
        const newAccess = r.data.access;
        setAccessToken(newAccess);
        // Optionally store rotated refresh if returned
        if (r.data.refresh) {
          setRefreshToken(r.data.refresh);
        }
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (e) {
        clearAccessToken();
        setRefreshToken(null);
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

// Auth helpers (use auth/ prefix to match backend routes)
export async function login(credentials) {
  const res = await api.post('auth/login/', credentials);
  if (res.data?.tokens?.access) setAccessToken(res.data.tokens.access);
  if (res.data?.tokens?.refresh) setRefreshToken(res.data.tokens.refresh);
  return res.data;
}

export async function register(payload) {
  const res = await api.post('auth/register/', payload);
  if (res.data?.tokens?.access) setAccessToken(res.data.tokens.access);
  if (res.data?.tokens?.refresh) setRefreshToken(res.data.tokens.refresh);
  return res.data;
}

export async function logout() {
  await api.post('auth/logout/');
  clearAccessToken();
  setRefreshToken(null);
}

// --- API Calls ---

// 1. Fetching Data (for Dashboard & Dropdowns)
export const fetchProducts = () => api.get('products/');
export const fetchCategories = () => api.get('categories/');
export const fetchSuppliers = () => api.get('suppliers/');

// 2. Adding Data (Management Forms)
export const createCategory = (data) => api.post('categories/', data);
export const createSupplier = (data) => api.post('suppliers/', data);
export const createProduct = (data) => api.post('products/', data);

// 3. Updating Stock
export const updateProductStock = (productId, stock) => api.patch(`products/${productId}/update_stock/`, { current_stock: stock });

// 3. Order Processing (The Complex Part)
export const createOrder = (orderData) => api.post('orders/', orderData);
export const createOrderItem = (itemData) => api.post('order-items/', itemData);

export default api;