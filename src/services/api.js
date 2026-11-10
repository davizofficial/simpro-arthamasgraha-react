import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,

  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const UNAUTHORIZED_EVENT = 'simpro:unauthorized';

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const requestUrl = error.config?.url || '';
    if (error.response?.status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/me')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    let customMessage = 'Terjadi kendala pada server SIMPRO. Silakan coba kembali.';
    if (error.response && error.response.data && error.response.data.error) {
      customMessage = error.response.data.error;
    } else if (error.message === 'Network Error') {
      customMessage = 'Gagal terhubung ke backend server. Pastikan API aktif di port 5000.';
    } else if (error.code === 'ECONNABORTED') {
      customMessage = 'Koneksi ke server waktu habis (timeout). Silakan refresh halaman.';
    }
    return Promise.reject(new Error(customMessage));
  }
);

export const dashboardService = {
  getSummary: (role = 'owner') => api.get('/dashboard', { params: { role } }),
};

export const projectService = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  submitProgress: (id, data) => api.post(`/projects/${id}/laporan`, data),
};

export const clientService = {
  getAll: (params) => api.get('/clients', { params }),
  create: (data) => api.post('/clients', data),
  delete: (id) => api.delete(`/clients/${id}`),
};

export const surveyService = {
  getAll: (params) => api.get('/site-surveys', { params }),
  create: (data) => api.post('/site-surveys', data),
  updateStatus: (id, data) => api.patch(`/site-surveys/${id}/status`, data),
};

export const progressService = {
  getAll: () => api.get('/progress'),
  submit: (data) => api.post('/progress', data),
};

export const materialService = {
  getAll: (params) => api.get('/materials', { params }),
  create: (data) => api.post('/materials', data),
};

export const materialRequestService = {
  getAll: (params) => api.get('/material-requests', { params }),
  create: (data) => api.post('/material-requests', data),
  updateStatus: (id, data) => api.patch(`/material-requests/${id}/status`, data),
};

export const equipmentService = {
  getAll: () => api.get('/equipments'),
  create: (data) => api.post('/equipments', data),
  assign: (id, data) => api.patch(`/equipments/${id}/assign`, data),
};

export const financeService = {
  getOverview: () => api.get('/finance'),
  createTransaction: (data) => api.post('/finance/transactions', data),
};

export const documentService = {
  getAll: (params) => api.get('/documents', { params }),
  create: (data) => api.post('/documents', data),
};

export const reportService = {
  getSummary: () => api.get('/reports'),
};

export const userService = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  toggleStatus: (id) => api.patch(`/users/${id}/status`),
};

export const settingService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const activityService = {
  getAll: (params) => api.get('/activity-logs', { params }),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export default api;
