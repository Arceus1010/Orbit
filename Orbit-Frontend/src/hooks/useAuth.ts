/**
 * Authentication Hooks
 *
 * Custom React hooks for authentication operations.
 * These hooks connect our auth service to TanStack Query,
 * providing a clean API for components.
 *
 * Why use hooks?
 * - Encapsulate logic (reusable across components)
 * - Handle loading/error states automatically
 * - Type-safe with TypeScript
 * - Follow React best practices
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  register,
  login,
  getCurrentUser,
  logout as logoutService,
  isAuthenticated,
} from '../services/authService';
import { queryKeys } from '../lib/queryClient';
import type { User } from '../types/auth';

/**
 * Hook: useRegister
 *
 * Handles user registration.
 *
 * Usage in a component:
 * ```tsx
 * const { mutate: registerUser, isPending, error } = useRegister();
 *
 * const handleSubmit = (data) => {
 *   registerUser(data, {
 *     onSuccess: (user) => {
 *       console.log('Registered!', user);
 *       navigate('/login');
 *     }
 *   });
 * };
 * ```
 *
 * @returns Mutation object with mutate function, loading state, and error
 */
export function useRegister() {
  return useMutation({
    mutationFn: register,
    // You can add global onSuccess/onError handlers here
    onSuccess: (user) => {
      console.log('User registered successfully:', user.email);
    },
  });
}

/**
 * Hook: useLogin
 *
 * Handles user login and automatically fetches user data on success.
 *
 * Usage:
 * ```tsx
 * const { mutate: loginUser, isPending, error } = useLogin();
 *
 * const handleLogin = (email, password) => {
 *   loginUser({ email, password }, {
 *     onSuccess: () => {
 *       navigate('/dashboard');
 *     }
 *   });
 * };
 * ```
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),

    // On successful login, fetch the current user data
    onSuccess: async () => {
      // Invalidate and refetch the current user query
      // This ensures we have fresh user data immediately after login
      await queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

/**
 * Hook: useLogout
 *
 * Handles user logout and clears cached data.
 *
 * Usage:
 * ```tsx
 * const logout = useLogout();
 *
 * <button onClick={logout}>Log out</button>
 * ```
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    // Call the logout service (removes token from localStorage)
    logoutService();

    // Clear all cached queries
    // This prevents old user data from showing after logout
    queryClient.clear();

    // You could also redirect here:
    // navigate('/login');
  };
}

/**
 * Hook: useCurrentUser
 *
 * Fetches the current authenticated user's data.
 * This query only runs if the user is authenticated.
 *
 * Usage:
 * ```tsx
 * const { data: user, isLoading, error } = useCurrentUser();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <div>Error loading user</div>;
 *
 * return <div>Hello, {user.full_name}!</div>;
 * ```
 *
 * @returns Query object with user data, loading state, and error
 */
export function useCurrentUser() {
  return useQuery<User>({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
    // Only run this query if the user is authenticated
    // This prevents unnecessary 401 errors on the login page
    enabled: isAuthenticated(),
    // Don't retry on failure (if 401, the user just isn't logged in)
    retry: false,
  });
}

/**
 * Hook: useIsAuthenticated
 *
 * Simple hook to check if a user is logged in.
 * This is a client-side check (just checks for token in localStorage).
 *
 * Usage:
 * ```tsx
 * const isLoggedIn = useIsAuthenticated();
 *
 * return isLoggedIn ? <Dashboard /> : <Login />;
 * ```
 *
 * Note: This doesn't verify the token is valid.
 * Use `useCurrentUser` if you need to verify with the server.
 */
export function useIsAuthenticated(): boolean {
  return isAuthenticated();
}
