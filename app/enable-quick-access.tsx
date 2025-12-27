import { Button } from "@/components/ui/button";
import { AppColors } from "@/constants/theme";
import {
  authenticateWithBiometric,
  disableBiometric,
  enableBiometric,
  getBiometricType,
  isBiometricAvailable,
  isBiometricEnabled,
} from "@/utils/biometric";
import { getSecureItem, removeSecureItem } from "@/utils/secure-storage";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function EnableQuickAccessScreen() {
  const router = useRouter();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState("Biometric");
  const [isEnabling, setIsEnabling] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await isBiometricAvailable();
      const type = await getBiometricType();
      const enabled = await isBiometricEnabled();
      setBiometricAvailable(available);
      setBiometricType(type);
      setIsEnabled(enabled);
    };
    checkBiometric();
  }, []);

  const handleDisableBiometric = async () => {
    try {
      setIsEnabling(true);

      // Authenticate with biometric before disabling
      const authenticated = await authenticateWithBiometric();
      if (!authenticated) {
        showErrorToast({
          message: "Biometric authentication failed",
        });
        setIsEnabling(false);
        return;
      }

      // Disable biometric
      const disabled = await disableBiometric();

      if (disabled) {
        showSuccessToast({
          message: `${biometricType} disabled successfully!`,
        });
        setIsEnabled(false);
      } else {
        showErrorToast({
          message: "Failed to disable biometric authentication",
        });
      }
    } catch (error: any) {
      showErrorToast({
        message: error?.message || "Failed to disable biometric authentication",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const handleEnableBiometric = async () => {
    try {
      setIsEnabling(true);

      // Get saved email and password from the last successful login
      const savedEmail = await AsyncStorage.getItem("saved_email");

      if (!savedEmail) {
        showErrorToast({
          message: "No saved credentials found. Please login first.",
        });
        setIsEnabling(false);
        return;
      }

      // Authenticate with biometric first
      const authenticated = await authenticateWithBiometric();
      if (!authenticated) {
        showErrorToast({
          message: "Biometric authentication failed",
        });
        setIsEnabling(false);
        return;
      }

      // Get password from secure storage
      const tempPassword = await getSecureItem("temp_password");

      if (!tempPassword) {
        showErrorToast({
          message: "Please login again to enable biometric authentication",
        });
        router.replace("/auth/login");
        setIsEnabling(false);
        return;
      }

      // Enable biometric with credentials
      const enabled = await enableBiometric(savedEmail, tempPassword);

      if (enabled) {
        // Clear temporary password from secure storage
        await removeSecureItem("temp_password");
        showSuccessToast({
          message: `${biometricType} enabled successfully!`,
        });
        setIsEnabled(true);
      } else {
        showErrorToast({
          message: "Failed to enable biometric authentication",
        });
      }
    } catch (error: any) {
      showErrorToast({
        message: error?.message || "Failed to enable biometric authentication",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image
            source={require("@/assets/images/fingerprint.png")}
            style={styles.icon}
            contentFit="contain"
          />
        </View>

        <Text style={styles.title}>
          {isEnabled ? "Disable Quick Access" : "Enable Quick Access"}
        </Text>
        <Text style={styles.subtitle}>
          {isEnabled
            ? `Disable ${biometricType} for quick access to your account`
            : `Enable ${biometricType} for fast and more secure access to your account`}
        </Text>

        <View style={styles.buttons}>
          <Button
            title={isEnabled ? "Disable Biometric" : "Enable Now"}
            onPress={isEnabled ? handleDisableBiometric : handleEnableBiometric}
            style={styles.enableButton}
            loading={isEnabling}
            disabled={isEnabling || !biometricAvailable}
            variant={isEnabled ? "outline" : undefined}
          />
          <Button
            title="Back"
            onPress={() => router.back()}
            variant="outline"
            style={styles.laterButton}
            disabled={isEnabling}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  buttons: {
    marginTop: 80,
    width: "100%",
    gap: 12,
  },
  enableButton: {
    marginBottom: 0,
  },
  laterButton: {
    marginBottom: 0,
  },
});
