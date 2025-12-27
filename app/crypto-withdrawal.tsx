import Error from "@/components/error";
import Skeleton, { SkeletonText } from "@/components/skeleton";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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
  const params = useLocalSearchParams();
  const {
    data: walletsData,
    isLoading: walletsLoading,
    error: walletsError,
    refetch: refetchWallets,
    isRefetching: isRefetchingWallets,
  } = useWallets();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [cryptoAddress, setCryptoAddress] = useState("");
  const cryptoAddressRef = useRef(cryptoAddress);
  const [amount, setAmount] = useState("");
  const [destinationTag, setDestinationTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const [isQRScannerVisible, setIsQRScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const withdrawCrypto = useWithdrawCrypto();

  // Debounced amount and address for API calls
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const [debouncedAddress, setDebouncedAddress] = useState("");

  // Filter only crypto wallets
  const cryptoWallets = useMemo(() => {
    if (!walletsData) return [];
    return walletsData.filter((wallet) => wallet.type === "crypto");
  }, [walletsData]);

  // Get selected currency from params if available
  const selectedCurrency = useMemo(() => {
    try {
      if (params.currency) {
        return JSON.parse(params.currency as string);
      }
    } catch {
      // Fallback to default
    }
    return null;
  }, [params.currency]);

  // Get balance from params (previous screen) or from selected wallet
  const displayBalance = useMemo(() => {
    if (selectedCurrency?.balance !== undefined) {
      return selectedCurrency.balance;
    }
    return selectedWallet?.balance || 0;
  }, [selectedCurrency?.balance, selectedWallet?.balance]);

  // Set default wallet when data loads or match with selected currency
  useEffect(() => {
    if (cryptoWallets.length > 0 && !selectedWallet) {
      if (selectedCurrency) {
        // Try to find matching wallet by currency symbol and network
        const matchingWallet = cryptoWallets.find(
          (wallet) =>
            wallet.currency.toUpperCase() ===
              selectedCurrency.symbol?.toUpperCase() &&
            wallet.meta?.network === selectedCurrency.network
        );
        if (matchingWallet) {
          setSelectedWallet(matchingWallet);
          return;
        }
      }
      // Fallback to first wallet
      setSelectedWallet(cryptoWallets[0]);
    }
  }, [cryptoWallets, selectedWallet, selectedCurrency]);

  // Debounce amount input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [amount]);

  // Debounce address input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAddress(cryptoAddress);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [cryptoAddress]);

  // Fetch withdrawal fees automatically when wallet, address, and amount are provided
  const {
    data: feesData,
    isLoading: feesLoading,
    error: feesError,
  } = useWithdrawFees(
    selectedCurrency?.id || null,
    debouncedAddress,
    debouncedAmount,
    debouncedAmount.trim().length > 0 &&
      selectedCurrency !== null &&
      debouncedAddress.trim().length > 0
  );

  // Show error toast when fees fetch fails (only if address and amount are entered)
  useEffect(() => {
    if (
      feesError &&
      debouncedAddress.trim().length > 1 &&
      debouncedAmount.trim().length > 1
    ) {
      const errorMessage =
        (feesError as any)?.message ||
        (feesError as any)?.data?.message ||
        "Failed to fetch withdrawal fees";
      showErrorToast({ message: errorMessage });
    }
  }, [feesError, debouncedAddress, debouncedAmount]);

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

  const handleSelectWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsWalletModalVisible(false);
    setSearchQuery(""); // Clear search when wallet is selected
  };

  const handleMaxAmount = () => {
    if (displayBalance > 0) {
      setAmount(displayBalance.toFixed(8));
    }
  };

  // Update ref whenever cryptoAddress changes
  useEffect(() => {
    cryptoAddressRef.current = cryptoAddress;
  }, [cryptoAddress]);

  const handlePasteAddress = async () => {
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

    if (amountNum > displayBalance) {
      showErrorToast({ message: "Insufficient balance" });
      return;
    }

    withdrawCrypto.mutate(
      {
        currency_id: selectedCurrency?.id,
        address_to: cryptoAddress,
        amount: amount,
        destination_tag:
          destinationTag.trim() ||
          selectedWallet.meta?.destinationTag ||
          undefined,
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
              destinationTag: destinationTag.trim() || "",
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
          <Ionicons name="arrow-back" size={20} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCurrency?.name} Withdrawal
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {walletsError ? (
          <Error
            message="Failed to load wallets"
            onRetry={() => refetchWallets()}
            isLoading={isRefetchingWallets}
          />
        ) : (
          <>
            {/* Selected Crypto */}
            {selectedWallet && (
              <>
                <View style={styles.cryptoInfo}>
                  <Image
                    source={{
                      uri:
                        selectedCurrency?.image_url ||
                        selectedWallet.meta?.image_url ||
                        "",
                    }}
                    style={styles.cryptoIconImage}
                    contentFit="contain"
                  />
                  <Text style={styles.cryptoName}>
                    {selectedCurrency?.name || selectedWallet.currency}
                  </Text>
                </View>

                {/* Network Selection */}
                <View style={styles.networkSection}>
                  <View style={styles.networkTag}>
                    <Text style={styles.networkTagText}>
                      Network:{" "}
                      {selectedCurrency?.network ||
                        selectedWallet.meta?.network ||
                        "Network"}
                    </Text>
                  </View>
                </View>
              </>
            )}

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
                        name="clipboard-outline"
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
                    Balance: {formatBalance(displayBalance)}
                    {` ${selectedCurrency?.symbol}`}
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
            </View>

            {/* Destination Tag Input */}
            <View style={styles.section}>
              <Input
                label="Destination Tag (Optional)"
                placeholder="Enter destination tag if required"
                value={destinationTag}
                onChangeText={setDestinationTag}
                keyboardType="default"
                placeholderTextColor={AppColors.textMuted}
              />
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
                color={AppColors.red}
                style={styles.warningIcon}
              />
              <Text style={styles.warningText}>
                You can only withdraw{" "}
                <Text style={styles.warningTextHighlight}>
                  {selectedCurrency?.name || selectedWallet?.currency}
                </Text>{" "}
                coin to{" "}
                <Text style={styles.warningTextHighlight}>
                  {selectedCurrency?.network ||
                    selectedWallet?.meta?.network ||
                    "Network"}
                </Text>{" "}
                Address (Do not paste any other wallet here)
              </Text>
            </View>

            <Button
              title="Continue"
              onPress={handleContinue}
              loading={withdrawCrypto.isPending}
              disabled={withdrawCrypto.isPending || !selectedWallet}
              style={styles.button}
            />
          </>
        )}
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
              <ScrollView
                style={styles.countryList}
                contentContainerStyle={styles.countryListContent}
                showsVerticalScrollIndicator={false}
              >
                {[1, 2, 3, 4, 5].map((index) => (
                  <View key={index} style={styles.countryItem}>
                    <Skeleton
                      type="circle"
                      size={40}
                      style={styles.skeletonWalletIcon}
                    />
                    <View style={styles.countryInfo}>
                      <View>
                        <SkeletonText
                          width="50%"
                          height={16}
                          style={styles.skeletonWalletName}
                        />
                        <SkeletonText
                          width="40%"
                          height={14}
                          style={styles.skeletonWalletNetwork}
                        />
                      </View>
                      <View style={styles.walletPrice}>
                        <SkeletonText
                          width={60}
                          height={16}
                          style={styles.skeletonWalletBalance}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
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
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  walletIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
  },
  walletIconImage: {
    width: 28,
    height: 28,
  },
  loadingContainer: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    padding: 12,
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  errorText: {
    fontSize: 12,
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "80%",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  modalTitle: {
    fontSize: 16,
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
    padding: 12,
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
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "500",
  },
  countryDialCode: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginRight: 10,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 2,
  },
  walletSymbol: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  walletPrice: {
    alignItems: "flex-end",
  },
  walletPriceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 2,
  },
  walletPriceChange: {
    fontSize: 10,
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
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  maxButton: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: "600",
  },
  amountContainer: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 6,
  },
  amountInput: {
    color: AppColors.text,
  },
  balanceText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  feesSection: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  feesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  feesLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  feesValue: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.red + "30",
  },
  warningIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: AppColors.red,
    lineHeight: 16,
  },
  warningTextHighlight: {
    color: AppColors.red,
    fontWeight: "600",
  },
  button: {
    marginTop: 12,
  },
  searchContainer: {
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  qrScannerTitle: {
    fontSize: 16,
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
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: AppColors.primary,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  scannerHint: {
    marginTop: 12,
    fontSize: 12,
    color: AppColors.text,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  permissionText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  permissionButton: {
    minWidth: 180,
  },
  skeletonWalletIcon: {
    marginRight: 12,
  },
  skeletonWalletName: {
    marginBottom: 4,
  },
  skeletonWalletNetwork: {
    marginTop: 0,
  },
  skeletonWalletBalance: {
    marginTop: 0,
  },
  cryptoInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cryptoIconImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  networkSection: {
    marginBottom: 12,
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
});
