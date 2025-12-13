import { Button } from "@/components/ui/button";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useUser } from "@/hooks/api/use-auth";
import { useInitiateDeposit } from "@/hooks/api/use-wallet";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from "expo-web-browser";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function FlutterwavePaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data: user } = useUser();
  const initiateDeposit = useInitiateDeposit();
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = (params.amount as string) || "0";
  const email = user?.email || "";
  const name = user?.name || "";
  const phone = user?.phone || "";

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showErrorToast({
        message: "Please enter a valid amount",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Ensure amount is a valid number string
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        showErrorToast({
          message: "Please enter a valid amount",
        });
        return;
      }

      // Convert to kobo (smallest currency unit)
      // If user enters "100" (100 NGN), convert to "10000" (10000 kobo)
      // The API response shows amount: 10000 which is likely in kobo
      const amountToSend = String(Math.round(amountValue * 100));

      // Create redirect URL - Flutterwave will redirect here after payment
      // Using a web URL that can handle the redirect (you may need to configure this)
      const redirectUrl = "https://solextrade.co/payment-callback";
      // Alternative: Use deep link (uncomment if you prefer)
      // const redirectUrl = "solextradeapp://deposit-success";

      const response = await initiateDeposit.mutateAsync({
        amount: amountToSend,
        redirectUrl,
      });

      if (response.payment_link) {
        // Open the payment link in browser
        const result = await openBrowserAsync(response.payment_link, {
          presentationStyle: WebBrowserPresentationStyle.FULL_SCREEN,
        });

        // Check if payment was completed (user closed browser)
        // Note: You may need to implement webhook or polling to check payment status
        if (result.type === "dismiss") {
          // User closed the browser, check payment status
          // For now, we'll show a message
          showSuccessToast({
            message: "Payment initiated. Please check your transaction status.",
          });
          router.replace({
            pathname: "/deposit-success",
            params: {
              amount,
              method: "Flutterwave",
              reference: response.reference,
            },
          });
        }
      } else {
        showErrorToast({
          message: "Failed to get payment link. Please try again.",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to initiate payment. Please try again.";

      showErrorToast({
        message: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <ScreenTitle title="Flutterwave Payment" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.amountLabel}>Amount to Deposit</Text>
          <Text style={styles.amountValue}>
            ₦{parseFloat(amount).toLocaleString()}
          </Text>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Payment Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{email || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{name || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{phone || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.noteText}>
              Click the button below to proceed with your payment. You will be
              redirected to Flutterwave's secure payment page.
            </Text>
          </View>

          <View style={styles.paymentButtonContainer}>
            <Button
              title={
                isProcessing
                  ? "Processing..."
                  : `Pay ₦${parseFloat(amount).toLocaleString()}`
              }
              onPress={handlePayment}
              disabled={isProcessing || !amount || parseFloat(amount) <= 0}
              loading={isProcessing}
              style={styles.paymentButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
    textAlign: "center",
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 32,
  },
  infoSection: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "500",
  },
  noteSection: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primary,
  },
  noteText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  paymentButtonContainer: {
    marginTop: 20,
  },
  paymentButton: {
    width: "100%",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: AppColors.error,
    textAlign: "center",
    lineHeight: 20,
  },
});
