/**
 * Gift Cards API endpoints
 */

import { apiClient } from "./client";
import { ApiResponse } from "./types";

export interface GiftCardProduct {
  id: number;
  name: string;
  brand: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  country: {
    code: string;
    name: string;
    flag: string;
  };
  logo: string;
  status: string;
  global: boolean;
  denomination_type: "RANGE" | "FIXED";
  recipient_currency: string;
  sender_currency: string;
  min_recipient_amount: number;
  max_recipient_amount: number;
  min_sender_amount_ngn: number;
  max_sender_amount_ngn: number;
  rate_recipient_to_sender: number;
  sender_fee_ngn: number;
  discount_percentage: number;
  supports_preorder: boolean;
  redeem: {
    concise: string;
  };
}

export interface GiftCardProductsResponse {
  country: string;
  products: GiftCardProduct[];
}

export interface SellGiftCardRequest {
  brand_name: string;
  card_currency: string;
  code: string;
  card_image?: string;
}

export interface SellGiftCardResponse {
  transaction_id: number;
  card_amount: string;
  local_currency_amount: string;
  exchange_rate: string;
  status: string;
}

export const giftCardsApi = {
  /**
   * Get gift card products
   */
  getProducts: async (
    countryCode: string = "US"
  ): Promise<GiftCardProductsResponse> => {
    const response = await apiClient.get<
      ApiResponse<GiftCardProductsResponse>
    >("/giftcards/products", { country_code: countryCode });
    return response.data;
  },

  /**
   * Sell gift card
   */
  sellGiftCard: async (
    data: SellGiftCardRequest
  ): Promise<SellGiftCardResponse> => {
    const formData = new FormData();
    formData.append("brand_name", data.brand_name);
    formData.append("card_currency", data.card_currency);
    formData.append("code", data.code);
    if (data.card_image) {
      formData.append("card_image", data.card_image);
    }

    const response = await apiClient.post<
      ApiResponse<SellGiftCardResponse>
    >("/giftcards/sell", formData);
    return response.data;
  },
};

