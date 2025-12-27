import Skeleton, { SkeletonText } from "@/components/skeleton";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import {
  useCryptoCurrencies,
  useCryptoPrices,
  useExchangeRateByCurrencyId,
  useWithdrawCrypto,
  useWithdrawFees,
} from "@/hooks/api/use-crypto";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

const QUICK_AMOUNTS = [0.001, 0.01, 0.1, 1]; // Crypto amounts

export default function ExchangeCryptoScreen() {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [selectedToCurrency, setSelectedToCurrency] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [destinationTag, setDestinationTag] = useState("");
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isToCurrencyModalVisible, setIsToCurrencyModalVisible] =
    useState(false);
  const [currencySearchQuery, setCurrencySearchQuery] = useState("");
  const [toCurrencySearchQuery, setToCurrencySearchQuery] = useState("");
  const [isQRScannerVisible, setIsQRScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const {
    data: currenciesData,
    isLoading: isLoadingCurrencies,
    refetch: refetchCurrencies,
  } = useCryptoCurrencies();
  const withdrawCrypto = useWithdrawCrypto();

  // Get all currencies from API
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

  // Filter target currencies (exclude the selected source currency)
  const filteredToCurrencies = useMemo(() => {
    let filtered = allCurrencies;
    // Exclude the source currency from target list
    if (selectedCurrency) {
      filtered = filtered.filter(
        (currency) =>
          currency.currency_id !== selectedCurrency.currency_id ||
          currency.network !== selectedCurrency.network
      );
    }
    if (!toCurrencySearchQuery.trim()) return filtered;
    const query = toCurrencySearchQuery.toLowerCase().trim();
    return filtered.filter(
      (currency) =>
        currency.name?.toLowerCase().includes(query) ||
        currency.coin?.toLowerCase().includes(query) ||
        currency.network?.toLowerCase().includes(query)
    );
  }, [allCurrencies, toCurrencySearchQuery, selectedCurrency]);

  // Get crypto prices for selected currency
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

  // Get exchange rate using swap endpoint
  const amountForExchangeRate = useMemo(() => {
    return Number(amount) || 0;
  }, [amount]);

  // Get target currency ID for swap destination
  const toCurrencyId = useMemo(() => {
    if (!selectedToCurrency) return null;
    return selectedToCurrency.currency_id || null;
  }, [selectedToCurrency]);

  const { data: exchangeRateData, isLoading: isLoadingExchangeRate } =
    useExchangeRateByCurrencyId(
      selectedCurrency?.currency_id,
      toCurrencyId,
      "swap",
      amountForExchangeRate
    );

  // Get withdrawal fees
  const { data: feesData, isLoading: isLoadingFees } = useWithdrawFees(
    selectedCurrency?.currency_id || null,
    walletAddress,
    amount,
    !!selectedCurrency && !!walletAddress.trim() && !!amount.trim()
  );

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

    // Use exchange rate from API if available (swap uses 'rate', buy/sell uses 'rate_ngn_per_1')
    if (exchangeRateData?.rate_ngn_per_1) {
      return {
        price: exchangeRateData.rate_ngn_per_1,
        change: priceData?.price_change_percentage_24h || 0,
      };
    }
    // For swap endpoint, use rate if available
    if (exchangeRateData?.rate && exchangeRateData?.to_usd) {
      // Convert swap rate to NGN equivalent (assuming to_usd is in USD)
      return {
        price: exchangeRateData.to_usd * 1500, // Approximate USD to NGN conversion
        change: priceData?.price_change_percentage_24h || 0,
      };
    }

    // Fallback to CoinGecko prices
    return {
      price: priceData?.current_price || currency.rate_usd || 0,
      change: priceData?.price_change_percentage_24h || 0,
    };
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

  const formatCrypto = (amount: number, decimals: number = 8) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    }).format(amount);
  };

  // Format amount based on target currency type
  const formatAmountByCurrency = (amount: number, currency: any) => {
    if (!currency) return formatNGN(amount);
    const coinUpper = currency.coin?.toUpperCase() || "";

    // Check if it's a fiat currency (NGN, USD, etc.)
    if (coinUpper === "NGN") {
      return formatNGN(amount);
    }
    if (coinUpper === "USD") {
      return formatBalance(amount);
    }

    // For crypto currencies, format with appropriate decimals
    return `${formatCrypto(amount, 8)} ${currency.coin}`;
  };

  // Calculate receive amount using swap endpoint response
  const receiveAmount = useMemo(() => {
    if (
      !selectedCurrency ||
      !selectedToCurrency ||
      !amount.trim() ||
      !exchangeRateData
    )
      return 0;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return 0;

    // For swap endpoint, use receive_text if available, or calculate from rate
    if (exchangeRateData.receive_text) {
      // Extract amount from receive_text (format: "₦X,XXX.XX" or "X.XX BTC" or similar)
      const amountMatch = exchangeRateData.receive_text.match(/[\d,]+\.?\d*/);
      if (amountMatch) {
        return parseFloat(amountMatch[0].replace(/,/g, "")) || 0;
      }
    }

    // Fallback to rate_ngn_per_1 if available (for buy/sell)
    if (exchangeRateData.rate_ngn_per_1) {
      return amountNum * exchangeRateData.rate_ngn_per_1;
    }

    // For swap, use rate to calculate received amount
    if (exchangeRateData.rate) {
      return amountNum * exchangeRateData.rate;
    }

    return 0;
  }, [selectedCurrency, selectedToCurrency, amount, exchangeRateData]);

  // Calculate total fees
  const totalFees = useMemo(() => {
    if (!feesData) return 0;
    return (feesData.fee_network || 0) + (feesData.fee_service || 0);
  }, [feesData]);

  // Calculate total amount to receive after fees
  const totalReceive = useMemo(() => {
    return Math.max(0, receiveAmount - totalFees);
  }, [receiveAmount, totalFees]);

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
      setWalletAddress(result.data);
      setIsQRScannerVisible(false);
      showSuccessToast({
        message: "QR code scanned successfully",
      });
    }
  };

  const handleContinue = async () => {
    if (!selectedCurrency || !amount.trim() || !walletAddress.trim()) {
      showErrorToast({ message: "Please fill in all required fields" });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showErrorToast({ message: "Please enter a valid amount" });
      return;
    }

    if (
      selectedCurrency.balance &&
      amountNum > parseFloat(selectedCurrency.balance)
    ) {
      showErrorToast({ message: "Insufficient balance" });
      return;
    }

    try {
      const result = await withdrawCrypto.mutateAsync({
        currency_id: selectedCurrency.currency_id,
        address_to: walletAddress.trim(),
        amount: amount.trim(),
        destination_tag: destinationTag.trim() || undefined,
      });
      refetchCurrencies();
      if (result) {
        showSuccessToast({ message: "Withdrawal initiated successfully" });
        router.back();
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to initiate withdrawal. Please try again.";
      showErrorToast({ message: errorMessage });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Exchange Crypto" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Select Cryptocurrency */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FROM</Text>
          <TouchableOpacity
            style={styles.cryptoSelector}
            onPress={() => setIsCurrencyModalVisible(true)}
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
                  <Text style={styles.cryptoName}>{selectedCurrency.coin}</Text>
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
                    {getCurrencyPriceData(selectedCurrency).change.toFixed(1)}%
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.placeholderText}>Select cryptocurrency</Text>
            )}
            <Ionicons
              name="chevron-down"
              size={16}
              color={AppColors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Select Target Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TO</Text>
          <TouchableOpacity
            style={styles.cryptoSelector}
            onPress={() => setIsToCurrencyModalVisible(true)}
            activeOpacity={0.8}
          >
            {selectedToCurrency ? (
              <>
                <LinearGradient
                  colors={getCurrencyGradient(selectedToCurrency.coin)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cryptoIcon}
                >
                  <Ionicons
                    name={getCurrencyIcon(selectedToCurrency.coin)}
                    size={18}
                    color="#fff"
                  />
                </LinearGradient>
                <View style={styles.cryptoInfo}>
                  <Text style={styles.cryptoName}>
                    {selectedToCurrency.coin}
                  </Text>
                  <Text style={styles.cryptoFullName}>
                    {selectedToCurrency.name}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.placeholderText}>Select target currency</Text>
            )}
            <Ionicons
              name="chevron-down"
              size={16}
              color={AppColors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Current Exchange Rate */}
        {selectedCurrency && selectedToCurrency && (
          <View style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <Ionicons name="refresh" size={14} color={AppColors.primary} />
              <Text style={styles.rateTitle}>Current Exchange Rate</Text>
            </View>
            {isLoadingExchangeRate ? (
              <ActivityIndicator size="small" color={AppColors.primary} />
            ) : exchangeRateData?.rate_ngn_per_1 ? (
              <>
                <Text style={styles.rateValue}>
                  1 {selectedCurrency.coin} ={" "}
                  {formatAmountByCurrency(
                    exchangeRateData.rate_ngn_per_1,
                    selectedToCurrency
                  )}
                </Text>
                <Text style={styles.rateUpdate}>Last updated: Just now</Text>
              </>
            ) : exchangeRateData?.rate ? (
              <>
                <Text style={styles.rateValue}>
                  1 {selectedCurrency.coin} ={" "}
                  {formatAmountByCurrency(
                    exchangeRateData.rate,
                    selectedToCurrency
                  )}
                </Text>
                <Text style={styles.rateUpdate}>Last updated: Just now</Text>
              </>
            ) : exchangeRateData?.receive_text ? (
              <>
                <Text style={styles.rateValue}>
                  {exchangeRateData.receive_text}
                </Text>
                <Text style={styles.rateUpdate}>Last updated: Just now</Text>
              </>
            ) : selectedCurrency && selectedToCurrency ? (
              <Text style={styles.rateValue}>
                1 {selectedCurrency.coin} ={" "}
                {formatAmountByCurrency(
                  getCurrencyPriceData(selectedCurrency).price,
                  selectedToCurrency
                )}
              </Text>
            ) : null}
          </View>
        )}

        {/* Amount to Exchange */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>AMOUNT TO EXCHANGE</Text>
          </View>
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
                Available: {selectedCurrency?.balance || 0}{" "}
                {selectedCurrency.coin}
              </Text>
              <TouchableOpacity
                onPress={() => setAmount(selectedCurrency?.balance || "0")}
                activeOpacity={0.7}
              >
                <Text style={styles.maxButton}>MAX</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Amount Buttons */}
          {selectedCurrency && (
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAmountText}>
                    {formatCrypto(quickAmount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* You will receive */}
          {selectedCurrency && selectedToCurrency && amount.trim() && (
            <View style={styles.receiveCard}>
              <Text style={styles.receiveLabel}>You will receive</Text>
              {isLoadingExchangeRate ? (
                <ActivityIndicator size="small" color={AppColors.text} />
              ) : (
                <Text style={styles.receiveAmount}>
                  {formatAmountByCurrency(receiveAmount, selectedToCurrency)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Wallet Address */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WALLET ADDRESS</Text>
          <View style={styles.walletInputContainer}>
            <TextInput
              style={styles.walletInput}
              value={walletAddress}
              onChangeText={setWalletAddress}
              placeholder="Enter your wallet address"
              placeholderTextColor={AppColors.textMuted}
              multiline
            />
            <TouchableOpacity
              style={styles.qrButton}
              onPress={handleScanQRCode}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.qrHint}>
            Or scan QR code to auto-fill address
          </Text>
        </View>

        {/* Destination Tag (optional) */}
        {selectedCurrency?.network === "XRP" && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DESTINATION TAG (Optional)</Text>
            <TextInput
              style={styles.destinationTagInput}
              value={destinationTag}
              onChangeText={setDestinationTag}
              placeholder="Enter destination tag"
              placeholderTextColor={AppColors.textMuted}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Fees */}
        {selectedCurrency && walletAddress.trim() && amount.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FEES</Text>
            {isLoadingFees ? (
              <ActivityIndicator size="small" color={AppColors.primary} />
            ) : feesData ? (
              <>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Network Fee:</Text>
                  <Text style={styles.feeValue}>
                    {formatCrypto(feesData.fee_network || 0)}{" "}
                    {selectedCurrency.coin}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Service Fee:</Text>
                  <Text style={styles.feeValue}>
                    {formatNGN(feesData.fee_service || 0)}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Total Fee:</Text>
                  <Text style={[styles.feeValue, { color: AppColors.primary }]}>
                    {formatNGN(totalFees)}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        )}

        {/* Total Amount to Receive */}
        {selectedCurrency &&
          selectedToCurrency &&
          amount.trim() &&
          walletAddress.trim() && (
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Amount to Receive</Text>
              {isLoadingExchangeRate || isLoadingFees ? (
                <ActivityIndicator size="small" color={AppColors.primary} />
              ) : (
                <Text style={styles.totalAmount}>
                  {formatAmountByCurrency(totalReceive, selectedToCurrency)}
                </Text>
              )}
            </View>
          )}

        {/* Continue Button */}
        <LinearGradient
          colors={[AppColors.primary, AppColors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionButton}
        >
          <TouchableOpacity
            onPress={handleContinue}
            disabled={
              !selectedCurrency ||
              !selectedToCurrency ||
              !amount.trim() ||
              !walletAddress.trim() ||
              withdrawCrypto.isPending
            }
            style={styles.actionButtonTouchable}
            activeOpacity={0.8}
          >
            {withdrawCrypto.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Continue</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
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
                        setCurrencySearchQuery("");
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

      {/* Target Currency Selection Modal */}
      <Modal
        visible={isToCurrencyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsToCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Target Currency</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsToCurrencyModalVisible(false);
                  setToCurrencySearchQuery("");
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
                value={toCurrencySearchQuery}
                onChangeText={setToCurrencySearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {toCurrencySearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setToCurrencySearchQuery("")}
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
                data={filteredToCurrencies}
                keyExtractor={(item) => `${item.currency_id}_${item.network}`}
                renderItem={({ item }) => {
                  const isSelected =
                    selectedToCurrency?.currency_id === item.currency_id &&
                    selectedToCurrency?.network === item.network;

                  const balance = item.balance || 0;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.currencyItem,
                        isSelected && styles.currencyItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedToCurrency(item);
                        setIsToCurrencyModalVisible(false);
                        setToCurrencySearchQuery("");
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
                size={48}
                color={AppColors.textSecondary}
              />
              <Text style={styles.permissionText}>
                Camera permission is required to scan QR codes
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestPermission}
              >
                <Text style={styles.permissionButtonText}>
                  Grant Permission
                </Text>
              </TouchableOpacity>
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
  scrollContent: {
    padding: 10,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
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
  rateCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  rateTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.text,
  },
  rateValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 2,
  },
  rateUpdate: {
    fontSize: 9,
    color: AppColors.textSecondary,
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
  balanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
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
  quickAmounts: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 6,
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
  receiveCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  receiveLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  receiveAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.text,
  },
  walletInputContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
  },
  walletInput: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    color: AppColors.text,
    fontSize: 12,
    minHeight: 40,
    textAlignVertical: "top",
  },
  qrButton: {
    width: 40,
    height: 40,
    backgroundColor: AppColors.primary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  qrHint: {
    fontSize: 9,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  destinationTagInput: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    color: AppColors.text,
    fontSize: 12,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  feeLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  feeValue: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.text,
  },
  totalCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  totalLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.primary,
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
  currencyBalanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  qrScannerContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  qrScannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  qrScannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  closeButton: {
    padding: 4,
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
    fontSize: 11,
    color: AppColors.text,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  permissionButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
