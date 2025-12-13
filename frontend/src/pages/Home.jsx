import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#E8ECF3]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1C1E21] mb-6 leading-tight">
                Smart Inventory
                <span className="block text-[#3066FE]">Management System</span>
              </h1>
              <p className="text-xl md:text-2xl text-[#4A4F5A] mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Streamline your inventory operations with real-time tracking, automated stock management, and powerful analytics.
              </p>
              
              {/* Key Benefits */}
              <div className="space-y-4 mb-10 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#23C468] rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg text-[#4A4F5A]">Track inventory in real time</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#23C468] rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg text-[#4A4F5A]">Reduce stock errors and improve accuracy</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#23C468] rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg text-[#4A4F5A]">Improve efficiency and control</p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleGetStarted}
                className="bg-[#3066FE] hover:bg-[#1F4FDC] text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
              >
                Get Started
              </button>
            </div>

            {/* Right: Visual Content */}
            <div className="relative lg:order-last">
              <div className="relative z-10">
                {/* Main Illustration Container */}
                <div className="bg-white rounded-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-8 lg:p-12 border border-[#E3E6ED]">
                  {/* Dashboard Illustration */}
                  <div className="space-y-6">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="text-sm font-semibold text-[#4A4F5A]">Smart Inventory Dashboard</div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-[#3066FE] to-[#4F7BFF] rounded-2xl p-4 text-white">
                        <div className="text-2xl font-bold mb-1">1,234</div>
                        <div className="text-xs opacity-90">Total Products</div>
                      </div>
                      <div className="bg-gradient-to-br from-[#FFA726] to-[#FF9800] rounded-2xl p-4 text-white">
                        <div className="text-2xl font-bold mb-1">45</div>
                        <div className="text-xs opacity-90">Low Stock</div>
                      </div>
                      <div className="bg-gradient-to-br from-[#EF5350] to-[#E53935] rounded-2xl p-4 text-white">
                        <div className="text-2xl font-bold mb-1">12</div>
                        <div className="text-xs opacity-90">Out of Stock</div>
                      </div>
                    </div>

                    {/* Chart Area */}
                    <div className="bg-[#F7F9FC] rounded-2xl p-6 border border-[#E3E6ED]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[#1C1E21]">Stock Overview</h3>
                        <div className="text-sm text-[#7E8895]">Last 7 days</div>
                      </div>
                      {/* Simple Bar Chart Representation */}
                      <div className="flex items-end justify-between h-32 space-x-2">
                        {[65, 80, 45, 90, 70, 85, 60].map((height, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-gradient-to-t from-[#3066FE] to-[#4F7BFF] rounded-t-lg transition-all hover:opacity-80"
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="text-xs text-[#7E8895] mt-2">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Product List Preview */}
                    <div className="bg-white rounded-xl p-4 border border-[#E3E6ED]">
                      <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#8A4DFF] to-[#8A4DFF]/80 rounded-lg"></div>
                              <div>
                                <div className="font-semibold text-[#1C1E21]">Product {item}</div>
                                <div className="text-sm text-[#7E8895]">SKU-00{item}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-[#1C1E21]">${(100 + item * 10).toFixed(2)}</div>
                              <div className="text-xs text-[#23C468]">In Stock</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#3066FE]/10 rounded-full blur-2xl -z-10"></div>
                <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-[#8A4DFF]/10 rounded-full blur-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1C1E21] mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-[#4A4F5A] max-w-2xl mx-auto">
              Powerful features to manage your inventory efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#F7F9FC] rounded-[20px] p-8 border border-[#E3E6ED] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3066FE] to-[#4F7BFF] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1C1E21] mb-3">Real-Time Analytics</h3>
              <p className="text-[#4A4F5A] leading-relaxed">
                Monitor your inventory levels, track sales trends, and make data-driven decisions with comprehensive analytics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F7F9FC] rounded-[20px] p-8 border border-[#E3E6ED] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#23C468] to-[#23C468]/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1C1E21] mb-3">Automated Stock Management</h3>
              <p className="text-[#4A4F5A] leading-relaxed">
                Automatically update stock levels when orders are placed, receive low stock alerts, and prevent overselling.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F7F9FC] rounded-[20px] p-8 border border-[#E3E6ED] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8A4DFF] to-[#8A4DFF]/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1C1E21] mb-3">Secure & Reliable</h3>
              <p className="text-[#4A4F5A] leading-relaxed">
                Enterprise-grade security with role-based access control, audit logs, and data encryption to keep your inventory safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3066FE] to-[#4F7BFF]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Inventory Management?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses using Smart Inventory to streamline their operations and boost productivity.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-[#3066FE] hover:bg-[#F7F9FC] font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
}
