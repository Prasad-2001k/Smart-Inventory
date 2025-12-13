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
    // Only load access token from localStorage (refresh token is in HttpOnly cookie)
    const storedTokens = localStorage.getItem('tokens');
    return storedTokens ? JSON.parse(storedTokens) : null;
  });

  const logout = useCallback(async () => {
    try {
      // Refresh token is in HttpOnly cookie, backend will handle it
      await api.post('auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('tokens');
    }
  }, []);

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

        // CRITICAL: Don't retry if this is already a refresh request to prevent infinite loops
        const isRefreshRequest = originalRequest.url?.includes('token/refresh/') || 
                                 originalRequest.url?.includes('token/refresh');

        // If error is 401 and we haven't tried to refresh yet, and it's NOT the refresh endpoint
        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token using HttpOnly cookie
            // Refresh token is automatically sent via cookie, no need to pass it in body
            const response = await api.post('token/refresh/');

            const newTokens = {
              access: response.data.access,
              // Refresh token remains in HttpOnly cookie, not stored in state
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
      // Only store access token, refresh token is in HttpOnly cookie
      setTokens({ access: newTokens.access });
      localStorage.setItem('tokens', JSON.stringify({ access: newTokens.access }));

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
      // Only store access token, refresh token is in HttpOnly cookie
      setTokens({ access: newTokens.access });
      localStorage.setItem('tokens', JSON.stringify({ access: newTokens.access }));

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

