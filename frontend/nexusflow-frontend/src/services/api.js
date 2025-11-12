import axios from 'axios'

// ==============================
// 🔧 BASE CONFIGURATION
// ==============================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://41.74.81.68:8000/api'

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
    
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data)
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
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data)
    return response
  },
  async (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      method: error.config?.method
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
// 📅 CALENDAR API - UPDATED WITH BETTER ERROR HANDLING
// ==============================

export const calendarAPI = {
  // Main CRUD operations with multiple endpoint variations
  getAll: (params = {}) => {
    // Try multiple endpoint variations
    const endpoints = [
      '/calendar/events/',
      '/events/',
      '/calendar/'
    ];
    
    return tryEndpoints(endpoints, 'get', params);
  },
  
  getById: (id) => {
    const endpoints = [
      `/calendar/events/${id}/`,
      `/events/${id}/`,
      `/calendar/${id}/`
    ];
    return tryEndpoints(endpoints, 'get');
  },
  
  create: (data) => {
    const endpoints = [
      '/calendar/events/',
      '/events/',
      '/calendar/'
    ];
    return tryEndpoints(endpoints, 'post', data);
  },
  
  update: (id, data) => {
    const endpoints = [
      `/calendar/events/${id}/`,
      `/events/${id}/`,
      `/calendar/${id}/`
    ];
    return tryEndpoints(endpoints, 'put', data);
  },
  
  delete: (id) => {
    const endpoints = [
      `/calendar/events/${id}/`,
      `/events/${id}/`,
      `/calendar/${id}/`
    ];
    return tryEndpoints(endpoints, 'delete');
  },

  // Simplified versions for direct use
  getEvents: (params = {}) => get('/calendar/events/', params),
  createEvent: (data) => post('/calendar/events/', data),
  updateEvent: (id, data) => put(`/calendar/events/${id}/`, data),
  deleteEvent: (id) => del(`/calendar/events/${id}/`),

  // Date-based queries
  getUpcoming: (params = {}) => get('/calendar/events/upcoming/', params),
  getToday: () => get('/calendar/events/today/'),
  getByDateRange: (startDate, endDate) => 
    get('/calendar/events/', { start_date: startDate, end_date: endDate }),
  
  // Status-based queries
  getByStatus: (status) => get('/calendar/events/', { status }),
};

// Helper function to try multiple endpoints
const tryEndpoints = async (endpoints, method, data = null) => {
  let lastError = null;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Trying endpoint: ${method.toUpperCase()} ${endpoint}`);
      let response;
      
      switch (method) {
        case 'get':
          response = await get(endpoint, data);
          break;
        case 'post':
          response = await post(endpoint, data);
          break;
        case 'put':
          response = await put(endpoint, data);
          break;
        case 'delete':
          response = await del(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      console.log(`✅ Success with endpoint: ${endpoint}`);
      return response;
    } catch (error) {
      console.log(`❌ Failed with endpoint: ${endpoint}`, error.response?.status);
      lastError = error;
      
      // If it's a 404, try next endpoint
      if (error.response?.status === 404) {
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // If all endpoints failed, throw the last error
  throw lastError || new Error(`All endpoints failed for ${method} operation`);
};

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
// 📇 CONTACTS API
// ==============================

export const contactsAPI = {
  getAll: (params = {}) => get('/contacts/contacts/', params),
  getById: (id) => get(`/contacts/contacts/${id}/`),
  create: (data) => post('/contacts/contacts/', data),
  update: (id, data) => put(`/contacts/contacts/${id}/`, data),
  delete: (id) => del(`/contacts/contacts/${id}/`),
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
}

// ==============================
// 📊 ANALYTICS API
// ==============================

export const analyticsAPI = {
  getDashboard: () => get('/analytics/dashboard/'),
  getPipeline: () => get('/analytics/pipeline/'),
}

export { get, post, put, patch, del }
export default api