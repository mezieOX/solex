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
};
