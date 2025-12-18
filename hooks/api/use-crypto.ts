/**
 * Crypto hooks using TanStack Query
 */

import { cryptoApi } from "@/services/api/crypto";
import { useMutation, useQuery } from "@tanstack/react-query";

// Query keys
export const cryptoKeys = {
  all: ["crypto"] as const,
  currencies: () => [...cryptoKeys.all, "currencies"] as const,
  exchangeRate: (from: string, to: string) =>
    [...cryptoKeys.all, "exchange-rate", from, to] as const,
  prices: (ids: string[]) => [...cryptoKeys.all, "prices", ids] as const,
};

// CoinGecko API types
export interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

/**
 * Hook to get crypto currencies
 */
export function useCryptoCurrencies() {
  return useQuery({
    queryKey: cryptoKeys.currencies(),
    queryFn: () => cryptoApi.getCurrencies(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get deposit address
 */
export function useCryptoDepositAddress(currencyId: number | null) {
  return useQuery({
    queryKey: [...cryptoKeys.all, "deposit-address", currencyId],
    queryFn: () => cryptoApi.getDepositAddress(currencyId!),
    enabled: currencyId !== null,
    retry: false,
  });
}

/**
 * Hook to get exchange rate
 */
export function useExchangeRate(from: string, to: string) {
  return useQuery({
    queryKey: cryptoKeys.exchangeRate(from, to),
    queryFn: () => cryptoApi.getExchangeRate(from, to),
    enabled: !!from && !!to,
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to swap crypto
 */
export function useSwapCrypto() {
  return useMutation({
    mutationFn: (data: {
      from: string;
      to: string;
      amount: string;
      wallet_address?: string;
    }) => cryptoApi.swap(data),
  });
}

/**
 * Hook to withdraw crypto
 */
export function useWithdrawCrypto() {
  return useMutation({
    mutationFn: (data: {
      wallet_id: number;
      address_to: string;
      amount: string;
      destination_tag?: string;
    }) => cryptoApi.withdraw(data),
  });
}

/**
 * Hook to get crypto prices from CoinGecko
 */
export function useCryptoPrices(
  ids: string[],
  vsCurrency: string = "usd",
  refetchInterval?: number
) {
  return useQuery({
    queryKey: cryptoKeys.prices(ids),
    queryFn: async (): Promise<CoinGeckoPrice[]> => {
      const idsParam = ids.join(",");
      // Use markets endpoint to get 24h change data
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?ids=${idsParam}&vs_currency=${vsCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch crypto prices");
      }

      const data = await response.json();
      // Transform CoinGecko response to our format
      return data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        current_price: coin.current_price || 0,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      }));
    },
    enabled: ids.length > 0,
    refetchInterval: refetchInterval || false,
    staleTime: 30 * 1000, // 30 seconds
  });
}
