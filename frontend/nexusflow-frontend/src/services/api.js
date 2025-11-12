import axios from 'axios'

// ==============================
// 🔧 BASE CONFIGURATION
// ==============================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://41.74.81.68:8000/api'

// 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
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
    
    // Add cache busting for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _: Date.now() // Cache busting parameter
      }
    }
    
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    
    // Validate response content type
    const contentType = response.headers['content-type'] || ''
    if (contentType.includes('text/html') && !response.config.url.includes('/admin/')) {
      console.error('❌ Received HTML instead of JSON:', response.data)
      throw new Error(`API returned HTML instead of JSON. Check endpoint: ${response.config.url}`)
    }
    
    return response
  },
  async (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    })
    
    // Handle HTML responses (wrong endpoint)
    if (error.response?.headers?.['content-type']?.includes('text/html')) {
      const errorMsg = `API endpoint not found or returning HTML: ${error.config?.url}`
      console.error(errorMsg)
      throw new Error(errorMsg)
    }

    const originalRequest = error.config

    // Retry once if token expired
    if (error.response?.status === 401 && !originalRequest?._retry) {
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
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }

    // Handle other errors
    if (error.response?.status === 404) {
      throw new Error(`API endpoint not found: ${error.config?.url}`)
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.')
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
// 📅 CALENDAR API - FIXED
// ==============================

export const calendarAPI = {
  // Main CRUD operations
  getAll: (params = {}) => get('/calendar/events/', { ...params }),
  getById: (id) => get(`/calendar/events/${id}/`),
  create: (data) => post('/calendar/events/', data),
  update: (id, data) => put(`/calendar/events/${id}/`, data),
  delete: (id) => del(`/calendar/events/${id}/`),
  
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
  
  // Event management
  changeEventStatus: (id, status) => patch(`/calendar/events/${id}/`, { status }),
  completeEvent: (id) => patch(`/calendar/events/${id}/`, { status: 'completed' }),
  cancelEvent: (id) => patch(`/calendar/events/${id}/`, { status: 'cancelled' }),
  
  // Event type management
  getByEventType: (eventType) => get('/calendar/events/', { event_type: eventType }),
  
  // Event relationships
  getEventsByContact: (contactId) => get('/calendar/events/', { contact: contactId }),
  getEventsByOpportunity: (opportunityId) => get('/calendar/events/', { opportunity: opportunityId }),
  getEventsByUser: (userId) => get('/calendar/events/', { assigned_to: userId }),
  getMyEvents: (params = {}) => get('/calendar/events/', { ...params, my_events: true }),
  
  // Event analytics
  getEventStats: () => get('/calendar/events/stats/'),
  getBusyDays: (params = {}) => get('/calendar/events/busy_days/', params),
  getEventTypeDistribution: () => get('/calendar/events/event_type_distribution/'),
  
  // Backward compatibility
  getEvents: (params = {}) => get('/calendar/events/', params),
  createEvent: (data) => post('/calendar/events/', data),
  updateEvent: (id, data) => put(`/calendar/events/${id}/`, data),
  deleteEvent: (id) => del(`/calendar/events/${id}/`),
  getUpcomingEvents: (params = {}) => get('/calendar/events/upcoming/', params),
}

// ==============================
// 👤 AUTH API
// ==============================

export const authAPI = {
  login: (credentials) => post('/auth/login/', credentials),
  register: (userData) => post('/auth/register/', userData),
  refreshToken: (refresh) => post('/auth/refresh_token/', { refresh }),
  getProfile: () => get('/auth/me/'),
  updateProfile: (data) => put('/auth/update_profile/', data),
  changePassword: (data) => post('/auth/change_password/', data),
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
  getAll: (params = {}) => get('/contacts/contacts/', params),
  getById: (id) => get(`/contacts/contacts/${id}/`),
  create: (data) => post('/contacts/contacts/', data),
  update: (id, data) => put(`/contacts/contacts/${id}/`, data),
  delete: (id) => del(`/contacts/contacts/${id}/`),
  getStats: () => get('/contacts/contacts/stats/'),
  updateLastContacted: (id) => post(`/contacts/contacts/${id}/update_last_contacted/`),
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
  getAll: (params = {}) => get('/opportunities/opportunities/', params),
  getById: (id) => get(`/opportunities/opportunities/${id}/`),
  create: (data) => post('/opportunities/opportunities/', data),
  update: (id, data) => put(`/opportunities/opportunities/${id}/`, data),
  delete: (id) => del(`/opportunities/opportunities/${id}/`),
  getPipeline: () => get('/opportunities/opportunities/pipeline/'),
  getUpcomingCloses: () => get('/opportunities/opportunities/upcoming_closes/'),
  updateStage: (id, stage) => post(`/opportunities/opportunities/${id}/update_stage/`, { stage }),
  getForecast: () => get('/opportunities/opportunities/forecast/'),
  getStageMetrics: () => get('/opportunities/opportunities/stage_metrics/'),
}

// ==============================
// ✅ TASKS API
// ==============================

export const tasksAPI = {
  getAll: (params = {}) => get('/tasks/tasks/', params),
  getById: (id) => get(`/tasks/tasks/${id}/`),
  create: (data) => post('/tasks/tasks/', data),
  update: (id, data) => put(`/tasks/tasks/${id}/`, data),
  delete: (id) => del(`/tasks/tasks/${id}/`),
  getMyTasks: (params = {}) => get('/tasks/tasks/my_tasks/', params),
  getOverdue: () => get('/tasks/tasks/overdue/'),
  complete: (id) => patch(`/tasks/tasks/${id}/complete/`),
  start: (id) => patch(`/tasks/tasks/${id}/start/`),
  getDashboardStats: () => get('/tasks/tasks/dashboard_stats/'),
  getTaskMetrics: () => get('/tasks/tasks/metrics/'),
}

// ==============================
// 🔔 ACTIVITY & NOTIFICATIONS API
// ==============================

export const activityAPI = {
  getAll: (params = {}) => get('/notifications/activity-logs/', params),
  getRecent: () => get('/notifications/activity-logs/recent_activity/'),
  getNotifications: () => get('/notifications/notifications/'),
  markAsRead: (id) => patch(`/notifications/notifications/${id}/mark_read/`),
  markAllAsRead: () => post('/notifications/notifications/mark_all_read/'),
  getUnreadCount: () => get('/notifications/notifications/unread_count/'),
}

// ==============================
// 📊 ANALYTICS API
// ==============================

export const analyticsAPI = {
  getDashboard: () => get('/analytics/dashboard/'),
  getPipeline: () => get('/analytics/pipeline/'),
  getForecast: () => get('/analytics/forecast/'),
  getTeamPerformance: () => get('/analytics/team_performance/'),
  getActivityTrends: () => get('/analytics/activity_trends/'),
  getSourceAnalysis: () => get('/analytics/source_analysis/'),
  getTaskAnalytics: () => get('/analytics/task_analytics/'),
  getRevenueTrends: () => get('/analytics/revenue_trends/'),
  getConversionMetrics: () => get('/analytics/conversion_metrics/'),
  getExecutiveSummary: () => get('/analytics/executive_summary/'),
  getKPI: () => get('/analytics/kpi/'),
}

// ==============================
// 📦 EXPORT ALL APIs
// ==============================

export { get, post, put, patch, del }
export default api