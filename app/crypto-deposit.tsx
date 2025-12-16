import { AppColors } from "@/constants/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCryptoCurrencies } from "@/hooks/api/use-crypto";
import { CryptoCurrency } from "@/services/api/crypto";
import { showErrorToast } from "@/utils/toast";

interface Network {
  id: string;
  name: string;
}

const filterOptions = ["BTC", "USDT", "ETC"];

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

export default function CryptoDepositScreen() {
  const router = useRouter();
  const { data: currenciesData, isLoading, error } = useCryptoCurrencies();
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency | null>(null);
  const [selectedNetworkName, setSelectedNetworkName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%", "90%"], []);

  // Extract networks from API data
  const networks = useMemo(() => {
    if (!currenciesData?.networks) return [];
    return Object.keys(currenciesData.networks).map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
    }));
  }, [currenciesData]);

  // Get currencies for selected network
  const networkCurrencies = useMemo(() => {
    if (!currenciesData?.networks || !selectedNetworkName) return [];
    return currenciesData.networks[selectedNetworkName] || [];
  }, [currenciesData, selectedNetworkName]);

  // Set default selections when data loads
  React.useEffect(() => {
    if (networks.length > 0 && !selectedNetworkName) {
      setSelectedNetworkName(networks[0].name);
    }
    if (networkCurrencies.length > 0 && !selectedCurrency) {
      setSelectedCurrency(networkCurrencies[0]);
    }
  }, [networks, networkCurrencies, selectedNetworkName, selectedCurrency]);

  // Format price
  const formatPrice = (rate: number) => {
    return `$${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rate)}`;
  };

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

  const handleSelectCurrency = (currency: CryptoCurrency) => {
    setSelectedCurrency(currency);
    // Find which network this currency belongs to
    if (currenciesData?.networks) {
      for (const [networkName, currencies] of Object.entries(currenciesData.networks)) {
        if (currencies.some((c) => c.id === currency.id)) {
          setSelectedNetworkName(networkName);
          break;
        }
      }
    }
    bottomSheetRef.current?.dismiss();
  };

  const handleSelectNetwork = (networkName: string) => {
    setSelectedNetworkName(networkName);
    // Select first currency from the network if none selected
    const currencies = currenciesData?.networks[networkName] || [];
    if (currencies.length > 0 && (!selectedCurrency || selectedCurrency.id !== currencies[0].id)) {
      setSelectedCurrency(currencies[0]);
    }
  };

  // Filter currencies based on search and filter
  const filteredCurrencies = useMemo(() => {
    let filtered = networkCurrencies;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (currency) =>
          currency.name.toLowerCase().includes(query) ||
          currency.symbol.toLowerCase().includes(query)
      );
    }

    // Apply symbol filter
    if (selectedFilter) {
      filtered = filtered.filter(
        (currency) => currency.symbol === selectedFilter
      );
    }

    return filtered;
  }, [networkCurrencies, searchQuery, selectedFilter]);

  // Get all unique symbols for filter buttons
  const availableFilters = useMemo(() => {
    const symbols = new Set<string>();
    networkCurrencies.forEach((currency) => {
      symbols.add(currency.symbol);
    });
    return Array.from(symbols).slice(0, 3); // Limit to 3 filters
  }, [networkCurrencies]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crypto Deposit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Choose Wallet Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Wallet</Text>
            <TouchableOpacity onPress={handleOpenSheet}>
              <Ionicons
                name="chevron-down"
                size={24}
                color={AppColors.text}
              />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={AppColors.primary} />
            </View>
          ) : selectedCurrency ? (
            <TouchableOpacity
              style={styles.walletCard}
              onPress={handleOpenSheet}
              activeOpacity={0.8}
            >
              <View style={[styles.walletIcon, { backgroundColor: getCryptoColor(selectedCurrency.symbol) }]}>
                <Image
                  source={getCryptoIcon(selectedCurrency.symbol)}
                  style={styles.walletIconImage}
                  contentFit="contain"
                />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>{selectedCurrency.name}</Text>
                <Text style={styles.walletSymbol}>{selectedCurrency.symbol}</Text>
              </View>
              <View style={styles.walletPrice}>
                <Text style={styles.walletPriceValue}>
                  {formatPrice(selectedCurrency.rate_usd)}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No currency selected</Text>
            </View>
          )}
        </View>

        {/* Choose Network Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Network</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={AppColors.primary} />
            </View>
          ) : (
            <View style={styles.networkContainer}>
              {networks.map((network) => (
                <TouchableOpacity
                  key={network.id}
                  style={[
                    styles.networkTag,
                    selectedNetworkName === network.name && styles.networkTagSelected,
                  ]}
                  onPress={() => handleSelectNetwork(network.name)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.networkTagText,
                      selectedNetworkName === network.name &&
                        styles.networkTagTextSelected,
                    ]}
                  >
                    {network.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Button
          title="Continue"
          onPress={() => {
            if (!selectedCurrency) {
              showErrorToast({ message: "Please select a currency" });
              return;
            }
            router.push({
              pathname: "/btc-deposit",
              params: {
                currencyId: selectedCurrency.id.toString(),
                wallet: JSON.stringify({
                  id: selectedCurrency.id,
                  name: selectedCurrency.name,
                  symbol: selectedCurrency.symbol,
                }),
                network: selectedNetworkName,
              },
            });
          }}
          disabled={!selectedCurrency || isLoading}
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
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AppColors.primary} />
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Failed to load currencies</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.walletList}
            >
              {filteredCurrencies.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No currencies found</Text>
                </View>
              ) : (
                filteredCurrencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.id}
                    style={[
                      styles.walletListItem,
                      selectedCurrency?.id === currency.id && styles.walletListItemSelected,
                    ]}
                    onPress={() => handleSelectCurrency(currency)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.walletIcon, { backgroundColor: getCryptoColor(currency.symbol) }]}>
                      <Image
                        source={getCryptoIcon(currency.symbol)}
                        style={styles.walletIconImage}
                        contentFit="contain"
                      />
                    </View>
                    <View style={styles.walletInfo}>
                      <Text style={styles.walletName}>{currency.name}</Text>
                      <Text style={styles.walletSymbol}>{currency.symbol}</Text>
                    </View>
                    <View style={styles.walletPrice}>
                      <Text style={styles.walletPriceValue}>
                        {formatPrice(currency.rate_usd)}
                      </Text>
                    </View>
                    {selectedCurrency?.id === currency.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={AppColors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
              {filteredCurrencies.length > 0 && (
                <Text style={styles.swipeHint}>Swap up for all Wallet</Text>
              )}
            </ScrollView>
          )}
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
});

