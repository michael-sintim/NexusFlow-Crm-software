import { create } from 'zustand';
import {
  contactsAPI,
  opportunitiesAPI,
  tasksAPI,
  analyticsAPI,
} from '../services/api';

export const useDataStore = create((set, get) => ({
  /* =====================
   * CONTACTS
   * ===================== */
  contacts: [],
  contactsLoading: false,
  contactsError: null,

  fetchContacts: async (params = {}) => {
    set({ contactsLoading: true, contactsError: null });
    try {
      const response = await contactsAPI.getAll(params);
      
      // Handle paginated response format
      const contactsData = response.data.results || response.data;
      set({ contacts: contactsData, contactsLoading: false });
      return contactsData;
    } catch (error) {
      set({
        contactsError: error.response?.data || 'Failed to fetch contacts',
        contactsLoading: false,
      });
      throw error;
    }
  },

  createContact: async (data) => {
    try {
      await contactsAPI.create(data);
      await get().fetchContacts();
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw error;
    }
  },

  updateLastContacted: async (contactId) => {
    try {
      await contactsAPI.updateLastContacted(contactId);
      await get().fetchContacts();
    } catch (error) {
      console.error('Failed to update last contacted:', error);
      throw error;
    }
  },

  /* =====================
   * OPPORTUNITIES
   * ===================== */
  opportunities: [],
  opportunitiesLoading: false,
  opportunitiesError: null,

  fetchOpportunities: async (params = {}) => {
    set({ opportunitiesLoading: true, opportunitiesError: null });
    try {
      const response = await opportunitiesAPI.getAll(params);
      
      // Handle paginated response format
      const opportunitiesData = response.data.results || response.data;
      set({ opportunities: opportunitiesData, opportunitiesLoading: false });
      return opportunitiesData;
    } catch (error) {
      set({
        opportunitiesError: error.response?.data || 'Failed to fetch opportunities',
        opportunitiesLoading: false,
      });
      throw error;
    }
  },

  createOpportunity: async (data) => {
    try {
      await opportunitiesAPI.create(data);
      await get().fetchOpportunities();
    } catch (error) {
      console.error('Failed to create opportunity:', error);
      throw error;
    }
  },

  /* =====================
   * TASKS
   * ===================== */
  tasks: [],
  tasksLoading: false,
  tasksError: null,

  fetchTasks: async (params = {}) => {
    set({ tasksLoading: true, tasksError: null });
    try {
      const response = await tasksAPI.getAll(params);
      
      // Handle paginated response format
      const tasksData = response.data.results || response.data;
      set({ tasks: tasksData, tasksLoading: false });
      return tasksData;
    } catch (error) {
      set({
        tasksError: error.response?.data || 'Failed to fetch tasks',
        tasksLoading: false,
      });
      throw error;
    }
  },

  createTask: async (data) => {
    try {
      await tasksAPI.create(data);
      await get().fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  },

  /* =====================
   * ANALYTICS
   * ===================== */
  dashboardData: null,
  pipelineData: null,
  analyticsLoading: false,
  analyticsError: null,

  fetchDashboardData: async () => {
    set({ analyticsLoading: true, analyticsError: null });
    try {
      const response = await analyticsAPI.getDashboard();
      set({ dashboardData: response.data, analyticsLoading: false });
      return response.data;
    } catch (error) {
      set({
        analyticsError: error.response?.data || 'Failed to fetch dashboard data',
        analyticsLoading: false,
      });
      throw error;
    }
  },

  fetchPipelineData: async () => {
    set({ analyticsLoading: true, analyticsError: null });
    try {
      const response = await analyticsAPI.getPipeline();
      set({ pipelineData: response.data, analyticsLoading: false });
      return response.data;
    } catch (error) {
      set({
        analyticsError: error.response?.data || 'Failed to fetch pipeline data',
        analyticsLoading: false,
      });
      throw error;
    }
  },

  // =====================
  // NOTIFICATIONS SECTION REMOVED
  // =====================
}));