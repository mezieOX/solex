/**
 * Local Storage Utility
 * A generic storage solution for persisting data locally using AsyncStorage
 * Supports strings, numbers, booleans, objects, and arrays
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_PREFIX = "@solex_trade:";

/**
 * Get a namespaced key
 */
function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Save a string value
 */
export async function setString(key: string, value: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(getKey(key), value);
    return true;
  } catch (error) {
    console.error(`Error saving string for key "${key}":`, error);
    return false;
  }
}

/**
 * Get a string value
 */
export async function getString(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(getKey(key));
  } catch (error) {
    console.error(`Error getting string for key "${key}":`, error);
    return null;
  }
}

/**
 * Save a number value
 */
export async function setNumber(key: string, value: number): Promise<boolean> {
  try {
    await AsyncStorage.setItem(getKey(key), value.toString());
    return true;
  } catch (error) {
    console.error(`Error saving number for key "${key}":`, error);
    return false;
  }
}

/**
 * Get a number value
 */
export async function getNumber(key: string): Promise<number | null> {
  try {
    const value = await AsyncStorage.getItem(getKey(key));
    if (value === null) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  } catch (error) {
    console.error(`Error getting number for key "${key}":`, error);
    return null;
  }
}

/**
 * Save a boolean value
 */
export async function setBoolean(
  key: string,
  value: boolean
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(getKey(key), value ? "true" : "false");
    return true;
  } catch (error) {
    console.error(`Error saving boolean for key "${key}":`, error);
    return false;
  }
}

/**
 * Get a boolean value
 */
export async function getBoolean(key: string): Promise<boolean | null> {
  try {
    const value = await AsyncStorage.getItem(getKey(key));
    if (value === null) return null;
    return value === "true";
  } catch (error) {
    console.error(`Error getting boolean for key "${key}":`, error);
    return null;
  }
}

/**
 * Save an object (serialized as JSON)
 */
export async function setObject<T>(key: string, value: T): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(value);
    await AsyncStorage.setItem(getKey(key), jsonString);
    return true;
  } catch (error) {
    console.error(`Error saving object for key "${key}":`, error);
    return false;
  }
}

/**
 * Get an object (parsed from JSON)
 */
export async function getObject<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(getKey(key));
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error getting object for key "${key}":`, error);
    return null;
  }
}

/**
 * Save an array (serialized as JSON)
 */
export async function setArray<T>(key: string, value: T[]): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(value);
    await AsyncStorage.setItem(getKey(key), jsonString);
    return true;
  } catch (error) {
    console.error(`Error saving array for key "${key}":`, error);
    return false;
  }
}

/**
 * Get an array (parsed from JSON)
 */
export async function getArray<T>(key: string): Promise<T[] | null> {
  try {
    const value = await AsyncStorage.getItem(getKey(key));
    if (value === null) return null;
    return JSON.parse(value) as T[];
  } catch (error) {
    console.error(`Error getting array for key "${key}":`, error);
    return null;
  }
}

/**
 * Remove a specific key
 */
export async function remove(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(getKey(key));
    return true;
  } catch (error) {
    console.error(`Error removing key "${key}":`, error);
    return false;
  }
}

/**
 * Remove multiple keys at once
 */
export async function removeMultiple(keys: string[]): Promise<boolean> {
  try {
    const prefixedKeys = keys.map((key) => getKey(key));
    await AsyncStorage.multiRemove(prefixedKeys);
    return true;
  } catch (error) {
    console.error(`Error removing multiple keys:`, error);
    return false;
  }
}

/**
 * Clear all storage (only keys with the app prefix)
 */
export async function clear(): Promise<boolean> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const appKeys = allKeys.filter((key) => key.startsWith(STORAGE_PREFIX));
    await AsyncStorage.multiRemove(appKeys);
    return true;
  } catch (error) {
    console.error("Error clearing storage:", error);
    return false;
  }
}

/**
 * Clear all storage (including keys without prefix) - use with caution
 */
export async function clearAll(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing all storage:", error);
    return false;
  }
}

/**
 * Get all keys (only keys with the app prefix)
 */
export async function getAllKeys(): Promise<string[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.replace(STORAGE_PREFIX, ""));
  } catch (error) {
    console.error("Error getting all keys:", error);
    return [];
  }
}

/**
 * Check if a key exists
 */
export async function hasKey(key: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(getKey(key));
    return value !== null;
  } catch (error) {
    console.error(`Error checking key "${key}":`, error);
    return false;
  }
}

/**
 * Get multiple values at once
 */
export async function getMultiple(
  keys: string[]
): Promise<Record<string, string | null>> {
  try {
    const prefixedKeys = keys.map((key) => getKey(key));
    const values = await AsyncStorage.multiGet(prefixedKeys);
    const result: Record<string, string | null> = {};

    values.forEach(([key, value]) => {
      const originalKey = key.replace(STORAGE_PREFIX, "");
      result[originalKey] = value;
    });

    return result;
  } catch (error) {
    console.error("Error getting multiple values:", error);
    return {};
  }
}

/**
 * Set multiple values at once
 */
export async function setMultiple(
  keyValuePairs: Record<string, string>
): Promise<boolean> {
  try {
    const entries: [string, string][] = Object.entries(keyValuePairs).map(
      ([key, value]) => [getKey(key), value] as [string, string]
    );
    await AsyncStorage.multiSet(entries);
    return true;
  } catch (error) {
    console.error("Error setting multiple values:", error);
    return false;
  }
}

/**
 * Generic storage function that automatically detects the type
 */
export async function set<T>(key: string, value: T): Promise<boolean> {
  if (typeof value === "string") {
    return setString(key, value);
  } else if (typeof value === "number") {
    return setNumber(key, value);
  } else if (typeof value === "boolean") {
    return setBoolean(key, value);
  } else if (Array.isArray(value)) {
    return setArray(key, value);
  } else if (typeof value === "object" && value !== null) {
    return setObject(key, value);
  } else {
    console.error(`Unsupported type for key "${key}"`);
    return false;
  }
}

/**
 * Storage keys constants (for consistency across the app)
 */
export const StorageKeys = {
  // User preferences
  ONBOARDING_COMPLETED: "onboarding_completed",
  THEME_PREFERENCE: "theme_preference",
  LANGUAGE: "language",
  BIOMETRIC_ENABLED: "biometric_enabled",
  SHOW_BALANCE: "show_balance",
  SHOW_FIAT_BALANCE: "show_fiat_balance",

  // App state
  LAST_SYNC_TIME: "last_sync_time",
  APP_VERSION: "app_version",

  // User data
  USER_PROFILE: "user_profile",
  USER_PREFERENCES: "user_preferences",

  // Cache
  CRYPTO_CACHE: "crypto_cache",
  GIFTCARD_CACHE: "giftcard_cache",
  NOTIFICATIONS_CACHE: "notifications_cache",

  // Notification permission
  NOTIFICATION_PERMISSION_DISMISSED: "notification_permission_dismissed",
} as const;
