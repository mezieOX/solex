/**
 * Account API endpoints
 */

import { apiClient } from "./client";
import { ApiResponse, User } from "./types";

export interface AccountDetailsResponse {
  user: User;
}

export const accountApi = {
  /**
   * Get account details
   */
  getAccountDetails: async (): Promise<AccountDetailsResponse> => {
    const response = await apiClient.get<ApiResponse<AccountDetailsResponse>>(
      "/account"
    );
    return response.data;
  },

  /**
   * Update phone number
   * @param phone - Phone number to update
   * @param code - Verification code (optional, required for final verification)
   */
  updatePhone: async (
    phone: string,
    code?: string
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append("phone", phone);
    if (code) {
      formData.append("code", code);
    }

    const response = await apiClient.post<ApiResponse<any>>(
      "/account/update-phone",
      formData
    );
    return response;
  },

  /**
   * Change password (in-app)
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append("current_password", currentPassword);
    formData.append("new_password", newPassword);

    const response = await apiClient.post<ApiResponse<any>>(
      "/account/password/change",
      formData
    );
    return response;
  },

  /**
   * Generate virtual account
   * @param nin - National Identification Number
   */
  generateVirtualAccount: async (
    nin: string
  ): Promise<ApiResponse<VirtualAccountData>> => {
    const formData = new FormData();
    formData.append("nin", nin);

    const response = await apiClient.post<ApiResponse<VirtualAccountData>>(
      "/account/virtual-account",
      formData
    );
    return response;
  },

  /**
   * Update FCM token
   */
  updateFcmToken: async (token: string): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append("token", token);

    const response = await apiClient.post<ApiResponse<any>>(
      "/account/notification/fcm/update",
      formData
    );
    return response;
  },

  /**
   * Update profile image
   * @param imageUri - URI of the image file to upload
   */
  updateProfileImage: async (
    imageUri: string
  ): Promise<ApiResponse<{ profile_image_url: string }>> => {
    // Extract file extension to determine MIME type
    const fileExtension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType =
      fileExtension === "png"
        ? "image/png"
        : fileExtension === "jpg" || fileExtension === "jpeg"
        ? "image/jpeg"
        : "image/jpeg";

    // Extract filename from URI or use default
    const filename =
      imageUri.split("/").pop() || `profile_image.${fileExtension}`;

    const formData = new FormData();
    formData.append("profile_image", {
      uri: imageUri,
      type: mimeType,
      name: filename,
    } as any);

    const response = await apiClient.post<
      ApiResponse<{ profile_image_url: string }>
    >("/account/profile-image/update", formData);
    return response;
  },
};

export interface VirtualAccountData {
  bank_name: string;
  account_number: string;
  flw_ref: string;
  order_ref: string;
  account_status: string;
}
