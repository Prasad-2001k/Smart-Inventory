import axios from 'axios';

// Use Vite env variable if provided, otherwise default to backend dev server
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';

// Plain axios instance; AuthContext is responsible for attaching tokens
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // allow cookies if present
});

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