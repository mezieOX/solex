/**
 * Token Storage Utility
 * Handles persistence of authentication tokens using AsyncStorage
 */

import { apiClient } from "@/services/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@solex_trade:auth_token";
const REFRESH_TOKEN_KEY = "@solex_trade:refresh_token";

/**
 * Save authentication token
 */
export async function saveToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    apiClient.setToken(token);
  } catch (error) {
    console.error("Error saving token:", error);
  }
}

/**
 * Get authentication token
 */
export async function getToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      apiClient.setToken(token);
    }
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
}

/**
 * Save refresh token
 */
export async function saveRefreshToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Error saving refresh token:", error);
  }
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
}

/**
 * Remove all tokens
 */
export async function clearTokens(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
    apiClient.setToken(null);
  } catch (error) {
    console.error("Error clearing tokens:", error);
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
