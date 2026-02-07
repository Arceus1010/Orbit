/**
 * TanStack Query Configuration
 *
 * TanStack Query (React Query) is a data-fetching library that:
 * - Caches API responses automatically
 * - Refetches stale data in the background
 * - Handles loading/error states
 * - Prevents duplicate requests
 * - Provides optimistic updates
 *
 * Think of it as a smart cache + state manager for server data.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure the QueryClient
 *
 * The QueryClient manages all queries and mutations in your app.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * How long data is considered "fresh" (in milliseconds)
       * Fresh data won't be refetched automatically.
       *
       * 1 minute = 60,000ms
       * Adjust based on your data's change frequency.
       */
      staleTime: 60_000, // 1 minute

      /**
       * How long inactive data stays in cache (in milliseconds)
       * After this, unused data is garbage collected.
       *
       * 5 minutes = 300,000ms
       */
      gcTime: 300_000, // 5 minutes (formerly 'cacheTime' in v4)

      /**
       * Refetch data when window regains focus?
       * Useful for keeping data fresh when user returns to the tab.
       *
       * false = Don't refetch on window focus (less aggressive)
       */
      refetchOnWindowFocus: false,

      /**
       * Retry failed requests?
       * false = Don't retry (fail fast)
       * You can also set a number (e.g., 3) for retry attempts
       */
      retry: false,
    },

    mutations: {
      /**
       * Error handling for mutations (create/update/delete operations)
       * You can add global error handling here if needed
       */
      onError: (error) => {
        console.error('Mutation error:', error);
        // You could show a toast notification here
      },
    },
  },
});

/**
 * Query Keys
 *
 * Query keys are used to identify and cache queries.
 * Organize them here for consistency across the app.
 *
 * Why use constants?
 * - Prevents typos
 * - Easy to refactor
 * - Type-safe with TypeScript
 */
export const queryKeys = {
  // Auth queries
  currentUser: ['currentUser'] as const,

  // Project queries (to be implemented later)
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,

  // Task queries (to be implemented later)
  tasks: (projectId: string) => ['projects', projectId, 'tasks'] as const,
  task: (projectId: string, taskId: string) =>
    ['projects', projectId, 'tasks', taskId] as const,
};
