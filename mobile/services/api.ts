import axios from 'axios';
import auth from '@react-native-firebase/auth';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Firebase token
api.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get Firebase token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          const token = await currentUser.getIdToken(true); // Force refresh
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch {
        // Force logout if token refresh fails
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// --- API helper functions ---
export const apiGet = <T>(url: string, params?: Record<string, unknown>) =>
  api.get<{ success: boolean; data: T; message: string }>(url, { params });

export const apiPost = <T>(url: string, data?: unknown) =>
  api.post<{ success: boolean; data: T; message: string }>(url, data);

export const apiPatch = <T>(url: string, data?: unknown) =>
  api.patch<{ success: boolean; data: T; message: string }>(url, data);

export const apiDelete = <T>(url: string) =>
  api.delete<{ success: boolean; data: T; message: string }>(url);
