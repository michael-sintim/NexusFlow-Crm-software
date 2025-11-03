import axios from 'axios'

// ==============================
// 🔧 BASE CONFIGURATION
// ==============================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

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
    if (token) config.headers.Authorization = `Bearer ${token}`
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
          const { data } = await axios.post(`${BASE_URL}/auth/refresh_token/`, {
            refresh: refreshToken,
          })
          localStorage.setItem('access_token', data.access)
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return api(originalRequest)
        } catch {
          // If refresh fails → logout user
          localStorage.clear()
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
  login: (credentials) => post('/auth/login/', credentials),
  register: (userData) => post('/auth/register/', userData),
  refreshToken: (refresh) => post('/auth/refresh_token/', { refresh }),
  getProfile: () => get('/auth/me/'),
  updateProfile: (data) => put('/auth/update_profile/', data),
  changePassword: (data) => post('/auth/change_password/', data),
}

// ==============================
// 👥 USERS API
// ==============================

export const usersAPI = {
  getAll: () => get('/accounts/users/'),
  getById: (id) => get(`/accounts/users/${id}/`),
  create: (data) => post('/accounts/users/', data),
  update: (id, data) => put(`/accounts/users/${id}/`, data),
  delete: (id) => del(`/accounts/users/${id}/`),
  deactivate: (id) => post(`/accounts/users/${id}/deactivate/`),
  activate: (id) => post(`/accounts/users/${id}/activate/`),
}

// ==============================
// 📇 CONTACTS API
// ==============================

export const contactsAPI = {
  getAll: (params) => get('/contacts/contacts/', params),
  getById: (id) => get(`/contacts/contacts/${id}/`),
  create: (data) => post('/contacts/contacts/', data),
  update: (id, data) => put(`/contacts/contacts/${id}/`, data),
  delete: (id) => del(`/contacts/contacts/${id}/`),
  getStats: () => get('/contacts/contacts/stats/'),
  updateLastContacted: (id) => post(`/contacts/contacts/${id}/update_last_contacted/`),
}

// ==============================
// 🏷️ TAGS API
// ==============================

export const tagsAPI = {
  getAll: () => get('/contacts/tags/'),
  getPopular: () => get('/contacts/tags/popular/'),
  create: (data) => post('/contacts/tags/', data),
  update: (id, data) => put(`/contacts/tags/${id}/`, data),
  delete: (id) => del(`/contacts/tags/${id}/`),
}

// ==============================
// 💼 OPPORTUNITIES API
// ==============================

export const opportunitiesAPI = {
  getAll: (params) => get('/opportunities/opportunities/', params),
  getById: (id) => get(`/opportunities/opportunities/${id}/`),
  create: (data) => post('/opportunities/opportunities/', data),
  update: (id, data) => put(`/opportunities/opportunities/${id}/`, data),
  delete: (id) => del(`/opportunities/opportunities/${id}/`),
  getPipeline: () => get('/opportunities/opportunities/pipeline/'),
  getUpcomingCloses: () => get('/opportunities/opportunities/upcoming_closes/'),
  updateStage: (id, stage) => post(`/opportunities/opportunities/${id}/update_stage/`, { stage }),
}

// ==============================
// ✅ TASKS API
// ==============================

export const tasksAPI = {
  getAll: (params) => get('/tasks/tasks/', params),
  getById: (id) => get(`/tasks/tasks/${id}/`),
  create: (data) => post('/tasks/tasks/', data),
  update: (id, data) => put(`/tasks/tasks/${id}/`, data),
  delete: (id) => del(`/tasks/tasks/${id}/`),
  getMyTasks: (params) => get('/tasks/tasks/my_tasks/', params),
  getOverdue: () => get('/tasks/tasks/overdue/'),
  complete: (id) => patch(`/tasks/tasks/${id}/complete/`),
  start: (id) => patch(`/tasks/tasks/${id}/start/`),
  getDashboardStats: () => get('/tasks/tasks/dashboard_stats/'),
}

// ==============================
// 🔔 ACTIVITY LOGS API
// ==============================

export const activityAPI = {
  getAll: (params) => get('/notifications/activity-logs/', params),
  getRecent: () => get('/notifications/activity-logs/recent_activity/'),
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
}

// ==============================
// 📅 CALENDAR API (New addition)
// ==============================


// ==============================
// 🧭 EXPORT DEFAULT
// ==============================

export default api
