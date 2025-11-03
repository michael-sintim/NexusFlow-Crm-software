import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, access, refresh } = response.data;
          
          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store tokens in localStorage for axios interceptor
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          localStorage.setItem('user', JSON.stringify(user));

          return response.data;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || 'Login failed',
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { user, access, refresh } = response.data;
          
          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          localStorage.setItem('user', JSON.stringify(user));

          return response.data;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data || 'Registration failed',
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.updateProfile(data);
          const user = response.data;
          
          set({
            user,
            isLoading: false,
            error: null,
          });

          localStorage.setItem('user', JSON.stringify(user));
          return user;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data || 'Profile update failed',
          });
          throw error;
        }
      },

      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.changePassword(data);
          set({ isLoading: false, error: null });
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data || 'Password change failed',
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);