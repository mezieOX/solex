import Skeleton, { SkeletonText } from "@/components/skeleton";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import {
  useCryptoCurrencies,
  useCryptoPrices,
  useExchangeRateByCurrencyId,
} from "@/hooks/api/use-crypto";
import {
  useBuyCrypto,
  useSellCrypto,
  useSwapCryptoTrade,
} from "@/hooks/api/use-crypto-trades";
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
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "swap">("buy");
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [currencyModalMode, setCurrencyModalMode] = useState<
    "from" | "to" | "single"
  >("single");

  // Swap specific state
  const [fromCurrency, setFromCurrency] = useState<any>(null);
  const [toCurrency, setToCurrency] = useState<any>(null);
  const [swapAmount, setSwapAmount] = useState("");
  const [currencySearchQuery, setCurrencySearchQuery] = useState("");

  const {
    data: currenciesData,
    isLoading: isLoadingCurrencies,
    refetch: refetchCurrencies,
  } = useCryptoCurrencies();
  const buyCrypto = useBuyCrypto();
  const sellCrypto = useSellCrypto();
  const swapCrypto = useSwapCryptoTrade();

  // Get exchange rate for buying/selling crypto to/from NGN
  // Use the appropriate amount and currency based on active tab
  const amountForExchangeRate = useMemo(() => {
    if (activeTab === "swap") {
      return Number(swapAmount) || 0;
    }
    return Number(amount) || 0;
  }, [activeTab, amount, swapAmount]);

  const currencyIdForExchangeRate = useMemo(() => {
    if (activeTab === "swap") {
      return fromCurrency?.currency_id;
    }
    return selectedCurrency?.currency_id;
  }, [activeTab, fromCurrency, selectedCurrency]);

  const {
    data: exchangeRateData,
    isLoading: isLoadingExchangeRate,
    error: exchangeRateError,
  } = useExchangeRateByCurrencyId(
    currencyIdForExchangeRate,
    activeTab === "swap" ? toCurrency?.currency_id : null,
    activeTab,
    amountForExchangeRate
  );

  console.log("exchange-rate-data", exchangeRateData);

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
    if (fromCurrency) {
      const coinMap: Record<string, string> = {
        BTC: "bitcoin",
        ETH: "ethereum",
        USDT: "tether",
        USDC: "usd-coin",
        BNB: "binancecoin",
      };
      const id = coinMap[fromCurrency.coin.toUpperCase()];
      if (id && !ids.includes(id)) ids.push(id);
    }
    if (toCurrency) {
      const coinMap: Record<string, string> = {
        BTC: "bitcoin",
        ETH: "ethereum",
        USDT: "tether",
        USDC: "usd-coin",
        BNB: "binancecoin",
      };
      const id = coinMap[toCurrency.coin.toUpperCase()];
      if (id && !ids.includes(id)) ids.push(id);
    }
    return ids;
  }, [selectedCurrency, fromCurrency, toCurrency]);

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

    // For swap, use exchange rate from API if available
    if (activeTab === "swap" && exchangeRateData?.rate !== undefined) {
      return {
        price: exchangeRateData.rate,
        change: 0, // Swap doesn't have change percentage
      };
    }

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

  const handleSwap = async () => {
    if (!fromCurrency || !toCurrency || !swapAmount.trim()) {
      showErrorToast({
        message: "Please select currencies and enter amount",
      });
      return;
    }

    try {
      const result = await swapCrypto.mutateAsync({
        from: fromCurrency.currency_id,
        to: toCurrency.currency_id,
        amount: swapAmount.trim(),
      });
      refetchCurrencies();
      if (result) {
        showSuccessToast({ message: "Crypto swapped successfully" });
        setSwapAmount("");
        setFromCurrency(null);
        setToCurrency(null);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to swap crypto. Please try again.";
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
          <TouchableOpacity
            style={[styles.tab, activeTab === "swap" && styles.activeTab]}
            onPress={() => setActiveTab("swap")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "swap" && styles.activeTabText,
              ]}
            >
              Swap
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
                      size={24}
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
                size={20}
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
                    <Ionicons name="trending-up" size={20} color="#fff" />
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
                      size={24}
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
                size={20}
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
                    <Ionicons name="trending-down" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      Sell {selectedCurrency?.coin || "Crypto"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Swap Tab */}
        {activeTab === "swap" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>FROM</Text>
            <TouchableOpacity
              style={styles.cryptoSelector}
              onPress={() => {
                setCurrencyModalMode("from");
                setIsCurrencyModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              {fromCurrency ? (
                <>
                  <LinearGradient
                    colors={getCurrencyGradient(fromCurrency.coin)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cryptoIcon}
                  >
                    <Ionicons
                      name={getCurrencyIcon(fromCurrency.coin)}
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                  <View style={styles.cryptoInfo}>
                    <Text style={styles.cryptoName}>{fromCurrency.coin}</Text>
                    <Text style={styles.cryptoFullName}>
                      {fromCurrency.name}
                    </Text>
                  </View>
                  <View style={styles.cryptoPrice}>
                    <Text style={styles.cryptoPriceValue}>
                      {formatBalance(getCurrencyPriceData(fromCurrency).price)}
                    </Text>
                    <Text
                      style={[
                        styles.cryptoPriceChange,
                        getCurrencyPriceData(fromCurrency).change >= 0
                          ? styles.positiveChange
                          : styles.negativeChange,
                      ]}
                    >
                      {getCurrencyPriceData(fromCurrency).change >= 0
                        ? "+"
                        : ""}
                      {getCurrencyPriceData(fromCurrency).change.toFixed(1)}%
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.placeholderText}>From</Text>
              )}
              <Ionicons
                name="chevron-down"
                size={20}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                value={swapAmount}
                onChangeText={setSwapAmount}
                placeholder="0.00"
                placeholderTextColor={AppColors.textMuted}
                keyboardType="numeric"
              />
              <Text style={styles.amountSuffix}>
                {fromCurrency?.coin || ""}
              </Text>
            </View>

            {fromCurrency && (
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceInfoText}>
                  Available: {fromCurrency?.balance || 0} {fromCurrency.coin}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setSwapAmount(fromCurrency?.balance?.toString() || "0")
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.maxButton}>MAX</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.swapArrowContainer}>
              <View style={styles.swapArrowCircle}>
                <Ionicons
                  name="swap-vertical"
                  size={24}
                  color={AppColors.primary}
                />
              </View>
            </View>

            <Text style={styles.sectionLabel}>TO</Text>
            <TouchableOpacity
              style={styles.cryptoSelector}
              onPress={() => {
                setCurrencyModalMode("to");
                setIsCurrencyModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              {toCurrency ? (
                <>
                  <LinearGradient
                    colors={getCurrencyGradient(toCurrency.coin)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cryptoIcon}
                  >
                    <Ionicons
                      name={getCurrencyIcon(toCurrency.coin)}
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                  <View style={styles.cryptoInfo}>
                    <Text style={styles.cryptoName}>{toCurrency.coin}</Text>
                    <Text style={styles.cryptoFullName}>{toCurrency.name}</Text>
                  </View>
                  <View style={styles.cryptoPrice}>
                    <Text style={styles.cryptoPriceValue}>
                      {formatBalance(getCurrencyPriceData(toCurrency).price)}
                    </Text>
                    <Text
                      style={[
                        styles.cryptoPriceChange,
                        getCurrencyPriceData(toCurrency).change >= 0
                          ? styles.positiveChange
                          : styles.negativeChange,
                      ]}
                    >
                      {getCurrencyPriceData(toCurrency).change >= 0 ? "+" : ""}
                      {getCurrencyPriceData(toCurrency).change.toFixed(1)}%
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.placeholderText}>To</Text>
              )}
              <Ionicons
                name="chevron-down"
                size={20}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                value={
                  fromCurrency && toCurrency && swapAmount.trim()
                    ? exchangeRateData?.rate !== undefined
                      ? (
                          parseFloat(swapAmount) * exchangeRateData.rate
                        ).toFixed(8)
                      : isLoadingExchangeRate
                      ? "Calculating..."
                      : (
                          (parseFloat(swapAmount) *
                            getCurrencyPriceData(fromCurrency).price) /
                          getCurrencyPriceData(toCurrency).price
                        ).toFixed(8)
                    : "0.00"
                }
                placeholder="0.00"
                placeholderTextColor={AppColors.textMuted}
                keyboardType="numeric"
                editable={false}
              />
              <Text style={styles.amountSuffix}>{toCurrency?.coin || ""}</Text>
            </View>

            {fromCurrency && toCurrency && swapAmount.trim() && (
              <View style={styles.estimateContainer}>
                <Text style={styles.estimateLabel}>Exchange rate:</Text>
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
                ) : exchangeRateData?.rate !== undefined ? (
                  <Text style={styles.estimateValue}>
                    1 {fromCurrency.coin} = {exchangeRateData.rate.toFixed(8)}{" "}
                    {toCurrency.coin}
                  </Text>
                ) : (
                  <Text style={styles.estimateValue}>
                    1 {fromCurrency.coin} ={" "}
                    {(
                      getCurrencyPriceData(fromCurrency).price /
                      getCurrencyPriceData(toCurrency).price
                    ).toFixed(8)}{" "}
                    {toCurrency.coin}
                  </Text>
                )}
              </View>
            )}

            <LinearGradient
              colors={[AppColors.primary, AppColors.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <TouchableOpacity
                onPress={handleSwap}
                disabled={
                  !fromCurrency ||
                  !toCurrency ||
                  !swapAmount.trim() ||
                  swapCrypto.isPending
                }
                style={styles.actionButtonTouchable}
                activeOpacity={0.8}
              >
                {swapCrypto.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    Swap {fromCurrency?.coin || ""} → {toCurrency?.coin || ""}
                  </Text>
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
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
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
                    size={20}
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
                    currencyModalMode === "from"
                      ? fromCurrency?.currency_id === item.currency_id &&
                        fromCurrency?.network === item.network
                      : currencyModalMode === "to"
                      ? toCurrency?.currency_id === item.currency_id &&
                        toCurrency?.network === item.network
                      : selectedCurrency?.currency_id === item.currency_id &&
                        selectedCurrency?.network === item.network;

                  const balance = item.balance || 0;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.currencyItem,
                        isSelected && styles.currencyItemSelected,
                      ]}
                      onPress={() => {
                        if (currencyModalMode === "from") {
                          setFromCurrency(item);
                          setIsCurrencyModalVisible(false);
                        } else if (currencyModalMode === "to") {
                          setToCurrency(item);
                          setIsCurrencyModalVisible(false);
                        } else {
                          setSelectedCurrency(item);
                          setIsCurrencyModalVisible(false);
                        }
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
                          size={24}
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
    padding: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    marginRight: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 8,
  },
  balanceChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceChangeText: {
    fontSize: 14,
    color: AppColors.green,
    fontWeight: "600",
  },
  balanceChangePercentage: {
    fontSize: 14,
    color: AppColors.green,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  activeTabText: {
    color: AppColors.primary,
  },
  tabContent: {
    gap: 16,
  },
  sectionLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cryptoSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 12,
  },
  cryptoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 4,
  },
  cryptoFullName: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  cryptoPrice: {
    alignItems: "flex-end",
  },
  cryptoPriceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  cryptoPriceChange: {
    fontSize: 14,
    fontWeight: "600",
  },
  positiveChange: {
    color: AppColors.green,
  },
  negativeChange: {
    color: AppColors.error,
  },
  placeholderText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    flex: 1,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 8,
  },
  amountPrefix: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
  },
  amountSuffix: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.primary,
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  quickAmountButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  balanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceInfoText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  maxButton: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
  },
  estimateContainer: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  estimateLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
  },
  swapArrowContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  swapArrowCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  actionButton: {
    borderRadius: 16,
    marginTop: 8,
    overflow: "hidden",
  },
  actionButtonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 18,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  currencyList: {
    paddingBottom: 20,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 12,
  },
  currencyItemSelected: {
    borderColor: AppColors.primary,
    borderWidth: 2,
    alignItems: "center",
  },
  currencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyIconImage: {
    width: 48,
    height: 48,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  currencyNetwork: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  currencyBalance: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  skeletonCurrencyIcon: {
    marginRight: 12,
    borderRadius: 24,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 12,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text,
    padding: 0,
  },
});
