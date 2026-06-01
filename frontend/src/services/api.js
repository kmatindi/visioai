import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('visioai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('visioai_token');
      localStorage.removeItem('visioai_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  demo: () => api.post('/auth/demo'),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  me: () => api.get('/users/me'),
  update: (data) => api.patch('/users/me', data),
  upgrade: (plan) => api.post('/users/upgrade', { plan }),
};

// ─── AI Director ──────────────────────────────────────────────────────────────
export const aiDirectorAPI = {
  enhance: (data) => api.post('/ai-director/enhance', data),
  suggest: (data) => api.post('/ai-director/suggest', data),
};

// ─── Video ────────────────────────────────────────────────────────────────────
export const videoAPI = {
  generate: (data) => api.post('/video/generate', data),
  status: (jobId) => api.get(`/video/status/${jobId}`),
  history: (params) => api.get('/video/history', { params }),
  delete: (jobId) => api.delete(`/video/${jobId}`),
};

// ─── Voice ────────────────────────────────────────────────────────────────────
export const voiceAPI = {
  voices: () => api.get('/voice/voices'),
  languages: () => api.get('/voice/languages'),
  generate: (data) => api.post('/voice/generate', data),
  dub: (data) => api.post('/voice/dub', data),
  clone: (data) => api.post('/voice/clone', data),
  cloneWithFile: (formData) => api.post('/voice/clone', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Music ────────────────────────────────────────────────────────────────────
export const musicAPI = {
  moods: () => api.get('/music/moods'),
  generate: (data) => api.post('/music/generate', data),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsAPI = {
  list: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportAPI = {
  platforms: () => api.get('/export/platforms'),
  render: (data) => api.post('/export/render', data),
};

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadAPI = {
  image: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  overview: () => api.get('/analytics/overview'),
};

// ─── Marketplace ──────────────────────────────────────────────────────────────
export const marketplaceAPI = {
  templates: (params) => api.get('/marketplace/templates', { params }),
  get: (id) => api.get(`/marketplace/templates/${id}`),
  purchase: (id) => api.post(`/marketplace/templates/${id}/purchase`),
};

export default api;
