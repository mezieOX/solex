/**
 * Secure Storage Utility
 * Wrapper around expo-secure-store for storing sensitive data securely
 * Use this for passwords, tokens, and other sensitive information
 */

import * as SecureStore from "expo-secure-store";

const STORAGE_PREFIX = "solex_trade_";

/**
 * Get a namespaced key
 */
function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Save a value securely
 */
export async function setSecureItem(
  key: string,
  value: string
): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(getKey(key), value);
    return true;
  } catch (error) {
    console.error(`Error saving secure item for key "${key}":`, error);
    return false;
  }
}

/**
 * Get a value securely
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(getKey(key));
  } catch (error) {
    console.error(`Error getting secure item for key "${key}":`, error);
    return null;
  }
}

/**
 * Remove a secure item
 */
export async function removeSecureItem(key: string): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(getKey(key));
    return true;
  } catch (error) {
    console.error(`Error removing secure item for key "${key}":`, error);
    return false;
  }
}

/**
 * Check if secure storage is available
 */
export async function isSecureStorageAvailable(): Promise<boolean> {
  try {
    // Try to set and get a test value
    const testKey = getKey("_test_availability");
    await SecureStore.setItemAsync(testKey, "test");
    await SecureStore.deleteItemAsync(testKey);
    return true;
  } catch (error) {
    console.error("Secure storage not available:", error);
    return false;
  }
}
