import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";
import {
  getSecureItem,
  removeSecureItem,
  setSecureItem,
} from "./secure-storage";

const BIOMETRIC_ENABLED_KEY = "biometric_enabled"; // Non-sensitive, can use AsyncStorage
const BIOMETRIC_EMAIL_KEY = "biometric_email";
const BIOMETRIC_PASSWORD_KEY = "biometric_password";

/**
 * Check if biometric authentication is available on the device
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  } catch (error) {
    return false;
  }
}

/**
 * Get the type of biometric authentication available
 * Note: On Android, even if both fingerprint and facial recognition are available,
 * the system typically uses fingerprint. We prioritize fingerprint detection.
 */
export async function getBiometricType(): Promise<string> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    // On Android, fingerprint is typically used even if both are available
    // So we check for fingerprint first on Android
    if (Platform.OS === "android") {
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return "Fingerprint";
      } else if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        return "Face Recognition";
      }
    }

    // On iOS, check for Face ID first (iPhone X and later)
    if (Platform.OS === "ios") {
      if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        return "Face ID";
      } else if (
        types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ) {
        return "Touch ID";
      }
    }

    // Fallback: Check for fingerprint first (most common)
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
    }

    // Then check for facial recognition
    if (
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ) {
      return Platform.OS === "ios" ? "Face ID" : "Face Recognition";
    }

    // Other types
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris";
    }

    return "Biometric";
  } catch (error) {
    return "Biometric";
  }
}

/**
 * Authenticate using biometrics
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to login",
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (error) {
    return false;
  }
}

/**
 * Check if biometric login is enabled
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === "true";
  } catch (error) {
    return false;
  }
}

/**
 * Enable biometric login and save credentials
 */
export async function enableBiometric(
  email: string,
  password: string
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");
    await setSecureItem(BIOMETRIC_EMAIL_KEY, email);
    await setSecureItem(BIOMETRIC_PASSWORD_KEY, password);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Disable biometric login
 */
export async function disableBiometric(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    await removeSecureItem(BIOMETRIC_EMAIL_KEY);
    await removeSecureItem(BIOMETRIC_PASSWORD_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get saved biometric credentials
 */
export async function getBiometricCredentials(): Promise<{
  email: string | null;
  password: string | null;
}> {
  try {
    const email = await getSecureItem(BIOMETRIC_EMAIL_KEY);
    const password = await getSecureItem(BIOMETRIC_PASSWORD_KEY);
    return { email, password };
  } catch (error) {
    return { email: null, password: null };
  }
}
