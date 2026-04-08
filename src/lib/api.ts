import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Accessing the api base URL. The Next.js dev server runs on 3000, backend on 5000
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add the bearer token from the zustand store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if access is denied/invalid token
      const auth = useAuthStore.getState();
      if (auth.token) {
        auth.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
