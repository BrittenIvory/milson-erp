import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['X-Milson-Auth-Token'] = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  deactivate: (id) => api.delete(`/users/${id}`),
};

export const partsAPI = {
  list: (params) => api.get('/parts', { params }),
  getById: (id) => api.get(`/parts/${id}`),
  create: (data) => api.post('/parts', data),
  update: (id, data) => api.put(`/parts/${id}`, data),
  deactivate: (id) => api.delete(`/parts/${id}`),
};

export const suppliersAPI = {
  list: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  deactivate: (id) => api.delete(`/suppliers/${id}`),
  getPrices: (id) => api.get(`/suppliers/${id}/prices`),
  setPrice: (id, data) => api.post(`/suppliers/${id}/prices`, data),
};

export const customersAPI = {
  list: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  deactivate: (id) => api.delete(`/customers/${id}`),
  getPrices: (id) => api.get(`/customers/${id}/prices`),
  setPrice: (id, data) => api.post(`/customers/${id}/prices`, data),
};

export const salesOrdersAPI = {
  list: (params) => api.get('/sales-orders', { params }),
  getById: (id) => api.get(`/sales-orders/${id}`),
  create: (data) => api.post('/sales-orders', data),
  update: (id, data) => api.put(`/sales-orders/${id}`, data),
  updateStatus: (id, data) => api.put(`/sales-orders/${id}/status`, data),
  cancel: (id) => api.delete(`/sales-orders/${id}`),
};

export const purchaseOrdersAPI = {
  list: (params) => api.get('/purchase-orders', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  updateStatus: (id, data) => api.put(`/purchase-orders/${id}/status`, data),
  cancel: (id) => api.delete(`/purchase-orders/${id}`),
};

export const containersAPI = {
  list: (params) => api.get('/containers', { params }),
  getById: (id) => api.get(`/containers/${id}`),
  create: (data) => api.post('/containers', data),
  update: (id, data) => api.put(`/containers/${id}`, data),
  addLine: (id, data) => api.post(`/containers/${id}/lines`, data),
  removeLine: (id, lineId) => api.delete(`/containers/${id}/lines/${lineId}`),
  receive: (id) => api.post(`/containers/${id}/receive`),
};

export const purchaseReceiptsAPI = {
  list: (params) => api.get('/purchase-receipts', { params }),
  getById: (id) => api.get(`/purchase-receipts/${id}`),
};

export const inventoryAPI = {
  list: (params) => api.get('/inventory', { params }),
  getByPartId: (partId) => api.get(`/inventory/${partId}`),
  adjust: (partId, data) => api.put(`/inventory/${partId}/adjust`, data),
  transactions: (params) => api.get('/inventory/transactions', { params }),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecent: () => api.get('/dashboard/recent'),
};

export const auditLogsAPI = {
  list: (params) => api.get('/audit-logs', { params }),
};

export default api;
