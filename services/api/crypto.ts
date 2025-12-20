/**
 * Crypto API endpoints
 */

import { apiClient } from "./client";
import { ApiResponse } from "./types";

export interface CryptoCurrency {
  currency_id: number;
  name: string;
  coin: string; // This is the symbol
  rate_usd: number;
  min_deposit: string | number | null;
  fee_network: string | number | null;
  image_url?: string;
  network?: string;
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

export interface CryptoWithdrawRequest {
  wallet_id: number;
  address_to: string;
  destination_tag?: string;
  amount: string;
}

export interface CryptoWithdrawResponse {
  status: string;
  reference?: string;
  [key: string]: any;
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

export interface WithdrawFeesRequest {
  wallet_id: number;
  address_to: string;
  amount: string;
}

export interface WithdrawFeesResponse {
  amount_requested: number;
  amount_receive: number;
  amount_debited: number;
  fee_network: number;
  fee_service: number;
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
   * Withdraw crypto
   */
  withdraw: async (
    data: CryptoWithdrawRequest
  ): Promise<CryptoWithdrawResponse> => {
    const formData = new FormData();
    formData.append("wallet_id", String(data.wallet_id));
    formData.append("address_to", data.address_to);
    formData.append("amount", data.amount);
    if (data.destination_tag !== undefined) {
      formData.append("destination_tag", data.destination_tag);
    }

    const response = await apiClient.post<ApiResponse<CryptoWithdrawResponse>>(
      "/wallets/crypto/withdraw",
      formData
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

  /**
   * Get withdrawal fees
   */
  getWithdrawFees: async (
    data: WithdrawFeesRequest
  ): Promise<WithdrawFeesResponse> => {
    const formData = new FormData();
    formData.append("wallet_id", String(data.wallet_id));
    formData.append("address_to", data.address_to);
    formData.append("amount", data.amount);

    const response = await apiClient.post<
      ApiResponse<WithdrawFeesResponse>
    >("/wallets/crypto/withdraw/fees", formData);
    return response.data;
  },
};
