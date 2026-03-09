import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (username: string, password: string, fullName: string, email: string, phone: string, role: string, institution: string) =>
    api.post('/auth/register', { username, password, full_name: fullName, email, phone, role, institution }),
  login: (username: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
};

export const workspaces = {
  getAll: () => api.get('/workspaces'),
  create: (name: string) => api.post('/workspaces', { name }),
};

export const papers = {
  search: (query: string) => api.get(`/papers/search?query=${query}`),
  import: (paper: any, workspace_id: number) =>
    api.post('/papers/import', { ...paper, workspace_id }),
  getByWorkspace: (workspace_id: number) =>
    api.get(`/papers/workspace/${workspace_id}`),
  upload: (file: File, workspace_id: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspace_id', workspace_id.toString());
    return api.post('/papers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const chat = {
  send: (workspace_id: number, message: string) =>
    api.post('/chat', { workspace_id, message }),
  getHistory: (workspace_id: number) =>
    api.get(`/chat/history/${workspace_id}`),
  clearHistory: (workspace_id: number) =>
    api.delete(`/chat/history/${workspace_id}`),
};

export default api;
