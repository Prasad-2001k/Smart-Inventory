import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import InventoryManager from './pages/InventoryManager';
import OrderSystem from './pages/OrderSystem';
import Login from './pages/Login';
import Home from './pages/Home';
import { fetchProducts } from './api/api';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8ECF3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3066FE] mx-auto"></div>
          <p className="mt-4 text-[#4A4F5A]">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Dashboard component matching homepage design
const Dashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchProducts();
        const productsData = response.data.results || response.data;
        setProducts(productsData);
        
        // Calculate stats
        const total = productsData.length;
        const lowStock = productsData.filter(p => p.current_stock > 0 && p.current_stock < 10).length;
        const outOfStock = productsData.filter(p => p.current_stock === 0).length;
        
        setStats({
          totalProducts: total,
          lowStock: lowStock,
          outOfStock: outOfStock,
        });
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Generate sample chart data (last 7 days)
  const chartData = [65, 80, 45, 90, 70, 85, 60];
  const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="min-h-screen bg-[#E8ECF3] pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1C1E21] mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-[#4A4F5A]">
            Welcome{user ? `, ${user.username}` : ''} - Overview of your inventory
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-gradient-to-br from-[#3066FE] to-[#4F7BFF] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-bold mb-2">
                  {loading ? '...' : stats.totalProducts.toLocaleString()}
                </div>
                <div className="text-sm opacity-90">Total Products</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-gradient-to-br from-[#FFA726] to-[#FF9800] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-bold mb-2">
                  {loading ? '...' : stats.lowStock.toLocaleString()}
                </div>
                <div className="text-sm opacity-90">Low Stock</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Out of Stock */}
          <div className="bg-gradient-to-br from-[#EF5350] to-[#E53935] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-bold mb-2">
                  {loading ? '...' : stats.outOfStock.toLocaleString()}
                </div>
                <div className="text-sm opacity-90">Out of Stock</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-8 lg:p-12 border border-[#E3E6ED] mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-[#1C1E21]">Stock Overview</h3>
            <div className="text-sm text-[#7E8895]">Last 7 days</div>
          </div>
          {/* Bar Chart */}
          <div className="flex items-end justify-between h-48 space-x-2">
            {chartData.map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div
                    className="w-full bg-gradient-to-t from-[#3066FE] to-[#4F7BFF] rounded-t-lg transition-all hover:opacity-80 cursor-pointer group-hover:from-[#1F4FDC] group-hover:to-[#3066FE]"
                    style={{ height: `${height}%` }}
                    title={`${chartLabels[index]}: ${height}%`}
                  ></div>
                </div>
                <div className="text-xs text-[#7E8895] mt-2 font-medium">{chartLabels[index]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/manage" className="group bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 p-8 border border-[#E3E6ED] hover:border-[#3066FE]/30 cursor-pointer transform hover:-translate-y-1">
            <div className="w-20 h-20 bg-gradient-to-br from-[#3066FE] to-[#4F7BFF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1C1E21] mb-3">Manage Inventory</h3>
            <p className="text-[#4A4F5A] leading-relaxed mb-4">
              Add products, categories, and suppliers to build your inventory database
            </p>
            <div className="mt-4 text-[#3066FE] font-semibold flex items-center group-hover:translate-x-2 transition-transform">
              Get Started →
            </div>
          </Link>
          
          <Link to="/orders" className="group bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 p-8 border border-[#E3E6ED] hover:border-[#23C468]/30 cursor-pointer transform hover:-translate-y-1">
            <div className="w-20 h-20 bg-gradient-to-br from-[#23C468] to-[#23C468]/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1C1E21] mb-3">Place Orders</h3>
            <p className="text-[#4A4F5A] leading-relaxed mb-4">
              Create orders and automatically update stock levels in real-time
            </p>
            <div className="mt-4 text-[#23C468] font-semibold flex items-center group-hover:translate-x-2 transition-transform">
              Get Started →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#E8ECF3]">
      {/* Floating Navigation Bar - Hidden on Login page */}
      {!isLoginPage && (
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-7xl z-50">
        <div className="bg-white/95 backdrop-blur-lg rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#E3E6ED] px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand - Clickable, routes to Home */}
            <Link to="/" className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3066FE] to-[#4F7BFF] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-[#1C1E21]">
                  Smart Inventory
                </span>
              </div>
            </Link>
            
            {/* Navigation Links - Show different content based on auth status */}
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => 
                      `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive 
                          ? 'bg-[#3066FE] text-white shadow-lg' 
                          : 'text-[#4A4F5A] hover:bg-[#E8ECF3] hover:text-[#3066FE]'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink 
                    to="/manage" 
                    className={({ isActive }) => 
                      `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive 
                          ? 'bg-[#3066FE] text-white shadow-lg' 
                          : 'text-[#4A4F5A] hover:bg-[#E8ECF3] hover:text-[#3066FE]'
                      }`
                    }
                  >
                    Manage Inventory
                  </NavLink>
                  <NavLink 
                    to="/orders" 
                    className={({ isActive }) => 
                      `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive 
                          ? 'bg-[#3066FE] text-white shadow-lg' 
                          : 'text-[#4A4F5A] hover:bg-[#E8ECF3] hover:text-[#3066FE]'
                      }`
                    }
                  >
                    Place Order
                  </NavLink>
                </div>
                
                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  {user && (
                    <span className="hidden md:block text-sm text-[#4A4F5A] font-medium">
                      {user.username}
                    </span>
                  )}
                  <button
                    onClick={logout}
                    className="px-5 py-2.5 text-sm font-semibold text-[#4A4F5A] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              /* Public Navbar - Login/Register buttons */
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-[#4A4F5A] hover:text-[#3066FE] hover:bg-[#E8ECF3] rounded-xl transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-semibold bg-[#3066FE] hover:bg-[#1F4FDC] text-white rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-[#4A4F5A] hover:text-[#3066FE]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manage" 
          element={
            <ProtectedRoute>
              <InventoryManager />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <OrderSystem />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;