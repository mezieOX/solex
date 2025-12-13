/**
 * Authentication API endpoints
 */

import { apiClient } from "./client";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  User,
} from "./types";

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      credentials
    );
    // Set token for future requests
    if (response.data?.access_token) {
      apiClient.setToken(response.data.access_token);
    }
    return response.data;
  },

  /**
   * Register/Signup user
   */
  signup: async (data: SignupRequest): Promise<ApiResponse<[]>> => {
    const response = await apiClient.post<ApiResponse<[]>>(
      "/auth/register",
      data
    );
    return response;
  },

  /**
   * Resend verification code
   */
  resendVerificationCode: async (email: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>("/auth/send-code", {
      email,
    });
    return response;
  },

  /**
   * Verify email
   */
  verifyEmail: async (
    email: string,
    code: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/auth/verify-email",
      {
        email,
        code,
      }
    );
    return response;
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/auth/forgot-password",
      { email }
    );
    return response;
  },

  /**
   * Reset password
   */
  resetPassword: async (
    email: string,
    code: string,
    password: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/auth/reset-password",
      { email, code, password }
    );
    return response;
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>("/account");
    return response.data.user;
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
    apiClient.setToken(null);
  },
};
