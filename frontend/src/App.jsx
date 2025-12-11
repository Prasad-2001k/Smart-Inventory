import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import InventoryManager from './pages/InventoryManager';
import OrderSystem from './pages/OrderSystem';
import Login from './pages/Login';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Smart Inventory Dashboard
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
                    Welcome{user ? `, ${user.username}` : ''} to your comprehensive inventory management system
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                <Link to="/manage" className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <span className="text-3xl">📦</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Manage Inventory</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Add products, categories, and suppliers to build your inventory database
                    </p>
                    <div className="mt-4 text-blue-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                        Get Started →
                    </div>
                </Link>
                
                <Link to="/orders" className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-green-200 cursor-pointer transform hover:-translate-y-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <span className="text-3xl">🛒</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Place Orders</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Create orders and automatically update stock levels in real-time
                    </p>
                    <div className="mt-4 text-green-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                        Get Started →
                    </div>
                </Link>
                
                <Link to="/manage" className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-purple-200 cursor-pointer transform hover:-translate-y-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <span className="text-3xl">📊</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Stock</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Monitor inventory levels and get alerts for low stock items
                    </p>
                    <div className="mt-4 text-purple-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      {isAuthenticated && (
        <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo/Brand */}
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl">📦</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Smart Inventory
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
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
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
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
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`
                  }
                >
                  Place Order
                </NavLink>
              </div>
              
              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {user && (
                  <span className="hidden md:block text-sm text-gray-700">
                    {user.username}
                  </span>
                )}
                <button
                  onClick={logout}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Logout
                </button>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-gray-700 hover:text-blue-600">
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
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
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