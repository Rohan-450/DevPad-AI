import { QueryClient } from "@tanstack/react-query";

// Tuned for local SQLite queries — no network, no auto-refetch.
// Mutations explicitly invalidate keys to refresh lists.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});
