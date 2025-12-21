import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as ClipboardLib from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BillPaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Parse payment data from params
  const paymentData = useMemo(() => {
    try {
      const dataParam = params.paymentData;
      const dataString = Array.isArray(dataParam)
        ? dataParam[0]
        : (dataParam as string) || "{}";
      return JSON.parse(dataString);
    } catch {
      return null;
    }
  }, [params.paymentData]);

  // Format amount
  const formattedAmount = useMemo(() => {
    const amount = paymentData?.amount || "0";
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "₦0.00";
    }

    return `₦${amountValue.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [paymentData?.amount]);

  // Format wallet balance
  const formattedBalance = useMemo(() => {
    const balance = paymentData?.wallet_balance || "0";
    const balanceValue = parseFloat(balance);
    if (isNaN(balanceValue)) {
      return "₦0.00";
    }

    return `₦${balanceValue.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [paymentData?.wallet_balance]);

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
      console.error("Clipboard error:", error);
    }
  };

  if (!paymentData) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScreenTitle title="Payment" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={AppColors.error} />
          <Text style={styles.errorText}>Unable to load payment details</Text>
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
      <ScreenTitle title="Payment Successful" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Icon with Gradient */}
        <View style={styles.successIconContainer}>
          <LinearGradient
            colors={[AppColors.green, AppColors.greenAccent || AppColors.green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successIcon}
          >
            <Ionicons name="checkmark" size={64} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your bill payment has been processed
          </Text>
        </View>

        {/* Amount Card */}
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount Paid</Text>
          <Text style={styles.amountText}>{formattedAmount}</Text>
          <View style={styles.divider} />
          {paymentData?.category && (
            <View style={styles.infoRow}>
              <Ionicons
                name="receipt"
                size={18}
                color={AppColors.textSecondary}
              />
              <Text style={styles.infoText}>
                {paymentData.category} - {paymentData.biller}
              </Text>
            </View>
          )}
          {paymentData?.item && (
            <View style={styles.infoRow}>
              <Ionicons name="cube" size={18} color={AppColors.textSecondary} />
              <Text style={styles.infoText}>Package: {paymentData.item}</Text>
            </View>
          )}
          {paymentData?.customer && (
            <View style={styles.infoRow}>
              <Ionicons
                name="person"
                size={18}
                color={AppColors.textSecondary}
              />
              <Text style={styles.infoText}>
                Customer: {paymentData.customer}
              </Text>
            </View>
          )}
        </Card>

        {/* Payment Details */}
        {paymentData?.reference && (
          <Card style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Transaction Details</Text>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Reference Number</Text>
              </View>
              <TouchableOpacity
                style={styles.detailRight}
                onPress={() =>
                  handleCopy(paymentData.reference, "Reference number")
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.detailValue,
                    copiedField === "Reference number" && styles.copiedValue,
                  ]}
                  numberOfLines={1}
                >
                  {paymentData.reference}
                </Text>
                <Ionicons
                  name={
                    copiedField === "Reference number"
                      ? "checkmark"
                      : "copy-outline"
                  }
                  size={18}
                  color={
                    copiedField === "Reference number"
                      ? AppColors.green
                      : AppColors.textSecondary
                  }
                  style={styles.copyIcon}
                />
              </TouchableOpacity>
            </View>

            {paymentData?.flutterwave?.flw_ref && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Text style={styles.detailLabel}>Transaction ID</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailRight}
                  onPress={() =>
                    handleCopy(
                      paymentData.flutterwave.flw_ref,
                      "Transaction ID"
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.detailValue,
                      copiedField === "Transaction ID" && styles.copiedValue,
                    ]}
                    numberOfLines={1}
                  >
                    {paymentData.flutterwave.flw_ref}
                  </Text>
                  <Ionicons
                    name={
                      copiedField === "Transaction ID"
                        ? "checkmark"
                        : "copy-outline"
                    }
                    size={18}
                    color={
                      copiedField === "Transaction ID"
                        ? AppColors.green
                        : AppColors.textSecondary
                    }
                    style={styles.copyIcon}
                  />
                </TouchableOpacity>
              </View>
            )}

            {paymentData?.flutterwave?.reference && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Text style={styles.detailLabel}>Payment Reference</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailRight}
                  onPress={() =>
                    handleCopy(
                      paymentData.flutterwave.reference,
                      "Payment reference"
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.detailValue,
                      copiedField === "Payment reference" && styles.copiedValue,
                    ]}
                    numberOfLines={1}
                  >
                    {paymentData.flutterwave.reference}
                  </Text>
                  <Ionicons
                    name={
                      copiedField === "Payment reference"
                        ? "checkmark"
                        : "copy-outline"
                    }
                    size={18}
                    color={
                      copiedField === "Payment reference"
                        ? AppColors.green
                        : AppColors.textSecondary
                    }
                    style={styles.copyIcon}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.detailRow, styles.lastDetailRow]}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Wallet Balance</Text>
              </View>
              <View style={styles.detailRight}>
                <Text style={[styles.detailValue, styles.balanceValue]}>
                  {formattedBalance}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle"
            size={20}
            color={AppColors.textSecondary}
          />
          <Text style={styles.infoText}>
            This transaction will appear in your transaction history
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Done"
          onPress={() => router.replace("/(tabs)")}
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
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
  successIconContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  successIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: AppColors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
  },
  amountCard: {
    width: "100%",
    backgroundColor: AppColors.surface,
    padding: 24,
    marginBottom: 16,
    borderRadius: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  amountText: {
    fontSize: 36,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: AppColors.surface,
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLeft: {
    flex: 1,
  },
  detailRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  detailLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "500",
    marginRight: 8,
    flex: 1,
    textAlign: "right",
  },
  copiedValue: {
    color: AppColors.green,
  },
  copyIcon: {
    marginLeft: 4,
  },
  balanceValue: {
    color: AppColors.green,
    fontWeight: "600",
    fontSize: 15,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
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
