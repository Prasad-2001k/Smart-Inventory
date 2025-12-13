import React, { useState, useEffect } from 'react';
import { fetchProducts, createOrder, createOrderItem } from '../api/api';

export default function OrderSystem() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await fetchProducts();
            setProducts(res.data?.results || res.data || []);
            setError(null);
        } catch (err) {
            let errorMsg = 'Failed to load products. ';
            if (err.response) {
                errorMsg += `Server error: ${err.response.status} - ${err.response.data?.detail || JSON.stringify(err.response.data)}`;
            } else if (err.request) {
                errorMsg += 'Cannot connect to backend server. Make sure it\'s running on http://127.0.0.1:8000';
            } else {
                errorMsg += err.message || 'Unknown error occurred';
            }
            setError(errorMsg);
            console.error('Error loading products:', err);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
            setError("Item already in cart");
            setTimeout(() => setError(null), 3000);
            return;
        }
        // Add to cart with default quantity 1
        setCart([...cart, { product, quantity: 1 }]);
        setSuccess(`${product.name} added to cart`);
        setTimeout(() => setSuccess(null), 2000);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId, newQty) => {
        const qty = parseInt(newQty) || 1;
        setCart(cart.map(item => 
            item.product.id === productId ? { ...item, quantity: Math.max(1, Math.min(qty, item.product.current_stock)) } : item
        ));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Step 1: Create the Parent Order
            const orderRes = await createOrder({ status: 'P' }); // P = Pending
            const orderId = orderRes.data.id;

            // Step 2: Create Order Items one by one
            // This triggers your Backend Signal to update stock!
            for (const item of cart) {
                await createOrderItem({
                    order: orderId,
                    product: item.product.id,
                    quantity: item.quantity
                });
            }

            setSuccess("Order placed successfully! Stock updated.");
            setCart([]); // Clear cart
            await loadProducts(); // Refresh stock display
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.response?.data?.message || "Failed to place order. Please try again.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E8ECF3] pt-32 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1C1E21] mb-2">
                        Order System
                    </h1>
                    <p className="text-lg text-[#4A4F5A]">
                        Browse products and create orders
                    </p>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-white border-l-4 border-red-500 text-red-800 rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-white border-l-4 border-[#23C468] text-[#23C468] rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{success}</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
                    {/* Left: Product List */}
                    <div className="flex-1">
                        <div className="flex items-center mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#3066FE] to-[#4F7BFF] rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#1C1E21]">Available Products</h2>
                        </div>
                        {products.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#E3E6ED]">
                                <div className="text-6xl mb-4">📦</div>
                                <p className="text-[#4A4F5A] text-lg font-medium">No products available</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
                                {products.map(p => (
                                    <div key={p.id} className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 p-6 border border-[#E3E6ED] hover:border-[#3066FE]/30 group transform hover:-translate-y-1">
                                        <h4 className="font-bold text-[#1C1E21] mb-3 text-lg group-hover:text-[#3066FE] transition-colors">{p.name}</h4>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#7E8895]">Stock:</span>
                                                <span className={`font-bold text-sm px-2 py-1 rounded-full ${
                                                    p.current_stock < 10 
                                                        ? 'bg-red-100 text-red-700' 
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {p.current_stock}
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t border-[#E3E6ED]">
                                                <p className="text-2xl font-bold text-[#3066FE]">
                                                    ₹{parseFloat(p.price).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => addToCart(p)}
                                            disabled={p.current_stock < 1 || loading}
                                            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                                                p.current_stock < 1 
                                                    ? 'bg-[#E3E6ED] text-[#7E8895] cursor-not-allowed' 
                                                    : 'bg-[#3066FE] hover:bg-[#1F4FDC] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
                                            }`}
                                        >
                                            {p.current_stock < 1 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Cart */}
                    <div className="w-full xl:w-96 xl:shrink-0">
                        <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-7 lg:p-9 border border-[#E3E6ED] sticky top-24">
                            <div className="flex items-center mb-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#23C468] to-[#23C468]/80 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-[#1C1E21]">Shopping Cart</h2>
                            </div>
                            
                            {cart.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4 opacity-50">🛒</div>
                                    <p className="text-[#4A4F5A] text-lg">Your cart is empty</p>
                                    <p className="text-[#7E8895] text-sm mt-2">Add products to get started</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-5 mb-8 max-h-96 overflow-y-auto pr-3">
                                        {cart.map((item) => (
                                            <div key={item.product.id} className="bg-[#F7F9FC] rounded-xl p-5 border border-[#E3E6ED] shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <strong className="text-[#1C1E21] block mb-1">{item.product.name}</strong>
                                                        <p className="text-sm text-[#7E8895]">₹{parseFloat(item.product.price).toFixed(2)} each</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.product.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1 transition-colors ml-2"
                                                        title="Remove from cart"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <label className="text-sm font-medium text-[#4A4F5A]">Qty:</label>
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        max={item.product.current_stock} 
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.product.id, e.target.value)}
                                                        className="w-20 px-3 py-2 border-2 border-[#E3E6ED] rounded-xl focus:ring-2 focus:ring-[#23C468] focus:border-[#23C468] outline-none bg-white shadow-sm hover:shadow-md transition-all text-[#1C1E21]"
                                                        disabled={loading}
                                                    />
                                                    <span className="text-xs text-[#7E8895]">
                                                        Max: {item.product.current_stock}
                                                    </span>
                                                </div>
                                                <div className="pt-2 border-t border-[#E3E6ED] mt-2">
                                                    <p className="text-sm font-semibold text-[#1C1E21]">
                                                        Subtotal: <span className="text-[#23C468]">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t-2 border-[#E3E6ED] pt-8 mt-8">
                                        <div className="flex justify-between items-center mb-8">
                                            <span className="text-xl font-bold text-[#1C1E21]">Total:</span>
                                            <span className="text-3xl font-bold text-[#23C468]">
                                                ₹{calculateTotal()}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={handleCheckout}
                                            disabled={loading || cart.length === 0}
                                            className="w-full bg-[#23C468] hover:bg-[#1FA855] text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </span>
                                            ) : 'Place Order'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}