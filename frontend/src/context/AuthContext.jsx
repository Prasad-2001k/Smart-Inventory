import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../api/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState(() => {
    // Load tokens from localStorage on initialization
    const storedTokens = localStorage.getItem('tokens');
    return storedTokens ? JSON.parse(storedTokens) : null;
  });

  const logout = useCallback(async () => {
    try {
      if (tokens?.refresh) {
        await api.post('auth/logout/', { refresh: tokens.refresh });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('tokens');
    }
  }, [tokens]);

  // Set up axios interceptor to include token in requests
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (tokens?.access) {
          config.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry && tokens?.refresh) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            // Note: This endpoint is at /api/token/refresh/ (not under /api/auth/)
            const response = await api.post('token/refresh/', {
              refresh: tokens.refresh,
            });

            const newTokens = {
              access: response.data.access,
              refresh: tokens.refresh, // Keep the same refresh token
            };

            setTokens(newTokens);
            localStorage.setItem('tokens', JSON.stringify(newTokens));

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [tokens, logout]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (tokens?.access) {
        try {
          const response = await api.get('auth/user/');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          // If auth check fails, clear tokens
          setTokens(null);
          localStorage.removeItem('tokens');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [tokens]);

  const login = async (username, password) => {
    try {
      const response = await api.post('auth/login/', { username, password });
      const { user: userData, tokens: newTokens } = response.data;

      setUser(userData);
      setTokens(newTokens);
      localStorage.setItem('tokens', JSON.stringify(newTokens));

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('auth/register/', { username, email, password });
      const { user: userData, tokens: newTokens } = response.data;

      setUser(userData);
      setTokens(newTokens);
      localStorage.setItem('tokens', JSON.stringify(newTokens));

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

