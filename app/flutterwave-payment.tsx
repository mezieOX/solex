import { Button } from "@/components/ui/button";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useUser } from "@/hooks/api/use-auth";
import { useInitiateDeposit } from "@/hooks/api/use-wallet";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function FlutterwavePaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data: user } = useUser();
  const initiateDeposit = useInitiateDeposit();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const amount = (params.amount as string) || "0";
  const email = user?.email || "";
  const name = user?.name || "";
  const phone = user?.phone || "";

  // Create redirect URL - Flutterwave will redirect here after payment
  const redirectUrl = "https://solextrade.co/payment-callback";
  // Alternative: Use deep link (uncomment if you prefer)
  // const redirectUrl = "solextradeapp://deposit-success";

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

      // Send amount as-is in NGN (no kobo conversion)
      // The API should handle the amount format correctly
      const amountToSend = String(Math.round(amountValue));

      const response = await initiateDeposit.mutateAsync({
        amount: amountToSend,
        redirectUrl,
      });

      if (response.payment_link) {
        // Show WebView with payment link
        setPaymentUrl(response.payment_link);
        setShowWebView(true);
        setWebViewLoading(true);
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

  // Helper function to check if URL indicates successful payment
  const isPaymentSuccess = (url: string) => {
    if (!url) return false;

    // Check for callback URL or success indicators
    const successIndicators = [
      redirectUrl,
      "payment-callback",
      "success",
      "callback",
      "status=successful",
      "status=success",
      "tx_ref",
    ];

    return successIndicators.some((indicator) =>
      url.toLowerCase().includes(indicator.toLowerCase())
    );
  };

  // Handle successful payment redirect
  const handlePaymentSuccess = () => {
    setShowWebView(false);
    setPaymentUrl(null);
    showSuccessToast({
      message: "Payment completed successfully!",
    });
    router.replace({
      pathname: "/deposit-success",
      params: {
        amount,
        method: "Flutterwave",
      },
    });
  };

  // Handle WebView navigation state changes
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    // Check if payment was successful
    if (isPaymentSuccess(url)) {
      handlePaymentSuccess();
    }
  };

  // Handle WebView errors
  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    const errorUrl = nativeEvent?.url || "";

    console.warn("WebView error: ", nativeEvent);

    // Check if the error is actually a successful payment redirect
    // Sometimes the callback URL fails to load but payment was successful
    if (isPaymentSuccess(errorUrl)) {
      // This is likely a successful payment, redirect to success page
      handlePaymentSuccess();
      return;
    }

    // Only show error if it's not a callback/success URL
    showErrorToast({
      message: "Failed to load payment page. Please try again.",
    });
    setShowWebView(false);
  };

  // Close WebView
  const handleCloseWebView = () => {
    setShowWebView(false);
    setPaymentUrl(null);
  };

  // If WebView should be shown, display it
  if (showWebView && paymentUrl) {
    return (
      <SafeAreaView style={styles.webViewContainer} edges={["top"]}>
        <StatusBar style="light" />
        {/* WebView Header */}
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            onPress={handleCloseWebView}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={AppColors.text} />
          </TouchableOpacity>
          <Text style={styles.webViewHeaderTitle}>Flutterwave Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          style={styles.webview}
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={(syntheticEvent) => {
            setWebViewLoading(false);
            // Check if the loaded URL indicates successful payment
            const url = syntheticEvent.nativeEvent?.url || "";
            if (isPaymentSuccess(url)) {
              handlePaymentSuccess();
            }
          }}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleWebViewError}
          onHttpError={handleWebViewError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={["*"]}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <ScreenTitle title="Flutterwave Payment" />

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
    width: "100%",
    height: "100%",
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  content: {
    flex: 1,
    width: "100%",
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
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: AppColors.background,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    width: "100%",
  },
  webViewHeaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
  },
  closeButton: {
    padding: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: AppColors.background,
    width: "100%",
  },
  loadingContainer: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
});
