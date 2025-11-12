import axios from 'axios'

// ==============================
// 🔧 BASE CONFIGURATION
// ==============================

const BASE_URL = import.meta.env.VITE_API_BASE_URL ||   'http://41.74.81.68:8000/api'

// 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==============================
// 🔐 INTERCEPTORS
// ==============================

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle expired tokens (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Retry once if token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          const { data } = await api.post('/auth/refresh_token/', {
            refresh: refreshToken,
          })
          localStorage.setItem('access_token', data.access)
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return api(originalRequest)
        } catch {
          // If refresh fails → logout user
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// ==============================
// 🧩 API MODULE HELPERS
// ==============================

const get = (url, params = {}) => api.get(url, { params })
const post = (url, data = {}) => api.post(url, data)
const put = (url, data = {}) => api.put(url, data)
const patch = (url, data = {}) => api.patch(url, data)
const del = (url) => api.delete(url)

// ==============================
// 👤 AUTH API
// ==============================

export const authAPI = {
  // Authentication
  login: (credentials) => post('/auth/login/', credentials),
  register: (userData) => post('/auth/register/', userData),
  refreshToken: (refresh) => post('/auth/refresh_token/', { refresh }),
  
  // User profile
  getProfile: () => get('/auth/me/'),
  updateProfile: (data) => put('/auth/update_profile/', data),
  changePassword: (data) => post('/auth/change_password/', data),
  
  // User management (admin)
  getUsers: () => get('/auth/users/'),
  getUser: (id) => get(`/auth/users/${id}/`),
  createUser: (data) => post('/auth/users/create/', data),
  updateUser: (id, data) => put(`/auth/users/${id}/update/`, data),
  deleteUser: (id) => del(`/auth/users/${id}/delete/`),
  deactivateUser: (id) => post(`/auth/users/${id}/deactivate/`),
  activateUser: (id) => post(`/auth/users/${id}/activate/`),
}

// ==============================
// 📇 CONTACTS API
// ==============================

export const contactsAPI = {
  // Contacts CRUD
  getAll: (params = {}) => get('/contacts/contacts/', params),
  getById: (id) => get(`/contacts/contacts/${id}/`),
  create: (data) => post('/contacts/contacts/', data),
  update: (id, data) => put(`/contacts/contacts/${id}/`, data),
  delete: (id) => del(`/contacts/contacts/${id}/`),
  
  // Contact actions
  getStats: () => get('/contacts/contacts/stats/'),
  updateLastContacted: (id) => post(`/contacts/contacts/${id}/update_last_contacted/`),
  
  // Tags
  getTags: () => get('/contacts/tags/'),
  getPopularTags: () => get('/contacts/tags/popular/'),
  createTag: (data) => post('/contacts/tags/', data),
  updateTag: (id, data) => put(`/contacts/tags/${id}/`, data),
  deleteTag: (id) => del(`/contacts/tags/${id}/`),
}

// ==============================
// 💼 OPPORTUNITIES API
// ==============================

export const opportunitiesAPI = {
  // Opportunities CRUD
  getAll: (params = {}) => get('/opportunities/opportunities/', params),
  getById: (id) => get(`/opportunities/opportunities/${id}/`),
  create: (data) => post('/opportunities/opportunities/', data),
  update: (id, data) => put(`/opportunities/opportunities/${id}/`, data),
  delete: (id) => del(`/opportunities/opportunities/${id}/`),
  
  // Pipeline management
  getPipeline: () => get('/opportunities/opportunities/pipeline/'),
  getUpcomingCloses: () => get('/opportunities/opportunities/upcoming_closes/'),
  updateStage: (id, stage) => post(`/opportunities/opportunities/${id}/update_stage/`, { stage }),
  
  // Analytics
  getForecast: () => get('/opportunities/opportunities/forecast/'),
  getStageMetrics: () => get('/opportunities/opportunities/stage_metrics/'),
}

// ==============================
// ✅ TASKS API
// ==============================

export const tasksAPI = {
  // Tasks CRUD
  getAll: (params = {}) => get('/tasks/tasks/', params),
  getById: (id) => get(`/tasks/tasks/${id}/`),
  create: (data) => post('/tasks/tasks/', data),
  update: (id, data) => put(`/tasks/tasks/${id}/`, data),
  delete: (id) => del(`/tasks/tasks/${id}/`),
  
  // Task management
  getMyTasks: (params = {}) => get('/tasks/tasks/my_tasks/', params),
  getOverdue: () => get('/tasks/tasks/overdue/'),
  complete: (id) => patch(`/tasks/tasks/${id}/complete/`),
  start: (id) => patch(`/tasks/tasks/${id}/start/`),
  
  // Task analytics
  getDashboardStats: () => get('/tasks/tasks/dashboard_stats/'),
  getTaskMetrics: () => get('/tasks/tasks/metrics/'),
}

// ==============================
// 🔔 ACTIVITY & NOTIFICATIONS API
// ==============================

export const activityAPI = {
  // Activity logs
  getAll: (params = {}) => get('/notifications/activity-logs/', params),
  getRecent: () => get('/notifications/activity-logs/recent_activity/'),
  
  // Notifications
  getNotifications: () => get('/notifications/notifications/'),
  markAsRead: (id) => patch(`/notifications/notifications/${id}/mark_read/`),
  markAllAsRead: () => post('/notifications/notifications/mark_all_read/'),
  getUnreadCount: () => get('/notifications/notifications/unread_count/'),
}

// ==============================
// 📊 ANALYTICS API
// ==============================

export const analyticsAPI = {
  // Dashboard
  getDashboard: () => get('/analytics/dashboard/'),
  getPipeline: () => get('/analytics/pipeline/'),
  getForecast: () => get('/analytics/forecast/'),
  
  // Performance
  getTeamPerformance: () => get('/analytics/team_performance/'),
  getActivityTrends: () => get('/analytics/activity_trends/'),
  getSourceAnalysis: () => get('/analytics/source_analysis/'),
  
  // Task analytics
  getTaskAnalytics: () => get('/analytics/task_analytics/'),
  
  // Revenue & conversion
  getRevenueTrends: () => get('/analytics/revenue_trends/'),
  getConversionMetrics: () => get('/analytics/conversion_metrics/'),
  
  // Executive
  getExecutiveSummary: () => get('/analytics/executive_summary/'),
  getKPI: () => get('/analytics/kpi/'),
}

// ==============================
// 📅 CALENDAR API - UPDATED
// ==============================

export const calendarAPI = {
  // =====================
  // EVENTS CRUD
  // =====================
  
  // Main CRUD operations
  
  getAll: (params = {}) => get('/calendar/events/', { ...params, _t: Date.now() }),
  getById: (id) => get(`/calendar/events/${id}/`, { _t: Date.now() }),
  create: (data) => post('/calendar/events/', data),
  update: (id, data) => put(`/calendar/events/${id}/`, data),
  delete: (id) => del(`/calendar/events/${id}/`),
  // =====================
  // EVENT FILTERING & QUERIES
  // =====================
  
  // Date-based queries
  getUpcoming: (params = {}) => get('/calendar/events/upcoming/', params),
  getToday: () => get('/calendar/events/today/'),
  getByDateRange: (startDate, endDate) => 
    get('/calendar/events/', { start_date: startDate, end_date: endDate }),
  getByMonth: (year, month) => 
    get('/calendar/events/', { year, month }),
  
  // Status-based queries
  getByStatus: (status) => get('/calendar/events/', { status }),
  getCompleted: () => get('/calendar/events/', { status: 'completed' }),
  getPending: () => get('/calendar/events/', { status: 'scheduled' }),
  
  // =====================
  // EVENT MANAGEMENT
  // =====================
  
  // Event status management
  changeEventStatus: (id, status) => patch(`/calendar/events/${id}/`, { status }),
  completeEvent: (id) => patch(`/calendar/events/${id}/`, { status: 'completed' }),
  cancelEvent: (id) => patch(`/calendar/events/${id}/`, { status: 'cancelled' }),
  
  // Event type management
  getByEventType: (eventType) => get('/calendar/events/', { event_type: eventType }),
  
  // =====================
  // EVENT RELATIONSHIPS
  // =====================
  
  // Contact-related events
  getEventsByContact: (contactId) => get('/calendar/events/', { contact: contactId }),
  
  // Opportunity-related events
  getEventsByOpportunity: (opportunityId) => get('/calendar/events/', { opportunity: opportunityId }),
  
  // User-related events
  getMyEvents: (params = {}) => get('/calendar/events/my_events/', params),
  getEventsByUser: (userId) => get('/calendar/events/', { assigned_to: userId }),
  
  // =====================
  // EVENT ANALYTICS
  // =====================
  
  getEventStats: () => get('/calendar/events/stats/'),
  getBusyDays: (params = {}) => get('/calendar/events/busy_days/', params),
  getEventTypeDistribution: () => get('/calendar/events/event_type_distribution/'),
  
  // =====================
  // BACKWARD COMPATIBILITY
  // =====================
  
  // Legacy endpoints for existing components
  getEvents: (params = {}) => get('/calendar/events/', params),
  createEvent: (data) => post('/calendar/events/', data),
  updateEvent: (id, data) => put(`/calendar/events/${id}/`, data),
  deleteEvent: (id) => del(`/calendar/events/${id}/`),
  getUpcomingEvents: (params = {}) => get('/calendar/events/upcoming/', params),
}

// ==============================
// 📈 DASHBOARD API - NEW
// ==============================

export const dashboardAPI = {
  // Comprehensive dashboard data
  getOverview: () => get('/dashboard/overview/'),
  getQuickStats: () => get('/dashboard/quick_stats/'),
  
  // Performance metrics
  getPerformanceMetrics: () => get('/dashboard/performance_metrics/'),
  getSalesMetrics: () => get('/dashboard/sales_metrics/'),
  
  // Activity feeds
  getRecentActivity: () => get('/dashboard/recent_activity/'),
  getUpcomingEvents: () => get('/dashboard/upcoming_events/'),
  
  // Team performance
  getTeamPerformance: () => get('/dashboard/team_performance/'),
  getIndividualStats: (userId) => get(`/dashboard/individual_stats/${userId}/`),
}

// ==============================
// 📊 REPORTING API - NEW
// ==============================

export const reportsAPI = {
  // Sales reports
  getSalesReport: (params = {}) => get('/reports/sales/', params),
  getPipelineReport: (params = {}) => get('/reports/pipeline/', params),
  
  // Activity reports
  getActivityReport: (params = {}) => get('/reports/activity/', params),
  getTaskReport: (params = {}) => get('/reports/tasks/', params),
  
  // Performance reports
  getPerformanceReport: (params = {}) => get('/reports/performance/', params),
  getConversionReport: (params = {}) => get('/reports/conversion/', params),
  
  // Export functionality
  exportReport: (reportType, format = 'pdf', params = {}) => 
    get(`/reports/export/${reportType}/`, { ...params, format }),
}

// ==============================
// 🔧 SETTINGS API - NEW
// ==============================

export const settingsAPI = {
  // User preferences
  getPreferences: () => get('/settings/preferences/'),
  updatePreferences: (data) => put('/settings/preferences/', data),
  
  // System settings (admin only)
  getSystemSettings: () => get('/settings/system/'),
  updateSystemSettings: (data) => put('/settings/system/', data),
  
  // Notification settings
  getNotificationSettings: () => get('/settings/notifications/'),
  updateNotificationSettings: (data) => put('/settings/notifications/', data),
}

// ==============================
// 📦 EXPORT ALL APIs
// ==============================

export {
  get,
  post,
  put,
  patch,
  del,
}

export default api