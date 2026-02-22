/**
 * Auth types matching backend Pydantic schemas (backend/app/schemas/user.py)
 */

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string | ApiErrorDetail[];
}

export interface ApiErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}
