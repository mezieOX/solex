/**
 * Gift Cards hooks using TanStack Query
 */

import { giftCardsApi } from "@/services/api/giftcards";
import { useMutation, useQuery } from "@tanstack/react-query";

// Query keys
export const giftCardKeys = {
  all: ["giftcards"] as const,
  products: (countryCode: string) =>
    [...giftCardKeys.all, "products", countryCode] as const,
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
 * Hook to sell gift card
 */
export function useSellGiftCard() {
  return useMutation({
    mutationFn: (data: {
      brand_name: string;
      card_currency: string;
      code: string;
      card_image?: string;
    }) => giftCardsApi.sellGiftCard(data),
  });
}

