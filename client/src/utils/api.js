import axios from 'axios';

// All API calls go through this one axios instance
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Attach the login token (if the visitor is signed in) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('se_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any error into a friendly message string
export const errMsg = (e) =>
  e?.response?.data?.message || (e?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running?' : e?.message || 'Something went wrong');

export default api;
