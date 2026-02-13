import type { AxiosError } from 'axios';
import type { ApiError, ApiErrorDetail } from './auth.types';

const ERROR_MESSAGES: Record<string, string> = {
  'Incorrect email or password': 'The email or password you entered is incorrect.',
  'User already exists': 'An account with this email already exists.',
  'Could not validate credentials': 'Your session has expired. Please log in again.',
  'Not authenticated': 'You need to be logged in to access this page.',
  'value_error.email': 'Please enter a valid email address.',
  'value_error.str.min_length': 'Password must be at least 8 characters long.',
  'Network Error': 'Unable to connect to the server. Please check your internet connection.',
  'timeout': 'The request timed out. Please try again.',
};

export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;

  if (!axiosError.response) {
    if (axiosError.message === 'Network Error') {
      return ERROR_MESSAGES['Network Error'];
    }
    if (axiosError.code === 'ECONNABORTED') {
      return ERROR_MESSAGES['timeout'];
    }
    return 'Something went wrong. Please try again.';
  }

  const detail = axiosError.response.data?.detail;

  if (typeof detail === 'string') {
    return ERROR_MESSAGES[detail] || detail;
  }

  if (Array.isArray(detail)) {
    return formatValidationErrors(detail);
  }

  const status = axiosError.response.status;
  if (status === 401) {
    return 'The email or password you entered is incorrect.';
  }
  if (status === 403) {
    return 'You don\'t have permission to perform this action.';
  }
  if (status === 404) {
    return 'The requested resource was not found.';
  }
  if (status >= 500) {
    return 'A server error occurred. Please try again later.';
  }

  return 'Something went wrong. Please try again.';
}

function formatValidationErrors(errors: ApiErrorDetail[]): string {
  if (errors.length === 0) {
    return 'Validation failed. Please check your input.';
  }

  if (errors.length === 1) {
    const error = errors[0];
    const field = error.loc[error.loc.length - 1];
    const friendlyMessage = ERROR_MESSAGES[error.type];

    if (friendlyMessage) {
      return friendlyMessage;
    }

    return `${String(field)}: ${error.msg}`;
  }

  return errors
    .map((error) => {
      const field = error.loc[error.loc.length - 1];
      return `${String(field)}: ${error.msg}`;
    })
    .join('. ');
}

export function getFieldErrors(error: unknown): Record<string, string> {
  const axiosError = error as AxiosError<ApiError>;
  const detail = axiosError.response?.data?.detail;

  if (!Array.isArray(detail)) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};

  detail.forEach((error) => {
    const field = error.loc[error.loc.length - 1];
    const friendlyMessage = ERROR_MESSAGES[error.type] || error.msg;
    fieldErrors[String(field)] = friendlyMessage;
  });

  return fieldErrors;
}

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function validatePassword(password: string): PasswordRequirement[] {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: '1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: '1 lowercase letter', met: /[a-z]/.test(password) },
    { label: '1 number', met: /\d/.test(password) },
    { label: '1 special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
}

export function isPasswordValid(password: string): boolean {
  return validatePassword(password).every((req) => req.met);
}
