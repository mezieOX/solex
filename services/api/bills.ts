/**
 * Bills API endpoints
 */

import { apiClient } from "./client";
import { ApiResponse } from "./types";

export interface BillCategory {
  id: number;
  name: string;
  code: string;
  description: string;
  country_code: string;
}

export interface Biller {
  id: number;
  name: string;
  logo: string | null;
  description: string;
  short_name: string;
  biller_code: string;
  country_code: string;
}

export interface BillersResponse {
  category: string;
  country: string;
  billers: Biller[];
}

export interface BillItem {
  id: number;
  name: string;
  code: string;
  amount: number;
  currency: string;
  biller_name?: string;
}

export interface BillItemsResponse {
  biller_code: string;
  items: BillItem[];
}

export interface ValidateCustomerResponse {
  customer_name: string;
  customer: string;
  biller_code: string;
  item_code: string;
}

export interface BillPaymentRequest {
  category: string;
  biller_code: string;
  item_code: string;
  customer: string;
  amount: string;
}

export interface FlutterwaveBillPayment {
  phone_number: string;
  amount: number;
  network: string;
  flw_ref: string;
  reference: string;
}

export interface BillPaymentResponse {
  wallet_balance: string;
  reference: string;
  flutterwave: FlutterwaveBillPayment;
}

export const billsApi = {
  /**
   * Get all bill categories
   */
  getCategories: async (): Promise<BillCategory[]> => {
    const response = await apiClient.get<ApiResponse<BillCategory[]>>(
      "/bills/categories"
    );
    return response.data;
  },

  /**
   * Get billers for a category
   */
  getBillers: async (category: string): Promise<BillersResponse> => {
    const response = await apiClient.get<ApiResponse<BillersResponse>>(
      "/bills/billers",
      { category }
    );
    return response.data;
  },

  /**
   * Get bill items for a biller
   */
  getBillItems: async (biller_code: string): Promise<BillItemsResponse> => {
    const response = await apiClient.get<ApiResponse<BillItemsResponse>>(
      "/bills/items",
      { biller_code }
    );
    return response.data;
  },

  /**
   * Validate customer
   */
  validateCustomer: async (data: {
    biller_code: string;
    item_code: string;
    customer: string;
  }): Promise<ValidateCustomerResponse> => {
    const formData = new FormData();
    formData.append("biller_code", data.biller_code);
    formData.append("item_code", data.item_code);
    formData.append("customer", data.customer);

    const response = await apiClient.post<
      ApiResponse<ValidateCustomerResponse>
    >("/bills/validate-customer", formData);
    return response.data;
  },

  /**
   * Pay bill
   */
  payBill: async (data: BillPaymentRequest): Promise<BillPaymentResponse> => {
    const formData = new FormData();
    formData.append("category", data.category);
    formData.append("biller_code", data.biller_code);
    formData.append("item_code", data.item_code);
    formData.append("customer", data.customer);
    formData.append("amount", data.amount);

    const response = await apiClient.post<ApiResponse<BillPaymentResponse>>(
      "/bills/pay",
      formData
    );
    return response.data;
  },
};
