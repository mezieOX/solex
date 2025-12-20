import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useCryptoCurrencies } from "@/hooks/api/use-crypto";
import {
  useBuyCrypto,
  useSellCrypto,
  useSwapCryptoTrade,
} from "@/hooks/api/use-crypto-trades";
import { useWallets } from "@/hooks/api/use-wallet";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CryptoScreen() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "swap">("buy");
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [currencyModalMode, setCurrencyModalMode] = useState<"from" | "to" | "single">("single");

  // Swap specific state
  const [fromCurrency, setFromCurrency] = useState<any>(null);
  const [toCurrency, setToCurrency] = useState<any>(null);
  const [swapAmount, setSwapAmount] = useState("");

  const { data: currenciesData, isLoading: isLoadingCurrencies } =
    useCryptoCurrencies();
  const { data: walletsData } = useWallets();
  const buyCrypto = useBuyCrypto();
  const sellCrypto = useSellCrypto();
  const swapCrypto = useSwapCryptoTrade();

  // Flatten currencies from networks
  const allCurrencies = useMemo(() => {
    if (!currenciesData?.networks) return [];
    const currencies: any[] = [];
    Object.entries(currenciesData.networks).forEach(([network, coins]) => {
      coins.forEach((coin: any) => {
        currencies.push({
          ...coin,
          network,
        });
      });
    });
    return currencies;
  }, [currenciesData]);

  // Get user's crypto wallets
  const cryptoWallets = useMemo(() => {
    if (!walletsData) return [];
    return walletsData.filter((wallet) => wallet.type === "crypto");
  }, [walletsData]);

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

    // Check if user has enough balance
    const wallet = cryptoWallets.find(
      (w) =>
        w.currency === selectedCurrency.coin &&
        w.network === selectedCurrency.network
    );

    if (!wallet || wallet.balance < parseFloat(amount)) {
      showErrorToast({ message: "Insufficient balance" });
      return;
    }

    try {
      const result = await sellCrypto.mutateAsync({
        currency_id: selectedCurrency.currency_id.toString(),
        amount_crypto: amount.trim(),
      });

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
        from: `${fromCurrency.coin}_${fromCurrency.network}`,
        to: `${toCurrency.coin}_${toCurrency.network}`,
        amount: swapAmount.trim(),
      });

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
        return "logo-ethereum";
      case "USDT":
      case "USDC":
        return "cash";
      case "BNB":
        return "diamond";
      default:
        return "wallet";
    }
  };

  const getCurrencyColor = (coin: string): string => {
    const upperCoin = coin.toUpperCase();
    switch (upperCoin) {
      case "BTC":
        return AppColors.orange;
      case "ETH":
        return AppColors.blue;
      case "USDT":
      case "USDC":
        return AppColors.green;
      case "BNB":
        return AppColors.primary;
      default:
        return AppColors.primary;
    }
  };

  const getWalletBalance = (currency: any): number => {
    const wallet = cryptoWallets.find(
      (w) => w.currency === currency.coin && w.network === currency.network
    );
    return wallet?.balance || 0;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Crypto" />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "buy" && styles.activeTab]}
          onPress={() => setActiveTab("buy")}
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "buy" && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Buy Crypto</Text>
            <Text style={styles.formDescription}>
              Purchase crypto with NGN
            </Text>

            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => {
                setCurrencyModalMode("single");
                setIsCurrencyModalVisible(true);
              }}
            >
              {selectedCurrency ? (
                <View style={styles.selectedCurrency}>
                  <View
                    style={[
                      styles.currencyIcon,
                      { backgroundColor: getCurrencyColor(selectedCurrency.coin) },
                    ]}
                  >
                    <Ionicons
                      name={getCurrencyIcon(selectedCurrency.coin)}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyName}>
                      {selectedCurrency.name}
                    </Text>
                    <Text style={styles.currencyNetwork}>
                      {selectedCurrency.network}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.placeholderText}>
                  Select cryptocurrency
                </Text>
              )}
              <Ionicons
                name="chevron-forward"
                size={24}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>

            <Input
              label="Amount (NGN)"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount in NGN"
              keyboardType="numeric"
              style={styles.input}
            />

            {selectedCurrency && amount.trim() && (
              <View style={styles.estimateContainer}>
                <Text style={styles.estimateLabel}>Estimated:</Text>
                <Text style={styles.estimateValue}>
                  {(
                    parseFloat(amount) / (selectedCurrency.rate_usd || 1)
                  ).toFixed(8)}{" "}
                  {selectedCurrency.coin}
                </Text>
              </View>
            )}

            <Button
              title="Buy Crypto"
              onPress={handleBuy}
              loading={buyCrypto.isPending}
              disabled={!selectedCurrency || !amount.trim() || buyCrypto.isPending}
              style={styles.submitButton}
            />
          </Card>
        )}

        {activeTab === "sell" && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Sell Crypto</Text>
            <Text style={styles.formDescription}>
              Sell crypto for NGN
            </Text>

            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => {
                setCurrencyModalMode("single");
                setIsCurrencyModalVisible(true);
              }}
            >
              {selectedCurrency ? (
                <View style={styles.selectedCurrency}>
                  <View
                    style={[
                      styles.currencyIcon,
                      { backgroundColor: getCurrencyColor(selectedCurrency.coin) },
                    ]}
                  >
                    <Ionicons
                      name={getCurrencyIcon(selectedCurrency.coin)}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyName}>
                      {selectedCurrency.name}
                    </Text>
                    <Text style={styles.currencyNetwork}>
                      {selectedCurrency.network} • Balance:{" "}
                      {getWalletBalance(selectedCurrency).toFixed(8)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.placeholderText}>
                  Select cryptocurrency
                </Text>
              )}
              <Ionicons
                name="chevron-forward"
                size={24}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>

            <Input
              label="Amount (Crypto)"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount to sell"
              keyboardType="numeric"
              style={styles.input}
            />

            {selectedCurrency && amount.trim() && (
              <View style={styles.estimateContainer}>
                <Text style={styles.estimateLabel}>Estimated:</Text>
                <Text style={styles.estimateValue}>
                  ₦
                  {(
                    parseFloat(amount) * (selectedCurrency.rate_usd || 1)
                  ).toLocaleString("en-NG")}
                </Text>
              </View>
            )}

            <Button
              title="Sell Crypto"
              onPress={handleSell}
              loading={sellCrypto.isPending}
              disabled={
                !selectedCurrency ||
                !amount.trim() ||
                sellCrypto.isPending
              }
              style={styles.submitButton}
            />
          </Card>
        )}

        {activeTab === "swap" && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Swap Crypto</Text>
            <Text style={styles.formDescription}>
              Exchange one crypto for another
            </Text>

            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => {
                setCurrencyModalMode("from");
                setIsCurrencyModalVisible(true);
              }}
            >
              {fromCurrency ? (
                <View style={styles.selectedCurrency}>
                  <View
                    style={[
                      styles.currencyIcon,
                      { backgroundColor: getCurrencyColor(fromCurrency.coin) },
                    ]}
                  >
                    <Ionicons
                      name={getCurrencyIcon(fromCurrency.coin)}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyName}>{fromCurrency.name}</Text>
                    <Text style={styles.currencyNetwork}>
                      {fromCurrency.network}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.placeholderText}>From</Text>
              )}
              <Ionicons
                name="chevron-forward"
                size={24}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.swapArrow}>
              <Ionicons
                name="swap-vertical"
                size={24}
                color={AppColors.primary}
              />
            </View>

            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => {
                setCurrencyModalMode("to");
                setIsCurrencyModalVisible(true);
              }}
            >
              {toCurrency ? (
                <View style={styles.selectedCurrency}>
                  <View
                    style={[
                      styles.currencyIcon,
                      { backgroundColor: getCurrencyColor(toCurrency.coin) },
                    ]}
                  >
                    <Ionicons
                      name={getCurrencyIcon(toCurrency.coin)}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyName}>{toCurrency.name}</Text>
                    <Text style={styles.currencyNetwork}>
                      {toCurrency.network}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.placeholderText}>To</Text>
              )}
              <Ionicons
                name="chevron-forward"
                size={24}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>

            <Input
              label="Amount"
              value={swapAmount}
              onChangeText={setSwapAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.input}
            />

            <Button
              title="Swap"
              onPress={handleSwap}
              loading={swapCrypto.isPending}
              disabled={
                !fromCurrency ||
                !toCurrency ||
                !swapAmount.trim() ||
                swapCrypto.isPending
              }
              style={styles.submitButton}
            />
          </Card>
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
              <TouchableOpacity onPress={() => setIsCurrencyModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            {isLoadingCurrencies ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={AppColors.primary} />
              </View>
            ) : (
              <FlatList
                data={allCurrencies}
                keyExtractor={(item) =>
                  `${item.currency_id}_${item.network}`
                }
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
                    >
                      <View
                        style={[
                          styles.currencyIcon,
                          { backgroundColor: getCurrencyColor(item.coin) },
                        ]}
                      >
                        <Ionicons
                          name={getCurrencyIcon(item.coin)}
                          size={24}
                          color="#fff"
                        />
                      </View>
                      <View style={styles.currencyInfo}>
                        <Text style={styles.currencyName}>{item.name}</Text>
                        <Text style={styles.currencyNetwork}>
                          {item.network} • ${item.rate_usd?.toFixed(2) || "0.00"}
                        </Text>
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
                contentContainerStyle={styles.currencyList}
              />
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: AppColors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  activeTabText: {
    color: AppColors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 24,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  selectedCurrency: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  currencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  currencyNetwork: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  placeholderText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    flex: 1,
  },
  input: {
    marginBottom: 0,
  },
  estimateContainer: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  estimateLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
  },
  submitButton: {
    marginTop: 0,
  },
  swapArrow: {
    alignItems: "center",
    marginVertical: 16,
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
  },
  currencyItemSelected: {
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
});
