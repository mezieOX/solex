import Skeleton from "@/components/skeleton";
import { Button } from "@/components/ui/button";
import { QRCodeComponent } from "@/components/ui/qr-code";
import { AppColors } from "@/constants/theme";
import { useCryptoDepositAddress } from "@/hooks/api/use-crypto";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as ClipboardLib from "expo-clipboard";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height } = Dimensions.get("window");
export default function BTCDepositScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedDestinationTag, setCopiedDestinationTag] = useState(false);

  const currencyId = useMemo(() => {
    const id = params.currencyId as string;
    return id ? parseInt(id, 10) : null;
  }, [params.currencyId, params.wallet]);

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
  const {
    data: addressData,
    isLoading: isLoadingAddress,
    error: addressError,
  } = useCryptoDepositAddress(currencyId);

  const depositAddress = addressData?.address || "";
  const minDeposit =
    addressData?.min_deposit || selectedWallet.min_deposit || "0.00";
  const confirmationsRequired = addressData?.confirmations_required || 0;
  const destinationTag = addressData?.destinationTag || "";

  const handleCopyAddress = async () => {
    if (!depositAddress) {
      showErrorToast({ message: "Address not available" });
      return;
    }
    await ClipboardLib.setStringAsync(depositAddress);
    setCopiedAddress(true);
    showSuccessToast({
      message: `${selectedWallet.symbol} address copied to clipboard`,
    });
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyDestinationTag = async () => {
    if (!destinationTag) {
      showErrorToast({ message: "Destination tag not available" });
      return;
    }
    await ClipboardLib.setStringAsync(destinationTag);
    setCopiedDestinationTag(true);
    showSuccessToast({
      message: "Destination tag copied to clipboard",
    });
    setTimeout(() => setCopiedDestinationTag(false), 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedWallet.symbol} Deposit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selected Crypto */}
        <View style={styles.cryptoInfo}>
          <Image
            source={{
              uri: selectedWallet.image_url,
            }}
            style={styles.cryptoIconImage}
            contentFit="contain"
          />
          <Text style={styles.cryptoName}>{selectedWallet.name}</Text>
        </View>

        {/* Network Selection */}
        <View style={styles.networkSection}>
          <View style={styles.networkTag}>
            <Text style={styles.networkTagText}>
              Network: {selectedNetwork}
            </Text>
          </View>
        </View>

        {/* QR Code Section */}
        {isLoadingAddress ? (
          <>
            <View style={styles.qrSectionLoder}>
              <View
                style={[
                  styles.qrCodeContainer,
                  {
                    backgroundColor: AppColors.surface,
                  },
                ]}
              >
                <Skeleton
                  type="square"
                  width={100}
                  height={210}
                  style={[
                    styles.skeletonQRCode,
                    {
                      backgroundColor: AppColors.surface,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                />
              </View>
            </View>
          </>
        ) : addressError || !depositAddress ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={AppColors.error}
            />
            <Text style={styles.errorText}>
              {addressError
                ? "Failed to load deposit address"
                : "Address not available"}
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
              <QRCodeComponent
                value={depositAddress}
                size={180}
                label="Scan the QR code to get receiver address"
                showLogo={true}
              />
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
                    name={copiedAddress ? "checkmark-circle" : "copy-outline"}
                    size={16}
                    color={copiedAddress ? AppColors.green : AppColors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Destination Tag Section */}
            {destinationTag ? (
              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>Destination Tag</Text>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressText}>{destinationTag}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyDestinationTag}
                  >
                    <Ionicons
                      name={
                        copiedDestinationTag
                          ? "checkmark-circle"
                          : "copy-outline"
                      }
                      size={16}
                      color={
                        copiedDestinationTag ? AppColors.green : AppColors.text
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

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
                    {confirmationsRequired}{" "}
                    {confirmationsRequired === 1
                      ? "Confirmation"
                      : "Confirmations"}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {!isLoadingAddress && depositAddress && (
          <>
            {/* Warning Section */}
            <View style={styles.warningContainer}>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Security Notice</Text>
                <Text style={styles.warningText}>
                  Please verify the address and network before sending.
                  Cryptocurrency sent to an incorrect address or network will be
                  permanently lost and cannot be recovered.
                </Text>
              </View>
            </View>

            <Button
              title="Save Address"
              onPress={() => {
                showSuccessToast({ message: "Address saved successfully" });
              }}
              style={styles.button}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  qrSectionLoder: {
    alignItems: "center",
    height: height / 1.9,
    justifyContent: "center",
    marginBottom: 50,
  },
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  cryptoInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cryptoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cryptoIconImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  cryptoIconFallback: {
    width: 20,
    height: 20,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  networkSection: {
    marginBottom: 12,
  },
  networkLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 8,
  },
  networkTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  networkTagText: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "500",
  },
  warningContainer: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.orange,
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  warningContent: {
    width: "100%",
  },
  warningTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.orange,
    marginBottom: 6,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  warningText: {
    fontSize: 11,
    color: AppColors.text,
    lineHeight: 14,
    letterSpacing: 0.2,
    fontWeight: "400",
  },
  qrSection: {
    alignItems: "center",
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 10,
    textAlign: "center",
  },
  qrCodeContainer: {
    width: 200,
    height: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  errorContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 12,
    color: AppColors.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  addressSection: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  addressText: {
    flex: 1,
    fontSize: 11,
    color: AppColors.text,
    fontFamily: "monospace",
    lineHeight: 16,
  },
  copyButton: {
    marginLeft: 10,
    padding: 6,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
  },
  button: {
    marginTop: 12,
  },
  skeletonQRCode: {
    borderRadius: 12,
  },
  skeletonInstructionText: {
    marginBottom: 16,
    alignSelf: "center",
  },
  skeletonAddressLabel: {
    marginBottom: 12,
  },
  skeletonAddress: {
    flex: 1,
    marginRight: 12,
  },
});
