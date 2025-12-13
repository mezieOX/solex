/**
 * Crypto API endpoints
 */

import { apiClient } from "./client";
import { ApiResponse } from "./types";

export interface CryptoCurrency {
  id: number;
  name: string;
  symbol: string;
  rate_usd: number;
  min_deposit: string | null;
  fee_network: string | null;
}

export interface CryptoCurrenciesResponse {
  networks: {
    [networkName: string]: CryptoCurrency[];
  };
}

export interface CryptoDepositAddressResponse {
  address: string;
  qr_code?: string;
  minimum_deposit?: string;
  confirmations_required?: number;
}

export interface ExchangeRateResponse {
  pair: string;
  from: string;
  to: string;
  rate_ngn_per_1: number;
  rate_usd_per_1: number;
  rate_usd_ngn: number;
  inverse_rate_crypto: number;
}

export interface SwapRequest {
  from: string;
  to: string;
  amount: string;
  wallet_address?: string;
}

export interface SwapResponse {
  transaction_id: number;
  from_amount: string;
  to_amount: string;
  exchange_rate: string;
  fees?: {
    network_fee?: string;
    service_fee?: string;
    total_fee?: string;
  };
  status: string;
}

export const cryptoApi = {
  /**
   * Get all crypto currencies grouped by network
   */
  getCurrencies: async (): Promise<CryptoCurrenciesResponse> => {
    const response = await apiClient.get<ApiResponse<CryptoCurrenciesResponse>>(
      "/wallets/crypto/currencies"
    );
    return response.data;
  },

  /**
   * Get deposit address for a crypto currency
   */
  getDepositAddress: async (
    currencyId: number
  ): Promise<CryptoDepositAddressResponse> => {
    const response = await apiClient.get<
      ApiResponse<CryptoDepositAddressResponse>
    >("/wallets/crypto/address", { currency_id: currencyId });
    return response.data;
  },

  /**
   * Get exchange rate
   */
  getExchangeRate: async (
    from: string,
    to: string
  ): Promise<ExchangeRateResponse> => {
    const response = await apiClient.get<ApiResponse<ExchangeRateResponse>>(
      "/wallets/crypto/exchange-rate",
      { from, to }
    );
    return response.data;
  },

  /**
   * Swap crypto to fiat or fiat to crypto
   */
  swap: async (data: SwapRequest): Promise<SwapResponse> => {
    const response = await apiClient.post<ApiResponse<SwapResponse>>(
      "/trades/swap",
      data
    );
    return response.data;
  },
};
