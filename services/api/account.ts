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
};

