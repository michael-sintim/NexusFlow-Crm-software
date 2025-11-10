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

  getContact: async (id) => {
    return get().fetchContact(id);
  },

  updateLastContacted: async (contactId) => {
    try {
      await contactsAPI.updateLastContacted(contactId);
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
      console.error('Failed to update last contacted:', error);
      throw error;
    }
  },

  clearCurrentContact: () => set({ currentContact: null }),
  clearContactsError: () => set({ contactsError: null }),

  /* =====================
   * OPPORTUNITIES - FIXED
   * ===================== */
  opportunities: [],
  opportunitiesLoading: false,
  opportunitiesError: null,

  fetchOpportunities: async (params = {}) => {
    set({ opportunitiesLoading: true, opportunitiesError: null });
    try {
      const response = await opportunitiesAPI.getAll(params);
      const opportunitiesData = response.data.results || response.data;
      
      set({ 
        opportunities: opportunitiesData, 
        opportunitiesLoading: false 
      });
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
    set({ opportunitiesLoading: true, opportunitiesError: null });
    try {
      const response = await opportunitiesAPI.create(data);
      set(state => ({ 
        opportunities: [response.data, ...state.opportunities],
        opportunitiesLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({
        opportunitiesError: error.response?.data || 'Failed to create opportunity',
        opportunitiesLoading: false,
      });
      throw error;
    }
  },

  updateOpportunity: async (id, data) => {
    set({ opportunitiesLoading: true, opportunitiesError: null });
    try {
      const response = await opportunitiesAPI.update(id, data);
      set(state => ({
        opportunities: state.opportunities.map(opp => 
          opp.id === id ? response.data : opp
        ),
        opportunitiesLoading: false
      }));
      return response.data;
    } catch (error) {
      set({
        opportunitiesError: error.response?.data || 'Failed to update opportunity',
        opportunitiesLoading: false,
      });
      throw error;
    }
  },

  deleteOpportunity: async (id) => {
    set({ opportunitiesLoading: true, opportunitiesError: null });
    try {
      await opportunitiesAPI.delete(id);
      set(state => ({
        opportunities: state.opportunities.filter(opp => opp.id !== id),
        opportunitiesLoading: false
      }));
    } catch (error) {
      set({
        opportunitiesError: error.response?.data || 'Failed to delete opportunity',
        opportunitiesLoading: false,
      });
      throw error;
    }
  },

  updateOpportunityStage: async (id, stage) => {
    set({ opportunitiesLoading: true });
    try {
      await opportunitiesAPI.updateStage(id, stage);
      set(state => ({
        opportunities: state.opportunities.map(opp => 
          opp.id === id ? { ...opp, stage } : opp
        ),
        opportunitiesLoading: false
      }));
    } catch (error) {
      set({ opportunitiesLoading: false });
      console.error('Failed to update opportunity stage:', error);
      throw error;
    }
  },

  /* =====================
   * TASKS
   * ===================== */
  tasks: [],
  currentTask: null,
  tasksLoading: false,
  tasksError: null,

  fetchTasks: async (params = {}) => {
    set({ tasksLoading: true, tasksError: null });
    try {
      const response = await tasksAPI.getAll(params);
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

  completeTask: async (taskId) => {
    set({ tasksLoading: true });
    try {
      await tasksAPI.complete(taskId);
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, status: 'completed' } : task
        ),
        currentTask: state.currentTask?.id === taskId 
          ? { ...state.currentTask, status: 'completed' }
          : state.currentTask,
        tasksLoading: false
      }));
    } catch (error) {
      set({ tasksLoading: false });
      console.error('Failed to complete task:', error);
      throw error;
    }
  },

  startTask: async (taskId) => {
    set({ tasksLoading: true });
    try {
      await tasksAPI.start(taskId);
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, status: 'in_progress' } : task
        ),
        currentTask: state.currentTask?.id === taskId 
          ? { ...state.currentTask, status: 'in_progress' }
          : state.currentTask,
        tasksLoading: false
      }));
    } catch (error) {
      set({ tasksLoading: false });
      console.error('Failed to start task:', error);
      throw error;
    }
  },

  getTask: async (id) => {
    return get().fetchTask(id);
  },

  clearCurrentTask: () => set({ currentTask: null }),
  clearTasksError: () => set({ tasksError: null }),

  /* =====================
   * ANALYTICS - FIXED
   * ===================== */
  dashboardData: null,
  pipelineData: [], // ✅ FIXED: Changed from null to []
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
      // ✅ FIXED: Ensure we always set an array
      const pipelineData = Array.isArray(response.data) ? response.data : [];
      set({ pipelineData, analyticsLoading: false });
      return pipelineData;
    } catch (error) {
      set({
        analyticsError: error.response?.data || 'Failed to fetch pipeline data',
        analyticsLoading: false,
        pipelineData: [] // ✅ FIXED: Set empty array on error
      });
      throw error;
    }
  },

  /* =====================
   * BULK ACTIONS
   * ===================== */
  clearAllErrors: () => set({ 
    contactsError: null, 
    opportunitiesError: null, 
    tasksError: null, 
    analyticsError: null 
  }),

  resetAllData: () => set({
    contacts: [],
    opportunities: [],
    tasks: [],
    dashboardData: null,
    pipelineData: [], // ✅ FIXED: Changed from null to []
    currentContact: null,
    currentTask: null
  })
}));