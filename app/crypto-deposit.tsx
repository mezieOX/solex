import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useCryptoCurrencies } from "@/hooks/api/use-crypto";
import { CryptoCurrency } from "@/services/api/crypto";
import { showErrorToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
const getCryptoColor = (symbol: string | undefined | null): string => {
  if (!symbol) return AppColors.primary;
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
const getCryptoIcon = (symbol: string | undefined | null) => {
  if (!symbol) return require("@/assets/images/bitcoin.png");
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
  const [selectedCurrency, setSelectedCurrency] =
    useState<CryptoCurrency | null>(null);
  const [selectedNetworkName, setSelectedNetworkName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [networkSearchQuery, setNetworkSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isNetworkModalVisible, setIsNetworkModalVisible] = useState(false);
  const [isCoinModalVisible, setIsCoinModalVisible] = useState(false);

  // Extract networks from API data
  const networks = useMemo(() => {
    if (!currenciesData?.networks) return [];
    return Object.keys(currenciesData.networks).map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
    }));
  }, [currenciesData]);

  // Filter networks based on search
  const filteredNetworks = useMemo(() => {
    if (!networkSearchQuery.trim()) return networks;
    const query = networkSearchQuery.toLowerCase();
    return networks.filter((network) =>
      network.name.toLowerCase().includes(query)
    );
  }, [networks, networkSearchQuery]);

  // Get all currencies from all networks (for modal)
  const allCurrencies = useMemo(() => {
    if (!currenciesData?.networks) return [];
    const currencies: CryptoCurrency[] = [];
    Object.values(currenciesData.networks).forEach((networkCurrencies) => {
      currencies.push(...networkCurrencies);
    });
    // Remove duplicates based on currency_id
    const uniqueCurrencies = currencies.filter(
      (currency, index, self) =>
        index === self.findIndex((c) => c.currency_id === currency.currency_id)
    );
    return uniqueCurrencies;
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

  const handleOpenSheet = () => {
    setIsCoinModalVisible(true);
  };

  const handleOpenNetworkSheet = () => {
    setIsNetworkModalVisible(true);
  };

  const handleSelectCurrency = (currency: CryptoCurrency) => {
    setSelectedCurrency(currency);
    // Find which network this currency belongs to
    if (currenciesData?.networks) {
      for (const [networkName, currencies] of Object.entries(
        currenciesData.networks
      )) {
        if (currencies.some((c) => c.currency_id === currency.currency_id)) {
          setSelectedNetworkName(networkName);
          break;
        }
      }
    }
    setIsCoinModalVisible(false);
    setSearchQuery(""); // Clear search when currency is selected
  };

  const handleSelectNetwork = (networkName: string) => {
    setSelectedNetworkName(networkName);
    // Select first currency from the network if none selected
    const currencies = currenciesData?.networks[networkName] || [];
    if (
      currencies.length > 0 &&
      (!selectedCurrency ||
        selectedCurrency.currency_id !== currencies[0].currency_id)
    ) {
      setSelectedCurrency(currencies[0]);
    }
    setIsNetworkModalVisible(false);
    setNetworkSearchQuery(""); // Clear search when network is selected
  };

  // Filter currencies based on search and filter (for modal - shows all currencies)
  const filteredCurrencies = useMemo(() => {
    let filtered = allCurrencies;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (currency) =>
          currency.name?.toLowerCase().includes(query) ||
          currency.coin?.toLowerCase().includes(query)
      );
    }

    // Apply symbol filter
    if (selectedFilter) {
      filtered = filtered.filter(
        (currency) => currency.coin === selectedFilter
      );
    }

    return filtered;
  }, [allCurrencies, searchQuery, selectedFilter]);

  // Get all unique symbols for filter buttons (from all currencies)
  const availableFilters = useMemo(() => {
    const symbols = new Set<string>();
    allCurrencies.forEach((currency) => {
      if (currency.coin) {
        symbols.add(currency.coin);
      }
    });
    return Array.from(symbols).slice(0, 3); // Limit to 3 filters
  }, [allCurrencies]);

  return (
    <View style={styles.container}>
      <ScreenTitle title="Crypto Deposit" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Choose Network Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Network</Text>
            <TouchableOpacity onPress={handleOpenNetworkSheet}>
              <Ionicons name="chevron-down" size={24} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={AppColors.primary} />
            </View>
          ) : selectedNetworkName ? (
            <TouchableOpacity
              style={styles.walletCard}
              onPress={handleOpenNetworkSheet}
              activeOpacity={0.8}
            >
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>{selectedNetworkName}</Text>
                <Text style={styles.walletSymbol}>
                  {networkCurrencies.length}{" "}
                  {networkCurrencies.length === 1 ? "currency" : "currencies"}{" "}
                  available
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No network selected</Text>
            </View>
          )}
        </View>

        {/* Choose Wallet Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Coin</Text>
            <TouchableOpacity onPress={handleOpenSheet}>
              <Ionicons name="chevron-down" size={24} color={AppColors.text} />
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
              <View style={[styles.walletIcon]}>
                <Image
                  source={{ uri: selectedCurrency.image_url }}
                  style={styles.walletIconImage}
                  contentFit="contain"
                />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>{selectedCurrency.name}</Text>
                {selectedCurrency.coin ? (
                  <Text style={styles.walletSymbol}>
                    {selectedCurrency.coin}
                  </Text>
                ) : null}
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
                currencyId: selectedCurrency.currency_id.toString(),
                wallet: JSON.stringify({
                  id: selectedCurrency.currency_id,
                  name: selectedCurrency.name,
                  symbol: selectedCurrency.coin,
                }),
                network: selectedNetworkName,
              },
            });
          }}
          disabled={!selectedCurrency || isLoading}
          style={styles.button}
        />
      </ScrollView>

      {/* Modal for Coin Selection */}
      <Modal
        visible={isCoinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsCoinModalVisible(false);
          setSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setIsCoinModalVisible(false);
              setSearchQuery("");
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Coin</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsCoinModalVisible(false);
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
                placeholder="Search coin..."
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
                style={styles.countryList}
                contentContainerStyle={styles.countryListContent}
                showsVerticalScrollIndicator={true}
              >
                {filteredCurrencies.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No currencies found</Text>
                  </View>
                ) : (
                  filteredCurrencies.map((currency) => {
                    const isSelected =
                      selectedCurrency?.currency_id === currency.currency_id;
                    return (
                      <TouchableOpacity
                        key={currency.currency_id}
                        style={[
                          styles.countryItem,
                          isSelected && styles.countryItemSelected,
                        ]}
                        onPress={() => handleSelectCurrency(currency)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.walletIcon]}>
                          <Image
                            source={{ uri: currency.image_url }}
                            style={styles.walletIconImage}
                            contentFit="contain"
                          />
                        </View>
                        <View style={styles.countryInfo}>
                          <View>
                            <Text style={styles.countryName}>
                              {currency.name}
                            </Text>
                            {currency.coin ? (
                              <Text style={styles.countryDialCode}>
                                {currency.coin}
                              </Text>
                            ) : null}
                          </View>
                          <View style={styles.walletPrice}>
                            <Text style={styles.walletPriceValue}>
                              {formatPrice(currency.rate_usd)}
                            </Text>
                          </View>
                        </View>
                        {isSelected && (
                          <View
                            style={[
                              styles.checkIconContainer,
                              {
                                marginLeft: 12,
                                marginTop: 0,
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
                    );
                  })
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal for Network Selection */}
      <Modal
        visible={isNetworkModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsNetworkModalVisible(false);
          setNetworkSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setIsNetworkModalVisible(false);
              setNetworkSearchQuery("");
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Network</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsNetworkModalVisible(false);
                  setNetworkSearchQuery("");
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Input
                placeholder="Search network..."
                value={networkSearchQuery}
                onChangeText={setNetworkSearchQuery}
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

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={AppColors.primary} />
              </View>
            ) : error ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Failed to load networks</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.countryList}
                contentContainerStyle={styles.countryListContent}
                showsVerticalScrollIndicator={true}
              >
                {filteredNetworks.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      {networkSearchQuery.trim()
                        ? "No networks found"
                        : "No networks available"}
                    </Text>
                  </View>
                ) : (
                  filteredNetworks.map((network) => (
                    <TouchableOpacity
                      key={network.id}
                      style={[
                        styles.countryItem,
                        selectedNetworkName === network.name &&
                          styles.countryItemSelected,
                      ]}
                      onPress={() => handleSelectNetwork(network.name)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.countryInfo}>
                        <Text style={styles.countryName}>{network.name}</Text>
                        <Text style={styles.countryDialCode}>
                          {currenciesData?.networks[network.name]?.length || 0}{" "}
                          {currenciesData?.networks[network.name]?.length === 1
                            ? "currency"
                            : "currencies"}{" "}
                          available
                        </Text>
                      </View>
                      {selectedNetworkName === network.name && (
                        <View style={styles.checkIconContainer}>
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  walletIconImage: {
    width: 40,
    height: 40,
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
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    marginBottom: 20,
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
});
