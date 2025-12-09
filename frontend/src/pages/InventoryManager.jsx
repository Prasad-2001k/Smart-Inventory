import React, { useState, useEffect } from 'react';
import { createCategory, createSupplier, createProduct, fetchCategories, fetchSuppliers, fetchProducts, updateProductStock } from '../api/api';

export default function InventoryManager() {
    // Dropdown Data
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [updatingStock, setUpdatingStock] = useState({});

    // Form States
    const [catName, setCatName] = useState('');
    const [supData, setSupData] = useState({ name: '', phone: '', email: '', address: '' });
    const [prodData, setProdData] = useState({ name: '', sku: '', price: '', current_stock: '', category: '', supplier: '' });
    const [stockUpdates, setStockUpdates] = useState({});

    // Load data for dropdowns on mount
    useEffect(() => {
        refreshDropdowns();
    }, []);

    const refreshDropdowns = async () => {
        try {
            const [catRes, supRes, prodRes] = await Promise.all([
                fetchCategories(),
                fetchSuppliers(),
                fetchProducts()
            ]);
            setCategories(catRes.data);
            setSuppliers(supRes.data);
            setProducts(prodRes.data);
            setError(null);
        } catch (err) {
            let errorMsg = 'Failed to load dropdown data. ';
            if (err.response) {
                errorMsg += `Server error: ${err.response.status} - ${err.response.data?.detail || JSON.stringify(err.response.data)}`;
            } else if (err.request) {
                errorMsg += 'Cannot connect to backend server. Make sure it\'s running on http://127.0.0.1:8000';
            } else {
                errorMsg += err.message || 'Unknown error occurred';
            }
            setError(errorMsg);
            console.error('Error loading dropdowns:', err);
        }
    };

    // --- Handlers ---

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await createCategory({ cname: catName }); // 'cname' matches your Model
            setSuccess('Category added successfully!');
            setCatName('');
            refreshDropdowns();
        } catch (err) {
            const errorMsg = err.response?.data?.cname?.[0] || err.response?.data?.detail || 'Error adding category';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await createSupplier(supData);
            setSuccess('Supplier added successfully!');
            setSupData({ name: '', phone: '', email: '', address: '' });
            refreshDropdowns();
        } catch (err) {
            const errorMsg = err.response?.data?.email?.[0] || err.response?.data?.phone?.[0] || err.response?.data?.detail || 'Error adding supplier. Check unique fields.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            // Convert string values to proper types
            const productData = {
                ...prodData,
                price: parseFloat(prodData.price),
                current_stock: parseInt(prodData.current_stock) || 0,
                category: parseInt(prodData.category),
                supplier: prodData.supplier ? parseInt(prodData.supplier) : null,
            };
            await createProduct(productData);
            setSuccess('Product created successfully!');
            setProdData({ name: '', sku: '', price: '', current_stock: '', category: '', supplier: '' });
            refreshDropdowns();
        } catch (err) {
            const errorMsg = err.response?.data?.sku?.[0] || err.response?.data?.detail || 'Error creating product. Check SKU uniqueness.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleStockUpdate = async (productId, newStock) => {
        setUpdatingStock({ ...updatingStock, [productId]: true });
        setError(null);
        setSuccess(null);
        try {
            const stockValue = parseInt(newStock);
            if (isNaN(stockValue) || stockValue < 0) {
                setError('Stock must be a valid non-negative number');
                setUpdatingStock({ ...updatingStock, [productId]: false });
                return;
            }
            await updateProductStock(productId, stockValue);
            setSuccess(`Stock updated successfully for product ID ${productId}!`);
            // Refresh products list
            const prodRes = await fetchProducts();
            setProducts(prodRes.data);
            setStockUpdates({ ...stockUpdates, [productId]: '' });
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Error updating stock';
            setError(errorMsg);
        } finally {
            setUpdatingStock({ ...updatingStock, [productId]: false });
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        Inventory Manager
                    </h1>
                    <p className="text-lg text-gray-600">
                        Add categories, suppliers, and products to your inventory
                    </p>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg shadow-sm animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-lg shadow-sm animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {success}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* 1. Category Form */}
                    <section className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 lg:p-10 border border-gray-100">
                        <div className="flex items-center mb-8">
                            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-2xl">📁</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Add Category</h3>
                        </div>
                        <form onSubmit={handleAddCategory} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Category Name
                                </label>
                                <input 
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="e.g. Electronics, Furniture" 
                                    value={catName}
                                    onChange={e => setCatName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : 'Save Category'}
                            </button>
                        </form>
                    </section>

                    {/* 2. Supplier Form */}
                    <section className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 lg:p-10 border border-gray-100">
                        <div className="flex items-center mb-8">
                            <div className="w-14 h-14 bg-linear-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-2xl">🏢</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Add Supplier</h3>
                        </div>
                        <form onSubmit={handleAddSupplier} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Supplier Name
                                </label>
                                <input 
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="Company or Individual Name" 
                                    value={supData.name} 
                                    onChange={e => setSupData({...supData, name: e.target.value})} 
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Phone Number
                                </label>
                                <input 
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="+91 1234567890" 
                                    value={supData.phone} 
                                    onChange={e => setSupData({...supData, phone: e.target.value})} 
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Email Address
                                </label>
                                <input 
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="supplier@example.com" 
                                    type="email" 
                                    value={supData.email} 
                                    onChange={e => setSupData({...supData, email: e.target.value})} 
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : 'Save Supplier'}
                            </button>
                        </form>
                    </section>

                    {/* 3. Product Form */}
                    <section className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 lg:p-10 border border-gray-100 lg:col-span-1">
                        <div className="flex items-center mb-8">
                            <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-2xl">📦</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Add Product</h3>
                        </div>
                        <form onSubmit={handleAddProduct} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Product Name
                                </label>
                                <input 
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="Enter product name" 
                                    value={prodData.name} 
                                    onChange={e => setProdData({...prodData, name: e.target.value})} 
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    SKU (Unique ID)
                                </label>
                                <input 
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="e.g. PROD-001" 
                                    value={prodData.sku} 
                                    onChange={e => setProdData({...prodData, sku: e.target.value})} 
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Price
                                    </label>
                                    <input 
                                        className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="0.00" 
                                        type="number" 
                                        step="0.01"
                                        value={prodData.price} 
                                        onChange={e => setProdData({...prodData, price: e.target.value})} 
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Stock
                                    </label>
                                    <input 
                                        className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="0" 
                                        type="number" 
                                        value={prodData.current_stock} 
                                        onChange={e => setProdData({...prodData, current_stock: e.target.value})} 
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            
                            {/* Dynamic Dropdowns */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Category
                                </label>
                                <select 
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    value={prodData.category} 
                                    onChange={e => setProdData({...prodData, category: e.target.value})} 
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.cname}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Supplier
                                </label>
                                <select 
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                    value={prodData.supplier} 
                                    onChange={e => setProdData({...prodData, supplier: e.target.value})} 
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : 'Create Product'}
                            </button>
                        </form>
                    </section>
                </div>

                {/* Products List with Stock Update */}
                <section className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Manage Product Stock</h3>
                                <p className="text-sm text-gray-600 mt-1">Update stock levels for existing products</p>
                            </div>
                        </div>
                        <button
                            onClick={refreshDropdowns}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium"
                        >
                            Refresh
                        </button>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No products found. Create a product above to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">₹{product.price}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category_name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                                    product.current_stock === 0 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : product.current_stock < 10 
                                                        ? 'bg-yellow-100 text-yellow-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {product.current_stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={stockUpdates[product.id] !== undefined ? stockUpdates[product.id] : product.current_stock}
                                                    onChange={(e) => setStockUpdates({ ...stockUpdates, [product.id]: e.target.value })}
                                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                                    placeholder="New stock"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => {
                                                        const newStock = stockUpdates[product.id] !== undefined 
                                                            ? stockUpdates[product.id] 
                                                            : product.current_stock;
                                                        handleStockUpdate(product.id, newStock);
                                                    }}
                                                    disabled={updatingStock[product.id] || (stockUpdates[product.id] !== undefined && parseInt(stockUpdates[product.id]) === product.current_stock)}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                >
                                                    {updatingStock[product.id] ? (
                                                        <span className="flex items-center">
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Updating...
                                                        </span>
                                                    ) : 'Update'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}