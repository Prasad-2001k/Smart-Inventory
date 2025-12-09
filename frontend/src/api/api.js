import axios from 'axios';

let accessToken = null; // in-memory only

// Use Vite env variable if provided, otherwise default to backend dev server
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

const api = axios.create({
  baseURL: API_BASE,     // was '/api/' which points to vite server
  withCredentials: true, // send cookies (refresh_token) to backend
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On 401: try refresh using cookie-backed refresh endpoint then retry
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        // use `api.post` so withCredentials is applied from the axios instance
        const r = await api.post('token/refresh/', {});
        const newAccess = r.data.access;
        setAccessToken(newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (e) {
        clearAccessToken();
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
  return res.data;
}

export async function register(payload) {
  const res = await api.post('auth/register/', payload);
  if (res.data?.tokens?.access) setAccessToken(res.data.tokens.access);
  return res.data;
}

export async function logout() {
  await api.post('auth/logout/');
  clearAccessToken();
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