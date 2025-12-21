import { Button } from "@/components/ui/button";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useGiftCardCodes } from "@/hooks/api/use-giftcards";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as ClipboardLib from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GiftCardCodesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get transaction ID from params
  const transactionId = params.transaction_id
    ? parseInt(params.transaction_id as string, 10)
    : null;

  // Fetch gift card codes
  const { data: codesData, isLoading, error } = useGiftCardCodes(transactionId);

  // Handle copy to clipboard
  const handleCopy = async (text: string, label: string) => {
    try {
      await ClipboardLib.setStringAsync(text);
      setCopiedField(label);
      showSuccessToast({
        message: `${label} copied to clipboard`,
      });
      // Reset the copied indicator after 2 seconds
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      showErrorToast({
        message: "Failed to copy to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScreenTitle title="Gift Card Codes" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading gift card codes...</Text>
        </View>
      </View>
    );
  }

  if (error || !codesData) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScreenTitle title="Gift Card Codes" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={AppColors.error} />
          <Text style={styles.errorText}>
            {error?.message || "Unable to load gift card codes"}
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Gift Card Codes" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={AppColors.green}
            />
          </View>
          <Text style={styles.successTitle}>Gift Card Purchased!</Text>
          <Text style={styles.successMessage}>
            Your gift card codes are ready. Please save them securely.
          </Text>
        </View>

        {/* Product Information */}
        <View style={styles.productCard}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Product</Text>
            <Text style={styles.detailValue}>
              {codesData.product.productName}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Brand</Text>
            <Text style={styles.detailValue}>
              {codesData.product.brand.brandName}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Country</Text>
            <Text style={styles.detailValue}>
              {codesData.product.countryCode}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>{codesData.product.quantity}</Text>
          </View>
          <View style={[styles.detailRow, styles.lastDetailRow]}>
            <Text style={styles.detailLabel}>Total Price</Text>
            <Text style={styles.detailValue}>
              {codesData.product.currencyCode} {codesData.product.totalPrice}
            </Text>
          </View>
        </View>

        {/* Gift Card Codes */}
        <View style={styles.codesCard}>
          <Text style={styles.sectionTitle}>Gift Card Codes</Text>
          {codesData.codes.map((code, index) => (
            <View key={index} style={styles.codeContainer}>
              <Text style={styles.codeIndex}>Card {index + 1}</Text>

              {/* Card Number */}
              <View style={styles.codeField}>
                <Text style={styles.codeLabel}>Card Number</Text>
                <View style={styles.codeValueContainer}>
                  <Text style={styles.codeValue}>{code.cardNumber}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() =>
                      handleCopy(code.cardNumber, `Card Number ${index + 1}`)
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        copiedField === `Card Number ${index + 1}`
                          ? "checkmark-circle"
                          : "copy-outline"
                      }
                      size={20}
                      color={
                        copiedField === `Card Number ${index + 1}`
                          ? AppColors.green
                          : AppColors.primary
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* PIN Code */}
              <View style={styles.codeField}>
                <Text style={styles.codeLabel}>PIN Code</Text>
                <View style={styles.codeValueContainer}>
                  <Text style={styles.codeValue}>{code.pinCode}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() =>
                      handleCopy(code.pinCode, `PIN Code ${index + 1}`)
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        copiedField === `PIN Code ${index + 1}`
                          ? "checkmark-circle"
                          : "copy-outline"
                      }
                      size={20}
                      color={
                        copiedField === `PIN Code ${index + 1}`
                          ? AppColors.green
                          : AppColors.primary
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {index < codesData.codes.length - 1 && (
                <View style={styles.codeDivider} />
              )}
            </View>
          ))}
        </View>

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <Ionicons
            name="information-circle"
            size={24}
            color={AppColors.orange}
          />
          <Text style={styles.noticeText}>
            Please save these codes securely. They cannot be retrieved once you
            leave this screen.
          </Text>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Done"
          onPress={() => router.back()}
          style={styles.button}
        />
      </View>
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  successHeader: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  productCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  codesCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border + "30",
  },
  lastDetailRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    textAlign: "right",
    flex: 1,
  },
  codeContainer: {
    marginBottom: 20,
  },
  codeIndex: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 16,
  },
  codeField: {
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  codeValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  codeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    fontFamily: "monospace",
    flex: 1,
    marginRight: 12,
  },
  copyButton: {
    padding: 4,
  },
  codeDivider: {
    height: 1,
    backgroundColor: AppColors.border + "30",
    marginTop: 20,
    marginBottom: 20,
  },
  noticeCard: {
    flexDirection: "row",
    backgroundColor: AppColors.orange + "15",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.orange + "30",
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: AppColors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: AppColors.background,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  button: {
    width: "100%",
  },
});
