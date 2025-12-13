import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import InventoryManager from './pages/InventoryManager';
import OrderSystem from './pages/OrderSystem';
import Login from './pages/Login';
import Home from './pages/Home';

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

// A simple Home/Dashboard component to welcome users
const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#E8ECF3] pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-bold text-[#1C1E21] mb-4">
                    Smart Inventory Dashboard
                </h1>
                <p className="text-xl md:text-2xl text-[#4A4F5A] max-w-2xl mx-auto">
                    Welcome{user ? `, ${user.username}` : ''} to your comprehensive inventory management system
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
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
                
                <Link to="/manage" className="group bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 p-8 border border-[#E3E6ED] hover:border-[#8A4DFF]/30 cursor-pointer transform hover:-translate-y-1">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#8A4DFF] to-[#8A4DFF]/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-[#1C1E21] mb-3">Track Stock</h3>
                    <p className="text-[#4A4F5A] leading-relaxed mb-4">
                        Monitor inventory levels and get alerts for low stock items
                    </p>
                    <div className="mt-4 text-[#8A4DFF] font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                        View Stock →
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