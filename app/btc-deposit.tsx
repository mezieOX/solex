import { AppColors } from "@/constants/theme";
import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ClipboardLib from "expo-clipboard";
import { useCryptoDepositAddress } from "@/hooks/api/use-crypto";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import QRCode from "react-native-qrcode-svg";

// Helper function to get crypto icon color
const getCryptoColor = (symbol: string): string => {
  const colors: { [key: string]: string } = {
    BTC: AppColors.orange,
    ETH: AppColors.blue,
    USDT: AppColors.green,
    BNB: AppColors.orange,
    SOL: AppColors.purple || AppColors.blue,
    TRX: AppColors.red,
    NOT: AppColors.orange,
  };
  return colors[symbol.toUpperCase()] || AppColors.primary;
};

// Helper function to get crypto icon
const getCryptoIcon = (symbol: string) => {
  const icons: { [key: string]: any } = {
    BTC: require("@/assets/images/bitcoin.png"),
    ETH: require("@/assets/images/eth.png"),
    USDT: require("@/assets/images/usdt.png"),
  };
  return icons[symbol.toUpperCase()] || require("@/assets/images/bitcoin.png");
};

export default function BTCDepositScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [copied, setCopied] = useState(false);

  const currencyId = useMemo(() => {
    const id = params.currencyId as string;
    return id ? parseInt(id, 10) : null;
  }, [params.currencyId]);

  const selectedNetwork = useMemo(() => {
    return (params.network as string) || "Bitcoin";
  }, [params.network]);

  const selectedWallet = useMemo(() => {
    try {
      if (params.wallet) {
        const wallet = JSON.parse(params.wallet as string);
        return wallet;
      }
    } catch {
      // Fallback to default
    }
    return { name: "Bitcoin", symbol: "BTC" };
  }, [params.wallet]);

  // Fetch deposit address from API
  const { data: addressData, isLoading: isLoadingAddress, error: addressError } =
    useCryptoDepositAddress(currencyId);

  const depositAddress = addressData?.address || "";
  const minDeposit = addressData?.minimum_deposit || "0.00";
  const confirmationsRequired = addressData?.confirmations_required || 0;

  const handleCopyAddress = async () => {
    if (!depositAddress) {
      showErrorToast({ message: "Address not available" });
      return;
    }
    await ClipboardLib.setStringAsync(depositAddress);
    setCopied(true);
    showSuccessToast({ message: `${selectedWallet.symbol} address copied to clipboard` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BTC Deposit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selected Crypto */}
        <View style={styles.cryptoInfo}>
          <View style={[styles.cryptoIcon, { backgroundColor: getCryptoColor(selectedWallet.symbol) }]}>
            <Image
              source={getCryptoIcon(selectedWallet.symbol)}
              style={styles.cryptoIconImage}
              contentFit="contain"
            />
          </View>
          <Text style={styles.cryptoName}>{selectedWallet.name}</Text>
        </View>

        {/* Network Selection */}
        <View style={styles.networkSection}>
          <Text style={styles.networkLabel}>Choose Network</Text>
          <View style={styles.networkTag}>
            <Text style={styles.networkTagText}>{selectedNetwork}</Text>
          </View>
        </View>

        {/* QR Code Section */}
        {isLoadingAddress ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Loading deposit address...</Text>
          </View>
        ) : addressError || !depositAddress ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={AppColors.error} />
            <Text style={styles.errorText}>
              {addressError ? "Failed to load deposit address" : "Address not available"}
            </Text>
            <Button
              title="Retry"
              onPress={() => router.back()}
              style={styles.retryButton}
            />
          </View>
        ) : (
          <>
            <View style={styles.qrSection}>
              <Text style={styles.instructionText}>
                Scan the QR code to get receiver address
              </Text>
              <View style={styles.qrCodeContainer}>
                <QRCode value={depositAddress} size={210} color="#000" backgroundColor="#fff" />
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Address Section */}
            <View style={styles.addressSection}>
              <Text style={styles.addressLabel}>
                Your {selectedWallet.name} Address
              </Text>
              <View style={styles.addressContainer}>
                <Text style={styles.addressText}>{depositAddress}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyAddress}
                >
                  <Ionicons
                    name={copied ? "checkmark-circle" : "copy-outline"}
                    size={20}
                    color={copied ? AppColors.green : AppColors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Deposit Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Minimum Deposit</Text>
                <Text style={styles.infoValue}>
                  {minDeposit} {selectedWallet.symbol}
                </Text>
              </View>
              {confirmationsRequired > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Deposit Arrival</Text>
                  <Text style={styles.infoValue}>
                    {confirmationsRequired} {confirmationsRequired === 1 ? "Confirmation" : "Confirmations"}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {!isLoadingAddress && depositAddress && (
          <Button
            title="Save Address"
            onPress={() => {
              showSuccessToast({ message: "Address saved successfully" });
            }}
            style={styles.button}
          />
        )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cryptoInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cryptoIconImage: {
    width: 24,
    height: 24,
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
  },
  networkSection: {
    marginBottom: 24,
  },
  networkLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 12,
  },
  networkTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  networkTagText: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "500",
  },
  qrSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  qrCodeContainer: {
    width: 250,
    height: 250,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: AppColors.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  addressSection: {
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.text,
    fontFamily: "monospace",
    lineHeight: 18,
  },
  copyButton: {
    marginLeft: 12,
    padding: 8,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  button: {
    marginTop: 20,
  },
});

