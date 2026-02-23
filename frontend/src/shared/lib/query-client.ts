import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 300_000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const queryKeys = {
  currentUser: ['currentUser'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  tasks: (projectId: string) => ['projects', projectId, 'tasks'] as const,
  task: (projectId: string, taskId: string) =>
    ['projects', projectId, 'tasks', taskId] as const,
};
