import { apiClient } from '@/shared/lib/axios';
import { getToken, setToken, removeToken } from '@/shared/lib/token';
import type { User, RegisterRequest, TokenResponse } from './auth.types';

export { getToken, setToken, removeToken };

export async function register(data: RegisterRequest): Promise<User> {
  const response = await apiClient.post<User>('/auth/register', data);
  return response.data;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await apiClient.post<TokenResponse>('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  setToken(response.data.access_token);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}

export function logout(): void {
  removeToken();
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
