/**
 * Authentication Service
 *
 * This service handles all authentication-related API calls.
 * It's separated from the React components to keep logic reusable and testable.
 *
 * Think of this as the "business logic" layer for auth.
 */

import { apiClient } from '../lib/axios';
import type {
  User,
  RegisterRequest,
  TokenResponse,
} from '../types/auth';

/**
 * LocalStorage key for storing the JWT token
 * Prefixed to avoid collisions with other apps
 */
const TOKEN_KEY = 'access_token';

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
  // Create form data (OAuth2 expects this format)
  const formData = new URLSearchParams();
  formData.append('username', email); // OAuth2 calls it 'username', but we use email
  formData.append('password', password);

  const response = await apiClient.post<TokenResponse>('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  // Store the token in localStorage for future requests
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
 * This is a client-side operation - we just remove the token.
 * JWTs are stateless, so there's no server-side logout endpoint.
 */
export function logout(): void {
  removeToken();
  // In a real app, you might also want to:
  // - Clear TanStack Query cache
  // - Redirect to login page
  // - Clear any other user-specific data
}

/**
 * Check if a user is currently logged in
 *
 * @returns true if a token exists in localStorage
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// ==================== Token Management ====================
// These functions handle localStorage operations for the JWT token

/**
 * Store the JWT token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get the JWT token from localStorage
 *
 * @returns The token string, or null if not found
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove the JWT token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
