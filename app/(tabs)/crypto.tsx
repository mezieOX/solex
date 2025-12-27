import Skeleton, { SkeletonText } from "@/components/skeleton";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import {
  useCryptoCurrencies,
  useCryptoPrices,
  useExchangeRateByCurrencyId,
} from "@/hooks/api/use-crypto";
import { useBuyCrypto, useSellCrypto } from "@/hooks/api/use-crypto-trades";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000]; // NGN amounts

export default function CryptoScreen() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [currencyModalMode, setCurrencyModalMode] =
    useState<"single">("single");
  const [currencySearchQuery, setCurrencySearchQuery] = useState("");

  const {
    data: currenciesData,
    isLoading: isLoadingCurrencies,
    refetch: refetchCurrencies,
  } = useCryptoCurrencies();
  const buyCrypto = useBuyCrypto();
  const sellCrypto = useSellCrypto();

  // Get exchange rate for buying/selling crypto to/from NGN
  const amountForExchangeRate = useMemo(() => {
    return Number(amount) || 0;
  }, [amount]);

  const currencyIdForExchangeRate = useMemo(() => {
    return selectedCurrency?.currency_id;
  }, [selectedCurrency]);

  const {
    data: exchangeRateData,
    isLoading: isLoadingExchangeRate,
    error: exchangeRateError,
  } = useExchangeRateByCurrencyId(
    currencyIdForExchangeRate,
    null,
    activeTab,
    amountForExchangeRate
  );

  // Get crypto prices for selected currencies
  const cryptoIds = useMemo(() => {
    const ids: string[] = [];
    if (selectedCurrency) {
      const coinMap: Record<string, string> = {
        BTC: "bitcoin",
        ETH: "ethereum",
        USDT: "tether",
        USDC: "usd-coin",
        BNB: "binancecoin",
      };
      const id = coinMap[selectedCurrency.coin.toUpperCase()];
      if (id) ids.push(id);
    }
    return ids;
  }, [selectedCurrency]);

  const { data: cryptoPrices } = useCryptoPrices(cryptoIds, "usd", 30000);

  // Get all currencies from API (now flat array)
  const allCurrencies = useMemo(() => {
    if (!currenciesData?.currencies) return [];
    return currenciesData.currencies;
  }, [currenciesData]);

  // Filter currencies based on search query
  const filteredCurrencies = useMemo(() => {
    if (!currencySearchQuery.trim()) return allCurrencies;
    const query = currencySearchQuery.toLowerCase().trim();
    return allCurrencies.filter(
      (currency) =>
        currency.name?.toLowerCase().includes(query) ||
        currency.coin?.toLowerCase().includes(query) ||
        currency.network?.toLowerCase().includes(query)
    );
  }, [allCurrencies, currencySearchQuery]);

  // Get price and change for currency
  const getCurrencyPriceData = (currency: any) => {
    if (!cryptoPrices || !currency) return { price: 0, change: 0 };
    const coinMap: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      USDC: "usd-coin",
      BNB: "binancecoin",
    };
    const id = coinMap[currency.coin.toUpperCase()];
    if (!id) return { price: currency.rate_usd || 0, change: 0 };
    const priceData = cryptoPrices.find((p) => p.id === id);

    // For buy/sell, use exchange rate from API if available, otherwise fallback to CoinGecko
    if (
      (activeTab === "buy" || activeTab === "sell") &&
      exchangeRateData?.rate_ngn_per_1
    ) {
      return {
        price: exchangeRateData.rate_ngn_per_1,
        change: priceData?.price_change_percentage_24h || 0,
      };
    }

    // Fallback to CoinGecko prices
    return {
      price: priceData?.current_price || currency.rate_usd || 0,
      change: priceData?.price_change_percentage_24h || 0,
    };
  };

  const handleBuy = async () => {
    if (!selectedCurrency || !amount.trim()) {
      showErrorToast({ message: "Please select a currency and enter amount" });
      return;
    }

    try {
      const result = await buyCrypto.mutateAsync({
        currency_id: selectedCurrency.currency_id.toString(),
        amount_ngn: amount.trim(),
      });
      refetchCurrencies();
      if (result) {
        showSuccessToast({ message: "Crypto purchased successfully" });
        setAmount("");
        setSelectedCurrency(null);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to purchase crypto. Please try again.";
      showErrorToast({ message: errorMessage });
    }
  };

  const handleSell = async () => {
    if (!selectedCurrency || !amount.trim()) {
      showErrorToast({ message: "Please select a currency and enter amount" });
      return;
    }

    try {
      const result = await sellCrypto.mutateAsync({
        currency_id: selectedCurrency.currency_id.toString(),
        amount_crypto: amount.trim(),
      });
      refetchCurrencies();
      if (result) {
        showSuccessToast({ message: "Crypto sold successfully" });
        setAmount("");
        setSelectedCurrency(null);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to sell crypto. Please try again.";
      showErrorToast({ message: errorMessage });
    }
  };

  const getCurrencyIcon = (coin: string): keyof typeof Ionicons.glyphMap => {
    const upperCoin = coin.toUpperCase();
    switch (upperCoin) {
      case "BTC":
        return "logo-bitcoin";
      case "ETH":
        return "diamond";
      case "USDT":
      case "USDC":
        return "cash";
      case "BNB":
        return "diamond";
      default:
        return "wallet";
    }
  };

  const getCurrencyGradient = (coin: string): [string, string] => {
    const upperCoin = coin.toUpperCase();
    switch (upperCoin) {
      case "BTC":
        return [AppColors.orange, "#FF8C00"];
      case "ETH":
        return [AppColors.blue, "#0051D5"];
      case "USDT":
      case "USDC":
        return [AppColors.green, "#00A86B"];
      case "BNB":
        return [AppColors.primary, AppColors.primaryDark];
      default:
        return [AppColors.primary, AppColors.primaryDark];
    }
  };

  const formatBalance = (amount: number) => {
    return `$${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const formatNGN = (amount: number) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Crypto" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "buy" && styles.activeTab]}
            onPress={() => setActiveTab("buy")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "buy" && styles.activeTabText,
              ]}
            >
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "sell" && styles.activeTab]}
            onPress={() => setActiveTab("sell")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "sell" && styles.activeTabText,
              ]}
            >
              Sell
            </Text>
          </TouchableOpacity>
        </View>

        {/* Buy Tab */}
        {activeTab === "buy" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>SELECT CRYPTO</Text>
            <TouchableOpacity
              style={styles.cryptoSelector}
              onPress={() => {
                setCurrencyModalMode("single");
                setIsCurrencyModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              {selectedCurrency ? (
                <>
                  <LinearGradient
                    colors={getCurrencyGradient(selectedCurrency.coin)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cryptoIcon}
                  >
                    <Ionicons
                      name={getCurrencyIcon(selectedCurrency.coin)}
                      size={18}
                      color="#fff"
                    />
                  </LinearGradient>
                  <View style={styles.cryptoInfo}>
                    <Text style={styles.cryptoName}>
                      {selectedCurrency.coin}
                    </Text>
                    <Text style={styles.cryptoFullName}>
                      {selectedCurrency.name}
                    </Text>
                  </View>
                  <View style={styles.cryptoPrice}>
                    <Text style={styles.cryptoPriceValue}>
                      {formatBalance(
                        getCurrencyPriceData(selectedCurrency).price
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.cryptoPriceChange,
                        getCurrencyPriceData(selectedCurrency).change >= 0
                          ? styles.positiveChange
                          : styles.negativeChange,
                      ]}
                    >
                      {getCurrencyPriceData(selectedCurrency).change >= 0
                        ? "+"
                        : ""}
                      {getCurrencyPriceData(selectedCurrency).change.toFixed(1)}
                      %
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.placeholderText}>
                  Select cryptocurrency
                </Text>
              )}
              <Ionicons
                name="chevron-down"
                size={16}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>AMOUNT</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.amountPrefix}>₦</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={AppColors.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAmountText}>
                    {quickAmount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedCurrency && amount.trim() && (
              <View style={styles.estimateContainer}>
                <Text style={styles.estimateLabel}>You will receive:</Text>
                <Text style={styles.estimateValue}>
                  {isLoadingExchangeRate
                    ? "Calculating..."
                    : exchangeRateError
                    ? "An Error Occurred"
                    : exchangeRateData?.receive_text || "0"}
                </Text>
              </View>
            )}

            <LinearGradient
              colors={[AppColors.primary, AppColors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <TouchableOpacity
                onPress={handleBuy}
                disabled={
                  !selectedCurrency || !amount.trim() || buyCrypto.isPending
                }
                style={styles.actionButtonTouchable}
                activeOpacity={0.8}
              >
                {buyCrypto.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trending-up" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      Buy {selectedCurrency?.coin || "Crypto"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Sell Tab */}
        {activeTab === "sell" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>SELECT CRYPTO</Text>
            <TouchableOpacity
              style={styles.cryptoSelector}
              onPress={() => {
                setCurrencyModalMode("single");
                setIsCurrencyModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              {selectedCurrency ? (
                <>
                  <LinearGradient
                    colors={getCurrencyGradient(selectedCurrency.coin)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cryptoIcon}
                  >
                    <Ionicons
                      name={getCurrencyIcon(selectedCurrency.coin)}
                      size={18}
                      color="#fff"
                    />
                  </LinearGradient>
                  <View style={styles.cryptoInfo}>
                    <Text style={styles.cryptoName}>
                      {selectedCurrency.coin}
                    </Text>
                    <Text style={styles.cryptoFullName}>
                      {selectedCurrency.name}
                    </Text>
                  </View>
                  <View style={styles.cryptoPrice}>
                    <Text style={styles.cryptoPriceValue}>
                      {formatBalance(
                        getCurrencyPriceData(selectedCurrency).price
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.cryptoPriceChange,
                        getCurrencyPriceData(selectedCurrency).change >= 0
                          ? styles.positiveChange
                          : styles.negativeChange,
                      ]}
                    >
                      {getCurrencyPriceData(selectedCurrency).change >= 0
                        ? "+"
                        : ""}
                      {getCurrencyPriceData(selectedCurrency).change.toFixed(1)}
                      %
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.placeholderText}>
                  Select cryptocurrency
                </Text>
              )}
              <Ionicons
                name="chevron-down"
                size={16}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>AMOUNT</Text>
            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={AppColors.textMuted}
                keyboardType="numeric"
              />
              <Text style={styles.amountSuffix}>
                {selectedCurrency?.coin || ""}
              </Text>
            </View>

            {selectedCurrency && (
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceInfoText}>
                  Available: {selectedCurrency?.balance} {selectedCurrency.coin}
                </Text>
                <TouchableOpacity
                  onPress={() => setAmount(selectedCurrency?.balance || "0")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.maxButton}>MAX</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedCurrency && amount.trim() && (
              <View style={styles.estimateContainer}>
                <Text style={styles.estimateLabel}>You will receive:</Text>
                {isLoadingExchangeRate ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <ActivityIndicator size="small" color={AppColors.primary} />
                    <Text style={styles.estimateValue}>Calculating...</Text>
                  </View>
                ) : exchangeRateError ? (
                  <Text style={styles.estimateValue}>An Error Occurred</Text>
                ) : exchangeRateData?.receive_text ? (
                  <Text style={styles.estimateValue}>
                    {exchangeRateData.receive_text}
                  </Text>
                ) : exchangeRateData?.rate_ngn_per_1 ? (
                  <Text style={styles.estimateValue}>
                    {formatNGN(
                      parseFloat(amount) * exchangeRateData.rate_ngn_per_1
                    )}
                  </Text>
                ) : (
                  <Text style={styles.estimateValue}>
                    {formatNGN(
                      parseFloat(amount) *
                        getCurrencyPriceData(selectedCurrency).price *
                        1500
                    )}
                  </Text>
                )}
              </View>
            )}

            <LinearGradient
              colors={["#FF3B30", AppColors.orange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <TouchableOpacity
                onPress={handleSell}
                disabled={
                  !selectedCurrency || !amount.trim() || sellCrypto.isPending
                }
                style={styles.actionButtonTouchable}
                activeOpacity={0.8}
              >
                {sellCrypto.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trending-down" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      Sell {selectedCurrency?.coin || "Crypto"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={isCurrencyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsCurrencyModalVisible(false);
                  setCurrencySearchQuery("");
                }}
              >
                <Ionicons name="close" size={20} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={14}
                color={AppColors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search currencies..."
                placeholderTextColor={AppColors.textMuted}
                value={currencySearchQuery}
                onChangeText={setCurrencySearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {currencySearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setCurrencySearchQuery("")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={AppColors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {isLoadingCurrencies ? (
              <FlatList
                data={[1, 2, 3, 4, 5]}
                keyExtractor={(item) => item.toString()}
                renderItem={() => (
                  <View style={styles.currencyItem}>
                    <Skeleton
                      type="square"
                      size={48}
                      style={styles.skeletonCurrencyIcon}
                    />
                    <View style={styles.currencyInfo}>
                      <SkeletonText
                        width="60%"
                        height={16}
                        style={styles.skeletonCurrencyName}
                      />
                      <SkeletonText
                        width="50%"
                        height={14}
                        style={styles.skeletonCurrencyNetwork}
                      />
                    </View>
                  </View>
                )}
                {...({ contentContainerStyle: styles.currencyList } as any)}
              />
            ) : (
              <FlatList
                data={filteredCurrencies}
                keyExtractor={(item) => `${item.currency_id}_${item.network}`}
                renderItem={({ item }) => {
                  const isSelected =
                    selectedCurrency?.currency_id === item.currency_id &&
                    selectedCurrency?.network === item.network;

                  const balance = item.balance || 0;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.currencyItem,
                        isSelected && styles.currencyItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedCurrency(item);
                        setIsCurrencyModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.currencyIconImage}
                        contentFit="contain"
                      />
                      <View style={styles.currencyInfo}>
                        <Text style={styles.currencyName}>{item.name}</Text>
                        <View style={styles.currencyBalanceContainer}>
                          <Text style={styles.currencyNetwork}>
                            {item.network}
                          </Text>
                          <Text style={styles.currencyBalance}>
                            {balance} {item.coin}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={AppColors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                {...({ contentContainerStyle: styles.currencyList } as any)}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  currencyBalanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 20,
  },
  balanceCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    marginRight: 6,
  },
  balanceLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 6,
  },
  balanceChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceChangeText: {
    fontSize: 11,
    color: AppColors.green,
    fontWeight: "600",
  },
  balanceChangePercentage: {
    fontSize: 11,
    color: AppColors.green,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: AppColors.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTab: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  activeTabText: {
    color: AppColors.primary,
  },
  tabContent: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 9,
    color: AppColors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  cryptoSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 8,
  },
  cryptoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 2,
  },
  cryptoFullName: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  cryptoPrice: {
    alignItems: "flex-end",
  },
  cryptoPriceValue: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 2,
  },
  cryptoPriceChange: {
    fontSize: 10,
    fontWeight: "600",
  },
  positiveChange: {
    color: AppColors.green,
  },
  negativeChange: {
    color: AppColors.error,
  },
  placeholderText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    flex: 1,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 6,
  },
  amountPrefix: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  amountSuffix: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primary,
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  quickAmountButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  quickAmountText: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.text,
  },
  balanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceInfoText: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  maxButton: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.primary,
  },
  estimateContainer: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  estimateLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },
  actionButton: {
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
  },
  actionButtonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 12,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  currencyList: {
    paddingBottom: 12,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 8,
  },
  currencyItemSelected: {
    borderColor: AppColors.primary,
    borderWidth: 2,
    alignItems: "center",
  },
  currencyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyIconImage: {
    width: 36,
    height: 36,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.text,
  },
  currencyNetwork: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  currencyBalance: {
    fontSize: 10,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  skeletonCurrencyIcon: {
    marginRight: 10,
    borderRadius: 18,
  },
  skeletonCurrencyName: {
    marginBottom: 4,
  },
  skeletonCurrencyNetwork: {
    marginTop: 0,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 6,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: AppColors.text,
    padding: 0,
  },
});
