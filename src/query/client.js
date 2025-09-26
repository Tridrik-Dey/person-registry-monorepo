import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // sensible UX defaults
      retry: 2,
      staleTime: 60 * 1000,   // 1 min fresh
      gcTime: 5 * 60 * 1000,  // 5 min cache
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 0
    }
  }
});

export default queryClient;
