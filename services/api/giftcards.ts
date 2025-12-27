/**
 * Gift Cards API endpoints
 */

import { apiClient } from "./client";
import { ExchangeRateResponse } from "./crypto";
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
  range_id: string;
  amount: string;
  code: string;
  images?: string[];
  pin?: string;
  notes?: string;
}

export interface SellGiftCardResponse {
  user_id: number;
  reference: string;
  brand_name: string;
  currency_code: string;
  card_type: string;
  face_value: number;
  rate_at_sale: number;
  payout_amount_ngn: number;
  code: string;
  pin: string;
  image_proof_url: string;
  notes: string;
  status: string;
  updated_at: string;
  created_at: string;
  id: number;
}

// New interfaces for /giftcards/list endpoint
export interface GiftCardRange {
  range_id: number;
  min: number;
  max: number;
  rate: number;
}

export interface GiftCardCurrency {
  currency_id: number;
  currency_code: string;
  currency_icon: string;
  ranges: GiftCardRange[];
}

export interface GiftCardForSell {
  id: number;
  name: string;
  image_url: string;
  physical: GiftCardCurrency[];
  ecode: GiftCardCurrency[];
}

export type GiftCardsListResponse = GiftCardForSell[];

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
    formData.append("range_id", data.range_id);
    formData.append("amount", data.amount);
    formData.append("code", data.code);
    if (data.pin) {
      formData.append("pin", data.pin);
    }
    if (data.notes) {
      formData.append("notes", data.notes);
    }
    if (data.images && data.images.length > 0) {
      // Append each image to FormData as an array
      data.images.forEach((imageUri, index) => {
        const filename = imageUri.split("/").pop() || `image_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("images[]", {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);
      });
    }

    const response = await apiClient.post<ApiResponse<SellGiftCardResponse>>(
      "/giftcards/sell",
      formData
    );
    return response.data;
  },

  /**
   * Get gift card exchange rate (fiat to fiat)
   */
  getExchangeRate: async (
    from: string,
    to: string,
    amount: number
  ): Promise<ExchangeRateResponse> => {
    const response = await apiClient.get<ApiResponse<ExchangeRateResponse>>(
      "/wallets/crypto/exchange-rate",
      { from, to, amount }
    );
    return response.data;
  },

  /**
   * Get list of gift cards available for sell
   */
  getGiftCardsList: async (): Promise<GiftCardsListResponse> => {
    const response = await apiClient.get<ApiResponse<GiftCardForSell[]>>(
      "/giftcards/list"
    );
    return response.data;
  },
};
