/**
 * Token Storage Utility
 * Handles persistence of authentication tokens using SecureStore
 */

import { apiClient } from "@/services/api/client";
import {
  getSecureItem,
  removeSecureItem,
  setSecureItem,
} from "./secure-storage";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * Save authentication token
 */
export async function saveToken(token: string): Promise<void> {
  try {
    await setSecureItem(TOKEN_KEY, token);
    apiClient.setToken(token);
  } catch (error) {
  }
}

/**
 * Get authentication token
 */
export async function getToken(): Promise<string | null> {
  try {
    const token = await getSecureItem(TOKEN_KEY);
    if (token) {
      apiClient.setToken(token);
    }
    return token;
  } catch (error) {
    return null;
  }
}

/**
 * Save refresh token
 */
export async function saveRefreshToken(token: string): Promise<void> {
  try {
    await setSecureItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
  }
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await getSecureItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Remove all tokens
 */
export async function clearTokens(): Promise<void> {
  try {
    await removeSecureItem(TOKEN_KEY);
    await removeSecureItem(REFRESH_TOKEN_KEY);
    apiClient.setToken(null);
  } catch (error) {
  }
}

/**
 * Initialize token on app start
 */
export async function initializeAuth(): Promise<void> {
  const token = await getToken();
  if (token) {
    apiClient.setToken(token);
  }
}
