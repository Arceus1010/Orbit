/**
 * Authentication Service
 *
 * This service handles all authentication-related API calls.
 * It's separated from the React components to keep logic reusable and testable.
 *
 * Think of this as the "business logic" layer for auth.
 */

import { apiClient } from '../lib/axios';
import { getToken, setToken, removeToken } from '../lib/token';
import type {
  User,
  RegisterRequest,
  TokenResponse,
} from '../types/auth';

// Re-export token helpers so existing imports from this file still work
export { getToken, setToken, removeToken };

/**
 * Register a new user
 *
 * @param data - User registration data (email, password, optional full_name)
 * @returns The created user object
 * @throws Error if registration fails (e.g., email already exists)
 */
export async function register(data: RegisterRequest): Promise<User> {
  const response = await apiClient.post<User>('/auth/register', data);
  return response.data;
}

/**
 * Log in an existing user
 *
 * FastAPI's OAuth2PasswordRequestForm expects form data (not JSON).
 * So we need to send data as application/x-www-form-urlencoded.
 *
 * @param email - User's email
 * @param password - User's password
 * @returns Token response with access_token
 */
export async function login(email: string, password: string): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email); // OAuth2 calls it 'username', but we use email
  formData.append('password', password);

  const response = await apiClient.post<TokenResponse>('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  setToken(response.data.access_token);

  return response.data;
}

/**
 * Get the current authenticated user's information
 *
 * This endpoint requires authentication (JWT token in header).
 * The axios interceptor automatically adds the token.
 *
 * @returns Current user object
 * @throws Error if not authenticated or token is invalid
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}

/**
 * Log out the current user
 *
 * Client-side only — removes the token from localStorage.
 * The useLogout hook handles clearing the query cache and redirecting.
 */
export function logout(): void {
  removeToken();
}

/**
 * Check if a user is currently logged in
 *
 * @returns true if a token exists in localStorage
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}
