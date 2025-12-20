/**
 * Gift Cards hooks using TanStack Query
 */

import { giftCardsApi } from "@/services/api/giftcards";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const giftCardKeys = {
  all: ["giftcards"] as const,
  products: (countryCode: string) =>
    [...giftCardKeys.all, "products", countryCode] as const,
  codes: (transactionId: number) =>
    [...giftCardKeys.all, "codes", transactionId] as const,
};

/**
 * Hook to get gift card products
 */
export function useGiftCardProducts(countryCode: string = "US") {
  return useQuery({
    queryKey: giftCardKeys.products(countryCode),
    queryFn: () => giftCardsApi.getProducts(countryCode),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to buy gift card
 */
export function useBuyGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { product_id: string; quantity: string }) =>
      giftCardsApi.buyGiftCard(data),
    onSuccess: () => {
      // Invalidate wallets and transactions after purchase
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

/**
 * Hook to get gift card codes
 */
export function useGiftCardCodes(transactionId: number | null) {
  return useQuery({
    queryKey: giftCardKeys.codes(transactionId || 0),
    queryFn: () => giftCardsApi.getGiftCardCodes(transactionId!),
    enabled: transactionId !== null && transactionId > 0,
    retry: false,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (codes don't change)
  });
}

/**
 * Hook to sell gift card
 */
export function useSellGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      brand_name: string;
      card_currency: string;
      code: string;
      face_value: string;
      card_image?: string;
    }) => giftCardsApi.sellGiftCard(data),
    onSuccess: () => {
      // Invalidate wallets and transactions after sale
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
