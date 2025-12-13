/**
 * Wallet hooks using TanStack Query
 */

import { walletApi } from "@/services/api/wallet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const walletKeys = {
  all: ["wallet"] as const,
  wallets: () => [...walletKeys.all, "wallets"] as const,
  banks: () => [...walletKeys.all, "banks"] as const,
  transactions: (params?: any) =>
    [...walletKeys.all, "transactions", params] as const,
  resolveAccount: (accountNumber: string, bankCode: string) =>
    [...walletKeys.all, "resolveAccount", accountNumber, bankCode] as const,
};

/**
 * Hook to get all wallets
 */
export function useWallets() {
  return useQuery({
    queryKey: walletKeys.wallets(),
    queryFn: () => walletApi.getWallets(),
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get transactions
 */
export function useTransactions(params?: {
  wallet_type?: string | null;
  currency?: string | null;
  transaction_type?: string | null;
  direction?: string | null;
  status?: string | null;
  from_date?: string | null;
  to_date?: string | null;
  per_page?: number | null;
}) {
  return useQuery({
    queryKey: walletKeys.transactions(params),
    queryFn: () => walletApi.getTransactions(params),
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get banks
 */
export function useBanks() {
  return useQuery({
    queryKey: walletKeys.banks(),
    queryFn: () => walletApi.getBanks(),
    retry: false,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (banks don't change often)
  });
}

/**
 * Hook to resolve account
 */
export function useResolveAccount() {
  return useMutation({
    mutationFn: (data: { account_number: string; bank_code: string }) =>
      walletApi.resolveAccount(data),
  });
}

/**
 * Hook to resolve account (query version - auto-fetches when enabled)
 */
export function useResolveAccountQuery(
  accountNumber: string,
  bankCode: string,
  enabled: boolean = false
) {
  return useQuery({
    queryKey: walletKeys.resolveAccount(accountNumber, bankCode),
    queryFn: () =>
      walletApi.resolveAccount({
        account_number: accountNumber,
        bank_code: bankCode,
      }),
    enabled: enabled && accountNumber.length === 10 && !!bankCode,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to withdraw fiat
 */
export function useWithdrawFiat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      amount: string;
      bank_code: string;
      account_number: string;
      account_name: string;
    }) => walletApi.withdrawFiat(data),
    onSuccess: () => {
      // Invalidate wallets and transactions
      queryClient.invalidateQueries({ queryKey: walletKeys.wallets() });
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions() });
    },
  });
}

/**
 * Hook to generate virtual account
 */
export function useGenerateVirtualAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nin: string) => walletApi.generateVirtualAccount(nin),
    onSuccess: () => {
      // Invalidate wallets after generating account
      queryClient.invalidateQueries({ queryKey: walletKeys.wallets() });
    },
  });
}

/**
 * Hook to initiate Flutterwave deposit
 */
export function useInitiateDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { amount: string; redirectUrl: string }) =>
      walletApi.initiateDeposit(data.amount, data.redirectUrl),
    onSuccess: () => {
      // Invalidate wallets and transactions after deposit
      queryClient.invalidateQueries({ queryKey: walletKeys.wallets() });
      queryClient.invalidateQueries({ queryKey: walletKeys.transactions() });
    },
  });
}
