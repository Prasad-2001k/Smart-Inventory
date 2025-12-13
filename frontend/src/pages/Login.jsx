import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(form.username, form.password);
      } else {
        if (!form.email) {
          setError('Email is required for registration');
          setLoading(false);
          return;
        }
        result = await register(form.username, form.email, form.password);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Authentication failed');
      }

      // result.success check is already handled above
    } catch (err) {
      // surface meaningful error messages from backend if available
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        'An unexpected error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8ECF3] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#3066FE]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#8A4DFF]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#23C468]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#3066FE] to-[#4F7BFF] rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-5xl font-extrabold text-[#1C1E21] mb-2">
              Smart Inventory
            </h2>
            <p className="mt-2 text-[#4A4F5A] text-lg font-medium">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-8 md:p-10 border border-[#E3E6ED]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-white border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-[16px] text-sm shadow-[0_4px_20px_rgba(0,0,0,0.06)] animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#4A4F5A] mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3.5 border-2 border-[#E3E6ED] placeholder-[#7E8895] text-[#1C1E21] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3066FE] focus:border-[#3066FE] focus:z-10 sm:text-sm transition-all bg-white hover:bg-white hover:border-[#E3E6ED] shadow-sm"
                placeholder="Enter your username"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#4A4F5A] mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required={!isLogin}
                  value={form.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3.5 border-2 border-[#E3E6ED] placeholder-[#7E8895] text-[#1C1E21] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3066FE] focus:border-[#3066FE] focus:z-10 sm:text-sm transition-all bg-white hover:bg-white hover:border-[#E3E6ED] shadow-sm"
                  placeholder="Enter your email"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#4A4F5A] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3.5 border-2 border-[#E3E6ED] placeholder-[#7E8895] text-[#1C1E21] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3066FE] focus:border-[#3066FE] focus:z-10 sm:text-sm transition-all bg-white hover:bg-white hover:border-[#E3E6ED] shadow-sm"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#3066FE] hover:bg-[#1F4FDC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3066FE] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLogin ? 'Sign in' : 'Create account'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setForm({ username: '', email: '', password: '' });
                }}
                className="text-sm text-[#3066FE] hover:text-[#1F4FDC] font-semibold transition-colors hover:underline"
              >
                {isLogin ? (
                  <>Don't have an account? <span className="underline">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="underline">Sign in</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

