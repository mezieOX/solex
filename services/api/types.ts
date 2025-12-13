/**
 * API Response Types
 * Define types for API responses
 */

export interface ApiResponse<T> {
  status: "success" | "error";
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  avatar?: string;
  va_account_number?: string;
  va_account_name?: string;
  va_bank_name?: string;
}

// Wallet Types
export interface Wallet {
  id: string;
  type: "crypto" | "fiat";
  currency: string;
  balance: string;
  address?: string;
}

export interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: string;
  currency: string;
  title: string;
  description?: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  icon?: {
    name: string;
    color: string;
    backgroundColor: string;
  };
}

// Crypto Types
export interface CryptoCurrency {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change: string;
  icon?: string;
  color?: string;
}

// Exchange Types
export interface ExchangeRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  type: "crypto" | "giftcard";
}

export interface ExchangeResponse {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  rate: string;
  estimatedAmount: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}
