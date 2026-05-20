import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH ENDPOINTS
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// USER ENDPOINTS
export const userAPI = {
  getProfile: () => api.get('/user/me'),
};

// TASK ENDPOINTS
export const taskAPI = {
  createTask: (title: string, description: string, category: string, xpReward: number, priority: string) =>
    api.post('/tasks', { title, description, category, xpReward, priority }),
  getTasks: () => api.get('/tasks'),
  completeTask: (taskId: string) => api.put(`/tasks/${taskId}/complete`),
  deleteTask: (taskId: string) => api.delete(`/tasks/${taskId}`),
};

export default api;
