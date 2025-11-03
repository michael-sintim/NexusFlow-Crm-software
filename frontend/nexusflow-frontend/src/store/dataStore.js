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
      console.log('DataStore: Fetched contacts:', contactsData.length);
      
      // Debug: Check if contacted field exists
      if (contactsData.length > 0) {
        console.log('DataStore: Sample contact with contacted field:', {
          id: contactsData[0].id,
          name: `${contactsData[0].first_name} ${contactsData[0].last_name}`,
          last_contacted: contactsData[0].last_contacted,
          contacted: contactsData[0].contacted
        });
      }
      
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
      console.log('DataStore: Updating last contacted for:', contactId);
      await contactsAPI.updateLastContacted(contactId);
      console.log('DataStore: Update successful, fetching fresh contacts');
      
      const freshContacts = await get().fetchContacts();
      console.log('DataStore: Fresh contacts received:', freshContacts.length);
      
      // Check if our updated contact is in the list
      const updatedContact = freshContacts.find(c => c.id === contactId);
      if (updatedContact) {
        console.log('DataStore: Updated contact found:', {
          id: updatedContact.id,
          name: `${updatedContact.first_name} ${updatedContact.last_name}`,
          last_contacted: updatedContact.last_contacted,
          contacted: updatedContact.contacted
        });
      } else {
        console.log('DataStore: Updated contact NOT found in fresh data');
      }
      
      return freshContacts;
    } catch (error) {
      console.error('DataStore: Failed to update last contacted:', error);
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
}));