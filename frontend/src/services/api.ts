import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // Fallback para localhost caso a variável não esteja definida
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  } catch (error) {
    console.error('Error reading auth token:', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const tagsApi = {
  getAll: () => api.get('/tags'),
  getById: (id: string) => api.get(`/tags/${id}`),
  create: (data: Record<string, unknown>) => api.post('/tags', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
  bulkCreate: (data: any[]) => api.post('/tags/bulk', data),
  getPositions: (id: string, limit?: number) =>
    api.get(`/tags/${id}/positions`, { params: { limit } }),
};

export const syncApi = {
  manualSync: () => api.post('/sync'),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: {
    syncInterval?: number;
    brgpsBaseUrl?: string;
    brgpsToken?: string;
    traccarUrl?: string;
    traccarToken?: string;
  }) => api.put('/settings', data),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  changePassword: (id: string, password: string) =>
    api.patch(`/users/${id}/password`, { password }),
};
