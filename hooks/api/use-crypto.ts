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
  exchangeRateByCurrencyId: (
    currencyId: number,
    toCurrencyId: number | null | undefined | string,
    direction: string,
    amount: number
  ) =>
    [
      ...cryptoKeys.all,
      "exchange-rate-by-currency-id",
      currencyId,
      toCurrencyId,
      direction,
      amount,
    ] as const,
  prices: (ids: string[]) => [...cryptoKeys.all, "prices", ids] as const,
  withdrawFees: (walletId: number, address: string, amount: string) =>
    [...cryptoKeys.all, "withdraw-fees", walletId, address, amount] as const,
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
    staleTime: 1 * 1000, // 1 second
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
    staleTime: 1 * 1000, // 1 second
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
    staleTime: 1 * 1000, // 1 second
  });
}

/**
 * Hook to get exchange rate by currency ID
 */
export function useExchangeRateByCurrencyId(
  currencyId: number,
  toCurrencyId: number | null | undefined,
  direction: string,
  amount: number
) {
  return useQuery({
    queryKey: cryptoKeys.exchangeRateByCurrencyId(
      currencyId || 0,
      toCurrencyId,
      direction,
      amount
    ),
    queryFn: () => {
      return cryptoApi.getExchangeRateByCurrencyId({
        currency_id: currencyId!,
        ...(direction === "swap" && toCurrencyId
          ? { to_currency_id: toCurrencyId }
          : {}),
        direction,
        amount,
      });
    },
    enabled:
      !!direction &&
      !!currencyId &&
      amount > 0 &&
      (direction !== "swap" || !!toCurrencyId),
    retry: false,
    staleTime: 0, // Always refetch when amount changes for real-time updates
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
      currency_id?: number;
      address_to: string;
      amount: string;
      destination_tag?: string;
    }) => cryptoApi.withdraw(data),
  });
}

/**
 * Hook to get withdrawal fees
 */
export function useWithdrawFees(
  currencyId: number | null,
  address: string,
  amount: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: cryptoKeys.withdrawFees(currencyId || 0, address, amount),
    queryFn: () =>
      cryptoApi.getWithdrawFees({
        currency_id: currencyId!,
        address_to: address,
        amount: amount,
      }),
    enabled:
      enabled &&
      currencyId !== null &&
      address.trim().length > 0 &&
      amount.trim().length > 0 &&
      !isNaN(parseFloat(amount)) &&
      parseFloat(amount) > 0,
    retry: false,
    staleTime: 1 * 1000, // 1 second
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
    staleTime: 1 * 1000, // 1 second
  });
}
