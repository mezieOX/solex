/**
 * Wallet API endpoints
 */

import { apiClient } from "./client";
import { ApiResponse } from "./types";

export interface Wallet {
  id: number;
  type: "fiat" | "crypto";
  currency: string;
  provider: string;
  balance: number;
  external_address: string | null;
  image_url?: string | null;
  network?: string;
  meta: any;
  created_at: string;
  updated_at: string;
}

export interface Bank {
  id: number;
  code: string;
  name: string;
}

export interface ResolveAccountResponse {
  account_name: string;
  account_number: string;
}

export interface Transaction {
  id: number;
  name: string;
  date: string;
  amount: string;
  status: "Confirmed" | "Pending" | "Failed";
  reference?: string | number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface WithdrawResponse {
  reference: string;
  status: string;
}

export interface VirtualAccountResponse {
  bank_name: string;
  account_number: string;
  flw_ref: string;
  order_ref: string;
  account_status: string;
}

export interface DepositResponse {
  reference: string;
  flw_ref: string | null;
  status: string;
  amount: number;
  currency: string;
  payment_options: string;
  payment_link: string;
  payment: {
    link: string;
  };
}

export const walletApi = {
  /**
   * Get all wallets
   */
  getWallets: async (): Promise<Wallet[]> => {
    const response = await apiClient.get<ApiResponse<{ wallets: Wallet[] }>>(
      "/wallets/"
    );
    return response.data.wallets;
  },

  /**
   * Get wallet by ID
   */
  getWallet: async (id: string): Promise<Wallet> => {
    const response = await apiClient.get<ApiResponse<Wallet>>(`/wallets/${id}`);
    return response.data;
  },

  /**
   * Get transactions
   */
  getTransactions: async (params?: {
    wallet_type?: string | null;
    currency?: string | null;
    transaction_type?: string | null;
    direction?: string | null;
    status?: string | null;
    from_date?: string | null;
    to_date?: string | null;
    per_page?: number | null;
  }): Promise<TransactionsResponse> => {
    // Filter out null/undefined values to avoid API validation errors
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([_, value]) => value !== null && value !== undefined
          )
        )
      : undefined;

    const response = await apiClient.get<ApiResponse<TransactionsResponse>>(
      "/transactions",
      cleanParams
    );
    return response.data;
  },

  /**
   * Get transaction by ID
   */
  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(
      `/transactions/${id}`
    );
    return response.data;
  },

  /**
   * Get list of banks
   */
  getBanks: async (): Promise<Bank[]> => {
    const response = await apiClient.get<ApiResponse<Bank[]>>(
      "/wallets/fiat/banks"
    );
    return response.data;
  },

  /**
   * Resolve bank account
   */
  resolveAccount: async (data: {
    account_number: string;
    bank_code: string;
  }): Promise<ResolveAccountResponse> => {
    const formData = new FormData();
    formData.append("account_number", data.account_number);
    formData.append("bank_code", data.bank_code);

    const response = await apiClient.post<ApiResponse<ResolveAccountResponse>>(
      "/wallets/fiat/resolve-account",
      formData
    );
    return response.data;
  },

  /**
   * Withdraw fiat funds
   */
  withdrawFiat: async (data: {
    amount: string;
    bank_code: string;
    account_number: string;
    account_name: string;
  }): Promise<WithdrawResponse> => {
    const formData = new FormData();
    formData.append("amount", data.amount);
    formData.append("bank_code", data.bank_code);
    formData.append("account_number", data.account_number);
    formData.append("account_name", data.account_name);

    const response = await apiClient.post<ApiResponse<WithdrawResponse>>(
      "/wallets/fiat/withdraw",
      formData
    );
    return response.data;
  },

  /**
   * Generate virtual account for deposit
   */
  generateVirtualAccount: async (
    nin: string
  ): Promise<VirtualAccountResponse> => {
    const formData = new FormData();
    formData.append("nin", nin);

    const response = await apiClient.post<ApiResponse<VirtualAccountResponse>>(
      "/account/virtual-account",
      formData
    );
    return response.data;
  },

  /**
   * Initiate Flutterwave deposit
   */
  initiateDeposit: async (
    amount: string,
    redirectUrl: string
  ): Promise<DepositResponse> => {
    if (!redirectUrl || redirectUrl.trim() === "") {
      throw new Error("Redirect URL is required");
    }

    const formData = new FormData();
    // Ensure amount is sent as a string (in kobo format)
    formData.append("amount", String(amount));

    // Add redirect_url (required by API)
    // Using the exact field name the API expects
    formData.append("redirect_url", redirectUrl.trim());

    const response = await apiClient.post<ApiResponse<DepositResponse>>(
      "/wallets/fiat/deposit",
      formData
    );
    return response.data;
  },
};
