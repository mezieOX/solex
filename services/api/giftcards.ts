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

export interface BuyGiftCardRequest {
  product_id: string;
  quantity: string;
}

export interface BuyGiftCardResponse {
  wallet_balance: number;
  purchase: {
    transaction_id: number;
    status: string;
    provider: string;
    product: {
      id: number;
      name: string;
      country: string;
      brand: {
        id: number;
        name: string;
      };
      quantity: number;
      logo: string | null;
    };
    face_value: {
      unit_amount: number;
      total_amount: number;
      currency: string;
    };
    charged: {
      amount_ngn: number;
      currency: string;
      discount_ngn: number;
      fee_ngn: number;
      sms_fee_ngn: number;
      total_fee_ngn: number;
      effective_rate_ngn_per_face_unit: number;
    };
    recipient: {
      email: string;
      phone: string | null;
    };
    meta: {
      custom_identifier: string;
      provider_balance: {
        oldBalance: number;
        newBalance: number;
        cost: number;
        currencyCode: string;
        currencyName: string;
        updatedAt: string;
      };
      created_at: string;
    };
  };
  provider_raw: any;
}

export interface GiftCardCodesResponse {
  transaction_id: number;
  product: {
    productId: number;
    productName: string;
    countryCode: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    currencyCode: string;
    brand: {
      brandId: number;
      brandName: string;
    };
  };
  codes: Array<{
    cardNumber: string;
    pinCode: string;
  }>;
}

export interface SellGiftCardRequest {
  brand_name: string;
  card_currency: string;
  code: string;
  face_value: string;
  card_image?: string;
}

export interface SellGiftCardResponse {
  sale_id: number;
  status: string;
}

export const giftCardsApi = {
  /**
   * Get gift card products
   */
  getProducts: async (
    countryCode: string = "US"
  ): Promise<GiftCardProductsResponse> => {
    const response = await apiClient.get<ApiResponse<GiftCardProductsResponse>>(
      "/giftcards/products",
      { country_code: countryCode }
    );
    return response.data;
  },

  /**
   * Buy gift card
   */
  buyGiftCard: async (
    data: BuyGiftCardRequest
  ): Promise<BuyGiftCardResponse> => {
    const formData = new FormData();
    formData.append("product_id", data.product_id);
    formData.append("quantity", data.quantity);

    const response = await apiClient.post<ApiResponse<BuyGiftCardResponse>>(
      "/giftcards/buy",
      formData
    );
    return response.data;
  },

  /**
   * Get gift card codes for a transaction
   */
  getGiftCardCodes: async (
    transactionId: number
  ): Promise<GiftCardCodesResponse> => {
    const response = await apiClient.get<ApiResponse<GiftCardCodesResponse>>(
      "/giftcards/transactions/codes",
      {
        transaction_id: transactionId,
      }
    );
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
    formData.append("face_value", data.face_value);
    if (data.card_image) {
      formData.append("card_image", data.card_image);
    }

    const response = await apiClient.post<ApiResponse<SellGiftCardResponse>>(
      "/giftcards/sell",
      formData
    );
    return response.data;
  },
};
