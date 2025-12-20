/**
 * Crypto Trades API endpoints
 */

import { apiClient } from "./client";
import { ApiResponse } from "./types";

export interface CryptoBuyRequest {
  currency_id: string;
  amount_ngn: string;
}

export interface CryptoSellRequest {
  currency_id: string;
  amount_crypto: string;
}

export interface CryptoSwapRequest {
  from: string;
  to: string;
  amount: string;
}

export interface CryptoBuyResponse {
  crypto_currency_id: number;
  symbol: string;
  network: string;
  amount_crypto: number;
  amount_ngn: number;
  rate_ngn_per_crypto: number;
  rate_usd_per_crypto: number;
  rate_usd_ngn: number;
  wallet_id: number;
}

export interface CryptoSellResponse {
  crypto_currency_id: number;
  symbol: string;
  network: string;
  amount_crypto: number;
  amount_ngn: number;
  rate_ngn_per_crypto: number;
  rate_usd_per_crypto: number;
  rate_usd_ngn: number;
  wallet_id: number;
}

export interface CryptoSwapResponse {
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

export const cryptoTradesApi = {
  /**
   * Buy crypto with NGN
   */
  buyCrypto: async (data: CryptoBuyRequest): Promise<CryptoBuyResponse> => {
    const formData = new FormData();
    formData.append("currency_id", data.currency_id);
    formData.append("amount_ngn", data.amount_ngn);

    const response = await apiClient.post<ApiResponse<CryptoBuyResponse>>(
      "/trades/crypto/buy",
      formData
    );
    return response.data;
  },

  /**
   * Sell crypto for NGN
   */
  sellCrypto: async (data: CryptoSellRequest): Promise<CryptoSellResponse> => {
    const formData = new FormData();
    formData.append("currency_id", data.currency_id);
    formData.append("amount_crypto", data.amount_crypto);

    const response = await apiClient.post<ApiResponse<CryptoSellResponse>>(
      "/trades/crypto/sell",
      formData
    );
    return response.data;
  },

  /**
   * Swap crypto
   */
  swapCrypto: async (data: CryptoSwapRequest): Promise<CryptoSwapResponse> => {
    const response = await apiClient.post<ApiResponse<CryptoSwapResponse>>(
      "/trades/swap",
      data
    );
    return response.data;
  },
};
