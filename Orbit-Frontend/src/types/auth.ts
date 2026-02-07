/**
 * Authentication Types
 *
 * These types mirror the Pydantic schemas in the backend.
 * They ensure type safety between frontend and backend.
 *
 * Backend location: Orbit-Backend/app/schemas/user.py
 */

/**
 * User object returned from the API
 * Matches the UserResponse schema in backend
 */
export interface User {
  id: string; // UUID as string
  email: string;
  full_name: string | null;
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
}

/**
 * Data required to register a new user
 * Matches the UserCreate schema in backend
 */
export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string | null; // Optional field
}

/**
 * Data required to log in
 * FastAPI OAuth2PasswordRequestForm expects 'username' and 'password'
 * But we're using email as username
 */
export interface LoginRequest {
  username: string; // Actually the email
  password: string;
}

/**
 * Token response from login endpoint
 * Matches the Token schema in backend
 */
export interface TokenResponse {
  access_token: string;
  token_type: string; // Always "bearer"
}

/**
 * Error response from the API
 * FastAPI returns errors in this format
 */
export interface ApiError {
  detail: string | ApiErrorDetail[];
}

/**
 * Detailed validation error (from Pydantic)
 */
export interface ApiErrorDetail {
  loc: (string | number)[]; // Location of the error (e.g., ["body", "email"])
  msg: string; // Error message
  type: string; // Error type (e.g., "value_error.email")
}
