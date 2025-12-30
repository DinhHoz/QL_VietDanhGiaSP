import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// --- NEW: helper để chuyển đường dẫn ảnh lưu ở DB thành URL đầy đủ ---
export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

export const getImageUrl = (path) => {
  if (!path) return '';
  // nếu path đã là URL đầy đủ thì return luôn
  if (path.startsWith('http')) return path;
  return `http://localhost:4000${path}`;
};
export default api;
