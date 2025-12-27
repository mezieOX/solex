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
  const [, setWebViewLoading] = useState(true);
  const [paymentHandled, setPaymentHandled] = useState(false);
  const [lastUrl, setLastUrl] = useState<string>("");
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
        // Reset payment handled state for new payment
        setPaymentHandled(false);
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

  // Helper function to check if URL indicates cancelled payment
  const isPaymentCancelled = (url: string) => {
    if (!url) return false;

    const cancelledIndicators = [
      "cancelled",
      "cancel",
      "status=cancelled",
      "status=cancel",
      "error=cancelled",
      "user_cancelled",
    ];

    return cancelledIndicators.some((indicator) =>
      url.toLowerCase().includes(indicator.toLowerCase())
    );
  };

  // Helper function to check if URL indicates failed payment
  const isPaymentFailed = (url: string) => {
    if (!url) return false;

    const failedIndicators = [
      "failed",
      "failure",
      "status=failed",
      "status=failure",
      "error=failed",
    ];

    return failedIndicators.some((indicator) =>
      url.toLowerCase().includes(indicator.toLowerCase())
    );
  };

  // Helper function to check if URL indicates successful payment
  const isPaymentSuccess = (url: string) => {
    if (!url) return false;

    // First check if it's cancelled or failed
    if (isPaymentCancelled(url) || isPaymentFailed(url)) {
      return false;
    }

    // Check for Flutterwave fallback URL pattern (API callback)
    const fallbackUrlPattern = "/api/flutterwave/fallback";
    const hasFallbackUrl = url
      .toLowerCase()
      .includes(fallbackUrlPattern.toLowerCase());

    // Check for explicit success indicators in URL or query params
    const successIndicators = [
      "status=successful",
      "status=success",
      "status=completed",
      "transaction_id",
      "flw_ref",
      "tx_ref",
      "txid",
      "success=true",
      "successful=true",
    ];

    // Check if URL contains redirect URL
    const hasRedirectUrl = url
      .toLowerCase()
      .includes(redirectUrl.toLowerCase());

    // Check for success indicators in the URL
    const hasSuccessIndicator = successIndicators.some((indicator) =>
      url.toLowerCase().includes(indicator.toLowerCase())
    );

    // Parse URL to check query parameters manually
    try {
      // Extract query string from URL
      const queryString = url.split("?")[1] || "";
      const params: { [key: string]: string } = {};

      // Parse query parameters manually
      queryString.split("&").forEach((param) => {
        const [key, value] = param.split("=");
        if (key) {
          params[key.toLowerCase()] = decodeURIComponent(value || "");
        }
      });

      // Check query parameters for success indicators
      const statusParam = params["status"]?.toLowerCase();
      const hasSuccessParam =
        statusParam === "successful" ||
        statusParam === "success" ||
        statusParam === "completed";

      const hasTransactionId =
        params.hasOwnProperty("transaction_id") ||
        params.hasOwnProperty("flw_ref") ||
        params.hasOwnProperty("tx_ref") ||
        params.hasOwnProperty("txid");

      // Return true if:
      // 1. URL contains redirect URL AND has success indicator/param, OR
      // 2. URL contains redirect URL AND has transaction ID, OR
      // 3. URL is exactly the redirect URL (Flutterwave redirects here on success)
      // 4. URL has success indicators even without redirect URL (e.g., fallback URLs)
      if (hasRedirectUrl) {
        return (
          hasSuccessIndicator ||
          hasSuccessParam ||
          hasTransactionId ||
          url === redirectUrl
        );
      }

      // Also return true if we have clear success indicators, even without redirect URL
      // This catches fallback URLs like: https://api.solextrade.co/api/flutterwave/fallback?status=completed
      if (
        hasFallbackUrl &&
        (hasSuccessParam || hasTransactionId || hasSuccessIndicator)
      ) {
        return true;
      }
      if (hasSuccessParam || (hasTransactionId && hasSuccessIndicator)) {
        return true;
      }
    } catch (e) {
      // If URL parsing fails, fall back to string matching
      if (hasRedirectUrl) {
        return hasSuccessIndicator || url === redirectUrl;
      }
      // Also check for success indicators in the URL string
      if (hasSuccessIndicator) {
        return true;
      }
    }

    // Final check: if URL has success indicators in the string, treat as success
    // This catches URLs like: .../fallback?status=completed&...
    if (hasSuccessIndicator) {
      return true;
    }

    return false;
  };

  // Handle successful payment redirect
  const handlePaymentSuccess = () => {
    // Prevent multiple calls
    if (paymentHandled) return;

    setPaymentHandled(true);
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

  // Handle cancelled payment
  const handlePaymentCancelled = () => {
    setShowWebView(false);
    setPaymentUrl(null);
    showErrorToast({
      message: "Payment was cancelled",
    });
    router.back();
  };

  // Handle failed payment
  const handlePaymentFailed = () => {
    setShowWebView(false);
    setPaymentUrl(null);
    showErrorToast({
      message: "Payment failed. Please try again.",
    });
    router.back();
  };

  // Handle WebView navigation state changes
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    if (!url) return;

    // Store the last URL for error handling
    setLastUrl(url);

    // If URL contains redirect URL, treat as success immediately
    // (Flutterwave redirects here after successful payment, even if page fails to load)
    if (url.toLowerCase().includes(redirectUrl.toLowerCase())) {
      handlePaymentSuccess();
      return;
    }

    // Check payment status in order: success > cancelled > failed
    if (isPaymentSuccess(url)) {
      handlePaymentSuccess();
    } else if (isPaymentCancelled(url)) {
      handlePaymentCancelled();
    } else if (isPaymentFailed(url)) {
      handlePaymentFailed();
    }
  };

  // Handle WebView errors
  const handleWebViewError = (syntheticEvent: any) => {
    // If payment was already handled, don't process errors
    if (paymentHandled) {
      return;
    }

    const { nativeEvent } = syntheticEvent;
    const errorUrl = nativeEvent?.url || "";

    // Use last URL if error URL is empty
    const urlToCheck = errorUrl || lastUrl;

    // FIRST: Check if error URL contains success indicators (status=completed, etc.)
    // This catches the fallback URL: https://api.solextrade.co/api/flutterwave/fallback?status=completed
    if (errorUrl && isPaymentSuccess(errorUrl)) {
      handlePaymentSuccess();
      return;
    }

    // SECOND: Check if error URL or last URL contains redirect URL - treat as success immediately
    // (Flutterwave redirects to callback URL after successful payment, which may fail to load)
    if (
      urlToCheck &&
      urlToCheck.toLowerCase().includes(redirectUrl.toLowerCase())
    ) {
      handlePaymentSuccess();
      return;
    }

    // Check payment status on last URL as well
    // Priority: success > cancelled > failed > error
    if (isPaymentSuccess(urlToCheck)) {
      handlePaymentSuccess();
      return;
    } else if (isPaymentCancelled(errorUrl) || isPaymentCancelled(urlToCheck)) {
      handlePaymentCancelled();
      return;
    } else if (isPaymentFailed(errorUrl) || isPaymentFailed(urlToCheck)) {
      handlePaymentFailed();
      return;
    }

    // Only show error if it's not a payment status URL and not the redirect URL
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

  if (showWebView && paymentUrl) {
    // If WebView should be shown, display it
    return (
      <SafeAreaView style={styles.webViewContainer} edges={["top"]}>
        <StatusBar style="light" />
        {/* WebView Header */}
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            onPress={handleCloseWebView}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={18} color={AppColors.text} />
          </TouchableOpacity>
          <Text style={styles.webViewHeaderTitle}>Flutterwave Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          style={styles.webview}
          onLoadStart={(syntheticEvent) => {
            setWebViewLoading(true);
            // Check URL early when navigation starts
            const url = syntheticEvent.nativeEvent?.url || "";
            if (url && url.toLowerCase().includes(redirectUrl.toLowerCase())) {
              // Redirect URL detected - payment likely successful
              handlePaymentSuccess();
            }
          }}
          onLoadEnd={(syntheticEvent) => {
            setWebViewLoading(false);
            // Check payment status
            const url = syntheticEvent.nativeEvent?.url || "";

            if (!url) return;

            // If URL contains redirect URL, treat as success immediately
            if (url.toLowerCase().includes(redirectUrl.toLowerCase())) {
              handlePaymentSuccess();
              return;
            }

            // Priority: success > cancelled > failed
            if (isPaymentSuccess(url)) {
              handlePaymentSuccess();
            } else if (isPaymentCancelled(url)) {
              handlePaymentCancelled();
            } else if (isPaymentFailed(url)) {
              handlePaymentFailed();
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
    paddingHorizontal: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  content: {
    flex: 1,
    width: "100%",
  },
  amountLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 6,
    textAlign: "center",
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    color: AppColors.text,
    fontWeight: "500",
  },
  noteSection: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primary,
  },
  noteText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  paymentButtonContainer: {
    marginTop: 12,
  },
  paymentButton: {
    width: "100%",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    textAlign: "center",
    lineHeight: 18,
  },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
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
