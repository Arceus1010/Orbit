/**
 * Axios Instance Configuration
 *
 * This is the HTTP client that communicates with our FastAPI backend.
 * Think of it as a configured messenger that:
 * - Knows the backend URL
 * - Automatically attaches auth tokens
 * - Handles errors consistently
 */

import axios from 'axios';
import { getToken, removeToken } from './token';

const API_BASE_URL = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Request Interceptor
 *
 * Runs BEFORE every request is sent.
 * Automatically attaches the JWT token from localStorage.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 *
 * Runs AFTER every response is received.
 * Handles common error cases globally.
 */
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear the invalid token — ProtectedRoute handles the redirect
        removeToken();
      }

      if (error.response.status === 403) {
        console.warn('You do not have permission to access this resource.');
      }

      if (error.response.status >= 500) {
        console.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      console.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);
