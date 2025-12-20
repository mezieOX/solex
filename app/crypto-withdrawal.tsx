import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { useWithdrawCrypto, useWithdrawFees } from "@/hooks/api/use-crypto";
import { useWallets } from "@/hooks/api/use-wallet";
import { Wallet } from "@/services/api/wallet";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ClipboardLib from "expo-clipboard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Helper function to get crypto icon color
const getCryptoColor = (symbol: string): string => {
  const colors: { [key: string]: string } = {
    BTC: AppColors.orange,
    ETH: AppColors.blue,
    USDT: AppColors.green,
    BNB: AppColors.orange,
    SOL: AppColors.blue,
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

// Format balance
const formatBalance = (balance: number): string => {
  if (balance === 0) return "0.00";
  if (balance < 0.01) return balance.toFixed(8);
  return balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
};

export default function CryptoWithdrawalScreen() {
  const router = useRouter();
  const {
    data: walletsData,
    isLoading: walletsLoading,
    error: walletsError,
  } = useWallets();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [cryptoAddress, setCryptoAddress] = useState("");
  const cryptoAddressRef = useRef(cryptoAddress);
  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const [isQRScannerVisible, setIsQRScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const withdrawCrypto = useWithdrawCrypto();

  // Debounced amount for API calls
  const [debouncedAmount, setDebouncedAmount] = useState("");

  // Filter only crypto wallets
  const cryptoWallets = useMemo(() => {
    if (!walletsData) return [];
    return walletsData.filter((wallet) => wallet.type === "crypto");
  }, [walletsData]);

  // Set default wallet when data loads
  useEffect(() => {
    if (cryptoWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(cryptoWallets[0]);
    }
  }, [cryptoWallets, selectedWallet]);

  // Debounce amount input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [amount]);

  // Fetch withdrawal fees when amount, wallet, or address changes
  const { data: feesData, isLoading: feesLoading } = useWithdrawFees(
    selectedWallet?.id || null,
    cryptoAddress,
    debouncedAmount,
    debouncedAmount.trim().length > 0 &&
      selectedWallet !== null &&
      cryptoAddress.trim().length > 0
  );

  // Get network fee from API response
  const networkFee = useMemo(() => {
    if (feesData?.fee_network !== undefined) {
      return feesData.fee_network;
    }
    return 0;
  }, [feesData]);

  // Format network fee for display
  const formattedNetworkFee = useMemo(() => {
    if (networkFee === 0) return "0";
    if (networkFee < 0.01) return networkFee.toFixed(8);
    return networkFee.toFixed(8);
  }, [networkFee]);

  const totalAmount = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    if (feesData?.amount_debited !== undefined) {
      return feesData.amount_debited.toFixed(10);
    }
    return (amt + networkFee).toFixed(10);
  }, [amount, networkFee, feesData]);

  const handleOpenSheet = () => {
    setIsWalletModalVisible(true);
  };

  const handleSelectWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsWalletModalVisible(false);
    setSearchQuery(""); // Clear search when wallet is selected
  };

  const handleMaxAmount = () => {
    if (selectedWallet) {
      setAmount(selectedWallet.balance.toFixed(8));
    }
  };

  // Update ref whenever cryptoAddress changes
  useEffect(() => {
    cryptoAddressRef.current = cryptoAddress;
  }, [cryptoAddress]);

  const handleCopyAddress = async () => {
    // Use ref to get the most current value - this ensures we have the latest value
    const currentValue = cryptoAddressRef.current || cryptoAddress;

    if (!currentValue || !currentValue.trim()) {
      return;
    }

    try {
      // Copy to clipboard using system standard API
      // DO NOT modify state - only copy to clipboard
      await ClipboardLib.setStringAsync(currentValue.trim());
      showSuccessToast({
        message: "Address copied to clipboard",
      });
    } catch (error) {
      console.error("Clipboard error:", error);
      showErrorToast({
        message: "Failed to copy to clipboard",
      });
    }
  };

  const handlePasteAddress = async () => {
    if (cryptoAddress && cryptoAddress.trim()) {
      // If there's a value, copy it instead
      handleCopyAddress();
      return;
    }

    try {
      const clipboardText = await ClipboardLib.getStringAsync();
      if (clipboardText && clipboardText.trim()) {
        setCryptoAddress(clipboardText.trim());
        showSuccessToast({
          message: "Address pasted from clipboard",
        });
      } else {
        showErrorToast({
          message: "No text found in clipboard",
        });
      }
    } catch (error) {
      console.error("Clipboard error:", error);
      showErrorToast({
        message: "Failed to access clipboard",
      });
    }
  };

  const handleScanQRCode = async () => {
    // Check camera permissions
    if (!permission) {
      // Permission is still being requested
      return;
    }

    if (!permission.granted) {
      // Request permission
      const result = await requestPermission();
      if (!result.granted) {
        showErrorToast({
          message: "Camera permission is required to scan QR codes",
        });
        return;
      }
    }

    setIsQRScannerVisible(true);
  };

  const handleQRCodeScanned = (result: { data: string; type?: string }) => {
    if (result?.data) {
      setCryptoAddress(result.data);
      setIsQRScannerVisible(false);
      showSuccessToast({
        message: "QR code scanned successfully",
      });
    }
  };

  // Filter wallets based on search and filter
  const filteredWallets = useMemo(() => {
    let filtered = cryptoWallets;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wallet) =>
          wallet.currency.toLowerCase().includes(query) ||
          (wallet.meta?.network &&
            wallet.meta.network.toLowerCase().includes(query))
      );
    }

    // Apply currency filter
    if (selectedFilter) {
      filtered = filtered.filter(
        (wallet) => wallet.currency === selectedFilter
      );
    }

    return filtered;
  }, [cryptoWallets, searchQuery, selectedFilter]);

  // Get all unique currencies for filter buttons
  const availableFilters = useMemo(() => {
    const currencies = new Set<string>();
    cryptoWallets.forEach((wallet) => {
      currencies.add(wallet.currency);
    });
    return Array.from(currencies).slice(0, 3); // Limit to 3 filters
  }, [cryptoWallets]);

  const handleContinue = () => {
    if (!cryptoAddress.trim() || !amount.trim()) {
      showErrorToast({ message: "Please enter address and amount" });
      return;
    }
    if (!selectedWallet) {
      showErrorToast({ message: "Please select a wallet" });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showErrorToast({ message: "Please enter a valid amount" });
      return;
    }

    if (amountNum > selectedWallet.balance) {
      showErrorToast({ message: "Insufficient balance" });
      return;
    }

    withdrawCrypto.mutate(
      {
        wallet_id: selectedWallet.id,
        address_to: cryptoAddress,
        amount: amount,
        destination_tag: selectedWallet.meta?.destinationTag || "",
      },
      {
        onSuccess: (response) => {
          showSuccessToast({
            message: response.message || "Withdrawal initiated",
          });

          router.push({
            pathname: "/crypto-withdrawal-success",
            params: {
              wallet: JSON.stringify(selectedWallet),
              network: selectedWallet.meta?.network || "",
              address: cryptoAddress,
              amount: amount,
              networkFee: networkFee.toString(),
              totalAmount: totalAmount,
              data: JSON.stringify(response.data ?? {}),
              message: response.message ?? "",
            },
          });
        },
        onError: (err: any) => {
          const msg =
            err?.message ||
            err?.data?.message ||
            "Failed to initiate withdrawal";
          showErrorToast({ message: msg });
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crypto Withdrawal</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {walletsError && (
          <Text style={[styles.emptyText, { marginBottom: 16 }]}>
            Failed to load wallets. Pull to retry.
          </Text>
        )}
        {/* Choose Wallet Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Wallet</Text>
            <TouchableOpacity onPress={handleOpenSheet}>
              <Ionicons name="chevron-down" size={24} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          {walletsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={AppColors.primary} />
            </View>
          ) : selectedWallet ? (
            <TouchableOpacity
              style={styles.walletCard}
              onPress={handleOpenSheet}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.walletIcon,
                  { backgroundColor: getCryptoColor(selectedWallet.currency) },
                ]}
              >
                <Image
                  source={getCryptoIcon(selectedWallet.currency)}
                  style={styles.walletIconImage}
                  contentFit="contain"
                />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>{selectedWallet.currency}</Text>
                <Text style={styles.walletSymbol}>
                  {selectedWallet.meta?.network || "Network"}
                </Text>
              </View>
              <View style={styles.walletPrice}>
                <Text style={styles.walletPriceValue}>
                  {formatBalance(selectedWallet.balance)}
                </Text>
                <Text style={styles.walletPriceChange}>Balance</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No wallet selected</Text>
            </View>
          )}
        </View>

        {/* Crypto Address Input */}
        <View style={styles.section}>
          <Input
            label="Crypto Address"
            placeholder="Enter crypto address"
            value={cryptoAddress}
            onChangeText={setCryptoAddress}
            rightIcon={
              <View style={styles.addressIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleScanQRCode}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={20}
                    color={AppColors.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handlePasteAddress}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={
                      cryptoAddress && cryptoAddress.trim()
                        ? "copy-outline"
                        : "clipboard-outline"
                    }
                    size={20}
                    color={AppColors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            }
          />
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <View style={styles.amountHeader}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TouchableOpacity onPress={handleMaxAmount}>
              <Text style={styles.maxButton}>
                Max ~ {selectedWallet?.currency}{" "}
                {formatBalance(selectedWallet?.balance || 0)}
              </Text>
            </TouchableOpacity>
          </View>
          <Input
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor={AppColors.textMuted}
          />
          <Text style={styles.balanceText}>
            Network fee: {feesLoading ? "..." : formattedNetworkFee}
          </Text>
        </View>

        {/* Fees and Total */}
        <View style={styles.feesSection}>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Network Fees:</Text>
            <Text style={styles.feesValue}>
              {feesLoading ? "..." : formattedNetworkFee}
            </Text>
          </View>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Total Amount:</Text>
            <Text style={styles.feesValue}>
              {feesLoading ? "..." : totalAmount}
            </Text>
          </View>
        </View>

        {/* Warning Message */}
        <View style={styles.warningContainer}>
          <Ionicons
            name="warning-outline"
            size={20}
            color={AppColors.orange}
            style={styles.warningIcon}
          />
          <Text style={styles.warningText}>
            To ensure your crypto address is correct, always double-check it
            before sending or receiving fund.
          </Text>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={withdrawCrypto.isPending}
          disabled={withdrawCrypto.isPending || !selectedWallet}
          style={styles.button}
        />
      </ScrollView>

      {/* Modal for Wallet Selection */}
      <Modal
        visible={isWalletModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsWalletModalVisible(false);
          setSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setIsWalletModalVisible(false);
              setSearchQuery("");
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Wallet</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsWalletModalVisible(false);
                  setSearchQuery("");
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Input
                placeholder="Search wallet..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                leftIcon={
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={AppColors.textSecondary}
                  />
                }
              />
            </View>

            {/* Filter Buttons */}
            {availableFilters.length > 0 && (
              <View style={styles.filterContainer}>
                {availableFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      selectedFilter === filter && styles.filterButtonActive,
                    ]}
                    onPress={() =>
                      setSelectedFilter(
                        selectedFilter === filter ? null : filter
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedFilter === filter &&
                          styles.filterButtonTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {walletsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={AppColors.primary} />
              </View>
            ) : walletsError ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Failed to load wallets</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.countryList}
                contentContainerStyle={styles.countryListContent}
                showsVerticalScrollIndicator={true}
              >
                {filteredWallets.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No wallets found</Text>
                  </View>
                ) : (
                  filteredWallets.map((wallet) => (
                    <TouchableOpacity
                      key={wallet.id}
                      style={[
                        styles.countryItem,
                        selectedWallet?.id === wallet.id &&
                          styles.countryItemSelected,
                      ]}
                      onPress={() => handleSelectWallet(wallet)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.walletIcon,
                          { backgroundColor: getCryptoColor(wallet.currency) },
                        ]}
                      >
                        <Image
                          source={getCryptoIcon(wallet.currency)}
                          style={styles.walletIconImage}
                          contentFit="contain"
                        />
                      </View>
                      <View style={styles.countryInfo}>
                        <View>
                          <Text style={styles.countryName}>
                            {wallet.currency}
                          </Text>
                          <Text style={styles.countryDialCode}>
                            {wallet.meta?.network || "Network"}
                          </Text>
                        </View>
                        <View style={styles.walletPrice}>
                          <Text style={styles.walletPriceValue}>
                            {formatBalance(wallet.balance)}
                          </Text>
                        </View>
                      </View>
                      {selectedWallet?.id === wallet.id && (
                        <View
                          style={[
                            styles.checkIconContainer,
                            {
                              marginLeft: 12,
                              marginTop: -5,
                            },
                          ]}
                        >
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={AppColors.primary}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal
        visible={isQRScannerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsQRScannerVisible(false)}
      >
        <View style={styles.qrScannerContainer}>
          <View style={styles.qrScannerHeader}>
            <Text style={styles.qrScannerTitle}>Scan QR Code</Text>
            <TouchableOpacity
              onPress={() => setIsQRScannerVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={AppColors.text} />
            </TouchableOpacity>
          </View>
          {permission?.granted ? (
            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={handleQRCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
              />
              <View style={styles.scannerOverlay}>
                <View style={styles.scannerFrame} />
                <Text style={styles.scannerHint}>
                  Position the QR code within the frame
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.permissionContainer}>
              <Ionicons
                name="camera-outline"
                size={64}
                color={AppColors.textSecondary}
              />
              <Text style={styles.permissionText}>
                Camera permission is required to scan QR codes
              </Text>
              <Button
                title="Grant Permission"
                onPress={requestPermission}
                style={styles.permissionButton}
              />
            </View>
          )}
        </View>
      </Modal>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  walletIconText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },
  walletIconImage: {
    width: 32,
    height: 32,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    padding: 20,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  errorText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
  },
  closeButton: {
    padding: 4,
  },
  countryList: {
    flex: 1,
  },
  countryListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border + "30",
  },
  countryItemSelected: {
    backgroundColor: AppColors.primary + "10",
  },
  countryInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countryName: {
    fontSize: 16,
    color: AppColors.text,
    fontWeight: "500",
  },
  countryDialCode: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginRight: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  walletSymbol: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  walletPrice: {
    alignItems: "flex-end",
  },
  walletPriceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  walletPriceChange: {
    fontSize: 12,
  },
  addressIcons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  amountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  maxButton: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: "600",
  },
  amountContainer: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  amountInput: {
    color: AppColors.text,
  },
  balanceText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  feesSection: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  feesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  feesLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  feesValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: AppColors.orange + "30",
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  button: {
    marginTop: 20,
  },
  searchContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  filterButtonActive: {
    backgroundColor: AppColors.primary + "20",
    borderColor: AppColors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  qrScannerContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  qrScannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  qrScannerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: AppColors.primary,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  scannerHint: {
    marginTop: 20,
    fontSize: 14,
    color: AppColors.text,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    minWidth: 200,
  },
});
