/**
 * Crypto Trades hooks using TanStack Query
 */

import { cryptoTradesApi } from "@/services/api/crypto-trades";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to buy crypto
 */
export function useBuyCrypto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { currency_id: string; amount_ngn: string }) =>
      cryptoTradesApi.buyCrypto(data),
    onSuccess: () => {
      // Invalidate wallets and transactions after purchase
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

/**
 * Hook to sell crypto
 */
export function useSellCrypto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { currency_id: string; amount_crypto: string }) =>
      cryptoTradesApi.sellCrypto(data),
    onSuccess: () => {
      // Invalidate wallets and transactions after sale
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

/**
 * Hook to swap crypto
 */
export function useSwapCryptoTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { from: string; to: string; amount: string }) =>
      cryptoTradesApi.swapCrypto(data),
    onSuccess: () => {
      // Invalidate wallets and transactions after swap
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
