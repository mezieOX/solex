/**
 * React Query hooks for Account API
 */

import { useQuery } from "@tanstack/react-query";
import { accountApi } from "../../services/api/account";

export const accountKeys = {
  all: ["account"] as const,
  details: () => [...accountKeys.all, "details"] as const,
};

/**
 * Hook to get account details
 */
export function useAccountDetails() {
  return useQuery({
    queryKey: accountKeys.details(),
    queryFn: () => accountApi.getAccountDetails(),
  });
}

