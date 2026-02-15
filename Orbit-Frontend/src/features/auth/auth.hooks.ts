import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  register,
  login,
  getCurrentUser,
  logout as logoutService,
  isAuthenticated,
} from './auth.service';
import { queryKeys } from '@/shared/lib/query-client';
import type { User } from './auth.types';

export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      logoutService();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
    enabled: isAuthenticated(),
    retry: false,
  });
}
