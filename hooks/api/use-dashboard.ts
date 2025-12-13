/**
 * Dashboard hooks using TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api/dashboard";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  data: () => [...dashboardKeys.all, "data"] as const,
};

/**
 * Hook to get dashboard data
 */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: () => dashboardApi.getDashboard(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

