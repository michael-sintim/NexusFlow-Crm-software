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
  currentContact: null,
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

  // GET single contact
  fetchContact: async (id) => {
    set({ contactsLoading: true, contactsError: null });
    try {
      const response = await contactsAPI.getById(id);
      set({ currentContact: response.data, contactsLoading: false });
      return response.data;
    } catch (error) {
      set({
        contactsError: error.response?.data || 'Failed to fetch contact',
        contactsLoading: false,
      });
      throw error;
    }
  },

  // CREATE contact
  createContact: async (data) => {
    set({ contactsLoading: true, contactsError: null });
    try {
      const response = await contactsAPI.create(data);
      set(state => ({ 
        contacts: [response.data, ...state.contacts],
        contactsLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({
        contactsError: error.response?.data || 'Failed to create contact',
        contactsLoading: false,
      });
      throw error;
    }
  },

  // UPDATE contact
  updateContact: async (id, data) => {
    set({ contactsLoading: true, contactsError: null });
    try {
      const response = await contactsAPI.update(id, data);
      set(state => ({
        contacts: state.contacts.map(contact => 
          contact.id === id ? response.data : contact
        ),
        currentContact: response.data,
        contactsLoading: false
      }));
      return response.data;
    } catch (error) {
      set({
        contactsError: error.response?.data || 'Failed to update contact',
        contactsLoading: false,
      });
      throw error;
    }
  },

  // DELETE contact
  deleteContact: async (id) => {
    set({ contactsLoading: true, contactsError: null });
    try {
      await contactsAPI.delete(id);
      set(state => ({
        contacts: state.contacts.filter(contact => contact.id !== id),
        currentContact: state.currentContact?.id === id ? null : state.currentContact,
        contactsLoading: false
      }));
    } catch (error) {
      set({
        contactsError: error.response?.data || 'Failed to delete contact',
        contactsLoading: false,
      });
      throw error;
    }
  },

  // GET single contact (alias for fetchContact)
  getContact: async (id) => {
    return get().fetchContact(id);
  },

  updateLastContacted: async (contactId) => {
    try {
      console.log('DataStore: Updating last contacted for:', contactId);
      await contactsAPI.updateLastContacted(contactId);
      
      // Update local state immediately for better UX
      set(state => ({
        contacts: state.contacts.map(contact => 
          contact.id === contactId 
            ? { 
                ...contact, 
                last_contacted: new Date().toISOString(),
                contacted: true 
              }
            : contact
        )
      }));
      
      return contactId;
    } catch (error) {
      console.error('DataStore: Failed to update last contacted:', error);
      throw error;
    }
  },

  // Clear current contact
  clearCurrentContact: () => set({ currentContact: null }),

  // Clear contacts error
  clearContactsError: () => set({ contactsError: null }),

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
   * TASKS - UPDATED WITH COMPLETE CRUD
   * ===================== */
  tasks: [],
  currentTask: null,
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

  // GET single task
  fetchTask: async (id) => {
    set({ tasksLoading: true, tasksError: null });
    try {
      const response = await tasksAPI.getById(id);
      set({ currentTask: response.data, tasksLoading: false });
      return response.data;
    } catch (error) {
      set({
        tasksError: error.response?.data || 'Failed to fetch task',
        tasksLoading: false,
      });
      throw error;
    }
  },

  // CREATE task
  createTask: async (data) => {
    set({ tasksLoading: true, tasksError: null });
    try {
      const response = await tasksAPI.create(data);
      set(state => ({ 
        tasks: [response.data, ...state.tasks],
        tasksLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({
        tasksError: error.response?.data || 'Failed to create task',
        tasksLoading: false,
      });
      throw error;
    }
  },

  // UPDATE task
  updateTask: async (id, data) => {
    set({ tasksLoading: true, tasksError: null });
    try {
      const response = await tasksAPI.update(id, data);
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? response.data : task
        ),
        currentTask: response.data,
        tasksLoading: false
      }));
      return response.data;
    } catch (error) {
      set({
        tasksError: error.response?.data || 'Failed to update task',
        tasksLoading: false,
      });
      throw error;
    }
  },

  // DELETE task
  deleteTask: async (id) => {
    set({ tasksLoading: true, tasksError: null });
    try {
      await tasksAPI.delete(id);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        tasksLoading: false
      }));
    } catch (error) {
      set({
        tasksError: error.response?.data || 'Failed to delete task',
        tasksLoading: false,
      });
      throw error;
    }
  },

  // COMPLETE task
  complete: async (taskId) => {
    try {
      await tasksAPI.complete(taskId);
      // Update local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, status: 'completed' } : task
        ),
        currentTask: state.currentTask?.id === taskId 
          ? { ...state.currentTask, status: 'completed' }
          : state.currentTask
      }));
    } catch (error) {
      console.error('Failed to complete task:', error);
      throw error;
    }
  },

  // START task
  start: async (taskId) => {
    try {
      await tasksAPI.start(taskId);
      // Update local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, status: 'in_progress' } : task
        ),
        currentTask: state.currentTask?.id === taskId 
          ? { ...state.currentTask, status: 'in_progress' }
          : state.currentTask
      }));
    } catch (error) {
      console.error('Failed to start task:', error);
      throw error;
    }
  },

  // GET single task (alias for fetchTask)
  getTask: async (id) => {
    return get().fetchTask(id);
  },

  // Clear current task
  clearCurrentTask: () => set({ currentTask: null }),

  // Clear tasks error
  clearTasksError: () => set({ tasksError: null }),

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