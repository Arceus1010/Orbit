/**
 * JWT Token Management
 *
 * Centralized token storage helpers used by both the Axios interceptor
 * and the auth service. Kept in a separate file to avoid circular imports
 * (authService imports apiClient, so axios.ts cannot import authService).
 */

const TOKEN_KEY = 'access_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
