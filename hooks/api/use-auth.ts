/**
 * Authentication hooks using TanStack Query
 */

import { accountApi } from "@/services/api/account";
import { authApi } from "@/services/api/auth";
import { LoginRequest, SignupRequest } from "@/services/api/types";
import { clearTokens, saveToken } from "@/utils/token-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGlobalFcmToken } from "../use-firebase-token";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

/**
 * Hook to get current user
 */
export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to login user
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: async (data) => {
      // Save access token to secure storage
      await saveToken(data.access_token);
      // Invalidate and refetch user data
      queryClient.setQueryData(authKeys.user(), data.user);

      // Send FCM token to backend if available
      const fcmToken = getGlobalFcmToken();
      console.log("🔄 FCM Token:", fcmToken);
      if (fcmToken) {
        try {
          await accountApi.updateFcmToken(fcmToken);
        } catch (err) {
          // silently ignore; token can be sent later
          console.warn("Failed to update FCM token:", err);
        }
      }
    },
  });
}

/**
 * Hook to signup user
 */
export function useSignup() {
  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
  });
}

/**
 * Hook to resend verification code
 */
export function useResendVerificationCode() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerificationCode(email),
  });
}

/**
 * Hook to verify email
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyEmail(email, code),
  });
}

/**
 * Hook to request password reset
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

/**
 * Hook to reset password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      email,
      code,
      password,
    }: {
      email: string;
      code: string;
      password: string;
    }) => authApi.resetPassword(email, code, password),
  });
}

/**
 * Hook to logout user
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      // Clear tokens from storage
      await clearTokens();
      // Clear all queries
      queryClient.clear();
    },
  });
}
