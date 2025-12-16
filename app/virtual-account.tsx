import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useGenerateVirtualAccount } from "@/hooks/api/use-account";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { formatValidationError, ninSchema } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import * as ClipboardLib from "expo-clipboard";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function VirtualAccountScreen() {
  const [nin, setNin] = useState("");
  const [errors, setErrors] = useState<{ nin?: string }>({});
  const [virtualAccountData, setVirtualAccountData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const generateVirtualAccount = useGenerateVirtualAccount();

  const handleSubmit = async () => {
    try {
      // Validate form using Yup
      const formData = {
        nin: nin.trim(),
      };

      await ninSchema.validate(formData, { abortEarly: false });

      // Clear any previous errors
      setErrors({});

      // Submit form
      const result = await generateVirtualAccount.mutateAsync(formData.nin);

      if (result.status === "success") {
        showSuccessToast({
          message: result.message || "Virtual account generated successfully!",
        });
        // Store virtual account data to display
        setVirtualAccountData(result.data);
      }
    } catch (error: any) {
      // Handle Yup validation errors
      if (error.name === "ValidationError") {
        const formattedErrors = formatValidationError(error);
        setErrors(formattedErrors);
        // Show first validation error as toast
        const firstError = Object.values(formattedErrors)[0];
        if (firstError) {
          showErrorToast({
            message: firstError,
          });
        }
        return;
      }

      // Handle API errors
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to generate virtual account. Please try again.";
      showErrorToast({
        message: errorMessage,
      });
    }
  };

  const handleCopy = async (text: string, label: string) => {
    await ClipboardLib.setStringAsync(text);
    setCopiedField(label);
    showSuccessToast({
      message: `${label} copied to clipboard`,
    });
    // Reset the copied indicator after 2 seconds
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // If virtual account is generated, show success view
  if (virtualAccountData) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScreenTitle title="Virtual Account" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={60} color="#FFFFFF" />
            </View>
          </View>

          {/* Success Message */}
          <Text style={styles.successTitle}>
            Virtual Account Generated Successfully!
          </Text>
          <Text style={styles.successSubtitle}>
            Your virtual account has been created. You can now receive payments
            directly to this account.
          </Text>

          {/* Virtual Account Details Card */}
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bank Name</Text>
              <Text style={styles.detailValue}>
                {virtualAccountData.bank_name}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account Number</Text>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>
                  {virtualAccountData.account_number}
                </Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() =>
                    handleCopy(
                      virtualAccountData.account_number,
                      "Account Number"
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      copiedField === "Account Number"
                        ? "checkmark-circle"
                        : "copy-outline"
                    }
                    size={20}
                    color={
                      copiedField === "Account Number"
                        ? AppColors.green
                        : AppColors.primary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account Status</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    virtualAccountData.account_status === "active" &&
                      styles.statusBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      virtualAccountData.account_status === "active" &&
                        styles.statusTextActive,
                    ]}
                  >
                    {virtualAccountData.account_status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {virtualAccountData.flw_ref && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Flutterwave Reference</Text>
                <View style={styles.detailValueContainer}>
                  <Text style={[styles.detailValue, styles.referenceValue]}>
                    {virtualAccountData.flw_ref}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() =>
                      handleCopy(virtualAccountData.flw_ref, "Reference")
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        copiedField === "Reference"
                          ? "checkmark-circle"
                          : "copy-outline"
                      }
                      size={20}
                      color={
                        copiedField === "Reference"
                          ? AppColors.green
                          : AppColors.primary
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>

          {/* Done Button */}
          <Button
            title="Done"
            onPress={() => router.back()}
            style={styles.button}
          />
        </ScrollView>
      </View>
    );
  }

  // Show form view
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Create Virtual Account" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons
              name="information-circle"
              size={24}
              color={AppColors.primary}
            />
            <Text style={styles.infoTitle}>About Virtual Account</Text>
          </View>
          <Text style={styles.infoText}>
            A virtual account allows you to receive payments directly to your
            account. To create one, please provide your National Identification
            Number (NIN).
          </Text>
        </Card>

        {/* NIN Input */}
        <Input
          label="National Identification Number (NIN)"
          placeholder="Enter your 11-digit NIN"
          value={nin}
          onChangeText={(text) => {
            setNin(text);
            if (errors.nin) {
              setErrors({});
            }
          }}
          error={errors.nin}
          keyboardType="numeric"
          maxLength={11}
          leftIcon={
            <Ionicons
              name="card-outline"
              size={20}
              color={AppColors.textSecondary}
            />
          }
        />

        {/* Submit Button */}
        <Button
          title="Generate Virtual Account"
          onPress={handleSubmit}
          loading={generateVirtualAccount.isPending}
          disabled={generateVirtualAccount.isPending || !nin.trim()}
          style={styles.button}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  infoCard: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: AppColors.primary + "10",
    borderWidth: 1,
    borderColor: AppColors.primary + "30",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  infoText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
  successIconContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.green,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  detailsCard: {
    marginBottom: 24,
    padding: 20,
  },
  detailRow: {
    marginBottom: 20,
  },
  lastDetailRow: {
    marginBottom: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  detailValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyButton: {
    padding: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: AppColors.textSecondary + "20",
  },
  statusBadgeActive: {
    backgroundColor: AppColors.green + "20",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  statusTextActive: {
    color: AppColors.green,
  },
  referenceValue: {
    fontSize: 12,
    fontFamily: "monospace",
  },
});
