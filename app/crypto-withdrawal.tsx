import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { useCryptoCurrencies } from "@/hooks/api/use-crypto";
import { showErrorToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as ClipboardLib from "expo-clipboard";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CryptoWallet {
  id: number;
  name: string;
  symbol: string;
  rate_usd: number;
  min_deposit: string | null;
  fee_network: string | null;
  networkName: string;
}

const filterOptions = ["BTC", "USDT", "ETC"];

export default function CryptoWithdrawalScreen() {
  const router = useRouter();
  const { data: currenciesData, isLoading, error } = useCryptoCurrencies();
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(
    null
  );
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [amount, setAmount] = useState("200.00");
  const [narration, setNarration] = useState("Salary");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%", "90%"], []);

  // Initialize defaults from API networks/currencies
  useEffect(() => {
    if (!currenciesData?.networks) return;
    const nets = Object.keys(currenciesData.networks);
    if (!selectedNetwork && nets.length > 0) {
      setSelectedNetwork(nets[0]);
      const firstCoin = currenciesData.networks[nets[0]]?.[0];
      if (firstCoin) {
        setSelectedWallet({ ...firstCoin, networkName: nets[0] });
      }
    }
  }, [currenciesData, selectedNetwork]);

  const networkFee = useMemo(() => {
    if (!selectedWallet?.fee_network) return 0;
    const fee = parseFloat(selectedWallet.fee_network);
    return isNaN(fee) ? 0 : fee;
  }, [selectedWallet]);
  const totalAmount = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    return (amt + networkFee).toFixed(10);
  }, [amount, networkFee]);

  const BackDrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        disappearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleOpenSheet = () => {
    bottomSheetRef.current?.present();
  };

  const handleSelectWallet = (wallet: CryptoWallet) => {
    setSelectedWallet(wallet);
    bottomSheetRef.current?.dismiss();
  };

  const handleMaxAmount = () => {
    // Placeholder balance; replace with real balance when available
    const balance = 250;
    setAmount(balance.toFixed(2));
  };

  const handlePasteAddress = async () => {
    try {
      const text = await ClipboardLib.getStringAsync();
      setCryptoAddress(text);
    } catch (error) {
      // Handle error
    }
  };

  // Filter wallets based on search and filter
  const filteredWallets = useMemo(() => {
    if (!currenciesData?.networks || !selectedNetwork) return [];
    let filtered =
      currenciesData.networks[selectedNetwork]?.map((coin) => ({
        ...coin,
        networkName: selectedNetwork,
      })) || [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wallet) =>
          wallet.name.toLowerCase().includes(query) ||
          wallet.symbol.toLowerCase().includes(query)
      );
    }

    if (selectedFilter) {
      filtered = filtered.filter((wallet) => wallet.symbol === selectedFilter);
    }

    return filtered;
  }, [currenciesData, selectedNetwork, searchQuery, selectedFilter]);

  const handleContinue = () => {
    if (!cryptoAddress.trim() || !amount.trim()) {
      showErrorToast({ message: "Please enter address and amount" });
      return;
    }
    if (!selectedWallet) {
      showErrorToast({ message: "Select a crypto asset" });
      return;
    }

    router.push({
      pathname: "/crypto-withdrawal-success",
      params: {
        wallet: JSON.stringify(selectedWallet),
        network: selectedNetwork,
        address: cryptoAddress,
        amount: amount,
        narration: narration,
        networkFee: networkFee.toString(),
        totalAmount: totalAmount,
      },
    });
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
        {error && (
          <Text style={[styles.emptyText, { marginBottom: 16 }]}>
            Failed to load assets. Pull to retry.
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

          <TouchableOpacity
            style={styles.walletCard}
            onPress={handleOpenSheet}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.walletIcon,
                { backgroundColor: AppColors.surface },
              ]}
            >
              <Text style={styles.walletIconText}>
                {selectedWallet?.symbol?.[0] || "?"}
              </Text>
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>
                {selectedWallet?.name || "Select asset"}
              </Text>
              <Text style={styles.walletSymbol}>
                {selectedWallet?.symbol || ""}
              </Text>
            </View>
            <View style={styles.walletPrice}>
              <Text style={styles.walletPriceValue}>
                {selectedWallet
                  ? `$${selectedWallet.rate_usd.toLocaleString()}`
                  : ""}
              </Text>
              {selectedWallet?.min_deposit && (
                <Text style={styles.walletPriceChange}>
                  Min: {selectedWallet.min_deposit}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Choose Network Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Network</Text>
          <View style={styles.networkContainer}>
            {(currenciesData?.networks
              ? Object.keys(currenciesData.networks)
              : []
            ).map((network) => (
              <TouchableOpacity
                key={network}
                style={[
                  styles.networkTag,
                  selectedNetwork === network && styles.networkTagSelected,
                ]}
                onPress={() => setSelectedNetwork(network)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.networkTagText,
                    selectedNetwork === network &&
                      styles.networkTagTextSelected,
                  ]}
                >
                  {network}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
                  onPress={() => {
                    // Handle QR scanner
                  }}
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
              <Text style={styles.maxButton}>Max</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={AppColors.textMuted}
            />
          </View>
          <Text style={styles.balanceText}>
            Network fee: {networkFee || "0"}
          </Text>
        </View>

        {/* Narration Input */}
        <View style={styles.section}>
          <Input
            label="Narration"
            placeholder="Enter narration (optional)"
            value={narration}
            onChangeText={setNarration}
          />
        </View>

        {/* Fees and Total */}
        <View style={styles.feesSection}>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Network Fees:</Text>
            <Text style={styles.feesValue}>{networkFee}</Text>
          </View>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Total Amount:</Text>
            <Text style={styles.feesValue}>{totalAmount}</Text>
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
          style={styles.button}
        />
      </ScrollView>

      {/* Bottom Sheet for Wallet Selection */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enableOverDrag={false}
        handleComponent={null}
        index={1}
        backdropComponent={BackDrop}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetView}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Choose Wallet</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()}>
              <Ionicons name="close" size={24} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Input
              placeholder="Search......"
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
          <View style={styles.filterContainer}>
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedFilter(selectedFilter === filter ? null : filter)
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter && styles.filterButtonTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.walletList}
          >
            {filteredWallets.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No wallets found</Text>
              </View>
            ) : (
              filteredWallets.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  style={[
                    styles.walletListItem,
                    selectedWallet?.id === wallet.id &&
                      styles.walletListItemSelected,
                  ]}
                  onPress={() => handleSelectWallet(wallet)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.walletIcon,
                      { backgroundColor: AppColors.surface },
                    ]}
                  >
                    <Text style={styles.walletIconText}>
                      {wallet.symbol[0]}
                    </Text>
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>{wallet.name}</Text>
                    <Text style={styles.walletSymbol}>{wallet.symbol}</Text>
                  </View>
                  <View style={styles.walletPrice}>
                    <Text style={styles.walletPriceValue}>
                      ${wallet.rate_usd.toLocaleString()}
                    </Text>
                    {wallet.min_deposit && (
                      <Text style={styles.walletPriceChange}>
                        Min: {wallet.min_deposit}
                      </Text>
                    )}
                  </View>
                  {selectedWallet?.id === wallet.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={AppColors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))
            )}
            {filteredWallets.length > 0 && (
              <Text style={styles.swipeHint}>Swap up for all Wallet</Text>
            )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
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
  networkContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  networkTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  networkTagSelected: {
    backgroundColor: AppColors.primary + "20",
    borderColor: AppColors.primary,
  },
  networkTagText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  networkTagTextSelected: {
    color: AppColors.primary,
    fontWeight: "600",
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
    fontSize: 16,
    color: AppColors.text,
    fontWeight: "600",
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
  bottomSheetBackground: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
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
  walletList: {
    flex: 1,
  },
  walletListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  walletListItemSelected: {
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  swipeHint: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    opacity: 0.6,
  },
});
