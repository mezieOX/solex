/**
 * React Query hooks for Account API
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "../../services/api/account";
import { authKeys } from "./use-auth";

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

/**
 * Hook to generate virtual account
 */
export function useGenerateVirtualAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nin: string) => accountApi.generateVirtualAccount(nin),
    onSuccess: () => {
      // Invalidate account details to refetch updated user data
      queryClient.invalidateQueries({ queryKey: accountKeys.details() });
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}
