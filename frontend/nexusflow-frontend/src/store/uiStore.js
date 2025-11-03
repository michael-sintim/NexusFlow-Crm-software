import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Modals
      modals: {},
      openModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: true }
      })),
      closeModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: false }
      })),
      closeAllModals: () => set({ modals: {} }),

      // Notifications
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { ...notification, id: Date.now() }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Loading states
      loading: {},
      setLoading: (key, isLoading) => set((state) => ({
        loading: { ...state.loading, [key]: isLoading }
      })),
    }),
    {
      name: 'ui-storage',
    }
  )
);