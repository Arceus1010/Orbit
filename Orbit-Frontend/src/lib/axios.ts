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

// Base URL for all API requests
// In production, this would come from environment variables
const API_BASE_URL = 'http://localhost:8000';

// Create the axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout after 10 seconds
  timeout: 10000,
});

/**
 * Request Interceptor
 *
 * This runs BEFORE every request is sent.
 * We use it to automatically attach the JWT token from localStorage.
 *
 * Why? So you don't have to manually add the token to every API call!
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('access_token');

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors (rare, but possible)
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 *
 * This runs AFTER every response is received.
 * We use it to handle common error cases globally.
 *
 * Why? Centralized error handling = cleaner code everywhere else!
 */
apiClient.interceptors.response.use(
  // Success case - just return the response
  (response) => response,

  // Error case - handle common scenarios
  (error) => {
    if (error.response) {
      // Server responded with an error status code

      // 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        // Clear the invalid token
        localStorage.removeItem('access_token');

        // Redirect to login (we'll implement this later with React Router)
        // For now, just log it
        console.warn('Authentication failed. Please log in again.');
      }

      // 403 Forbidden - user doesn't have permission
      if (error.response.status === 403) {
        console.warn('You do not have permission to access this resource.');
      }

      // 500 Server Error
      if (error.response.status >= 500) {
        console.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('Network error. Please check your connection.');
    }

    // Always reject so the caller can handle specific errors
    return Promise.reject(error);
  }
);
