/**
 * lib/api.ts
 * Typed Axios API client for all backend requests.
 * Handles auth headers, base URL, and error normalization.
 * Import `apiClient` for all API calls — never use fetch/axios directly.
 */
import axios, { AxiosError, type AxiosInstance } from 'axios';
import { API_BASE_URL } from './constants';

/** Creates and configures the Axios instance */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15_000, // 15-second request timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor — attaches the correct JWT based on route
  instance.interceptors.request.use((config) => {
    // Only access localStorage in browser (not during SSR)
    if (typeof window !== 'undefined') {
      // Admin routes use the admin token; all other routes use the customer token
      const isAdminRoute = config.url?.startsWith('/admin');
      const token = isAdminRoute
        ? localStorage.getItem('admin_token')
        : localStorage.getItem('themagicscreen_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Response interceptor — normalizes errors to a consistent shape
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ error: { code: string; message: string } }>) => {
      // Extract the structured error from our API response if available
      const apiError = error.response?.data?.error;
      if (apiError) {
        // Attach the API error code to the error object for handling in hooks
        const enhanced = new Error(apiError.message) as Error & { code: string };
        enhanced.code = apiError.code;
        return Promise.reject(enhanced);
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

export const apiClient = createApiClient();
