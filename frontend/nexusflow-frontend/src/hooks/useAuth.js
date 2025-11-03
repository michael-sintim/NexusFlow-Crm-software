import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    register, 
    logout, 
    updateProfile,
    changePassword,
    clearError 
  } = useAuthStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          console.log('User found in localStorage, initializing auth state');
        } else {
          useAuthStore.getState().clearAuth();
          console.log('No auth data found in localStorage');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Enhanced login function
  const enhancedLogin = async (credentials) => {
    try {
      clearError();
      const result = await login(credentials);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Enhanced logout function
  const enhancedLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isAuthenticated: isAuthenticated && isInitialized,
    isLoading: isLoading || !isInitialized,
    error,
    login: enhancedLogin,
    register,
    logout: enhancedLogout,
    updateProfile,
    changePassword,
    clearError,
    isInitialized,
  };
};