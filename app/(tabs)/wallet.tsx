import Empty from "@/components/empty";
import Skeleton, { SkeletonText, SkeletonTitle } from "@/components/skeleton";
import { Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useCryptoPrices } from "@/hooks/api/use-crypto";
import { useWallets } from "@/hooks/api/use-wallet";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// CoinGecko ID mapping
const COIN_GECKO_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binancecoin",
};

// Coin full names mapping
const COIN_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether USDT",
  USDC: "USD Coin",
  BNB: "Binance Coin",
};

interface ActionButton {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: any;
}

const ACTION_BUTTONS: ActionButton[] = [
  {
    id: "send",
    label: "Send",
    icon: "arrow-up",
    route: "/crypto-withdrawal-select" as any,
  },
  {
    id: "receive",
    label: "Receive",
    icon: "arrow-down",
    route: "/crypto-deposit" as any,
  },
  {
    id: "convert",
    label: "convert",
    icon: "swap-horizontal",
    route: "/exchange-crypto" as any,
  },
];

export default function WalletScreen() {
  const { data: walletsData, isLoading, error } = useWallets();
  const [showBalance, setShowBalance] = useState(true);

  // Separate wallets by type
  const { fiatWallets, cryptoWallets } = useMemo(() => {
    if (!walletsData) return { fiatWallets: [], cryptoWallets: [] };

    const fiat = walletsData.filter((wallet) => wallet.type === "fiat");
    const crypto = walletsData.filter((wallet) => wallet.type === "crypto");

    return { fiatWallets: fiat, cryptoWallets: crypto };
  }, [walletsData]);

  // Get CoinGecko IDs for crypto wallets
  const cryptoIds = useMemo(() => {
    if (!cryptoWallets.length) return [];
    const ids = new Set<string>();
    cryptoWallets.forEach((wallet) => {
      const coinId = COIN_GECKO_MAP[wallet.currency.toUpperCase()];
      if (coinId) ids.add(coinId);
    });
    return Array.from(ids);
  }, [cryptoWallets]);

  // Fetch crypto prices
  const { data: cryptoPrices } = useCryptoPrices(cryptoIds, "usd", 30000);

  // Get crypto price and calculate USD value
  const getCryptoPriceData = useCallback(
    (currency: string) => {
      const coinId = COIN_GECKO_MAP[currency.toUpperCase()];
      if (coinId && cryptoPrices) {
        const priceData = cryptoPrices.find((p) => p.id === coinId);
        if (priceData) {
          return {
            price: priceData.current_price,
            change: priceData.price_change_percentage_24h || 0,
          };
        }
      }
      return { price: 0, change: 0 };
    },
    [cryptoPrices]
  );

  // Calculate total crypto balance in USD
  const totalCryptoBalanceUSD = useMemo(() => {
    if (!cryptoWallets.length || !cryptoPrices) return 0;

    return cryptoWallets.reduce((total, wallet) => {
      const priceData = getCryptoPriceData(wallet.currency);
      const usdValue = wallet.balance * priceData.price;

      // For stablecoins like USDT/USDC, if price is 0, assume 1:1 with USD
      const finalUsdValue =
        priceData.price === 0 &&
        (wallet.currency.toUpperCase() === "USDT" ||
          wallet.currency.toUpperCase() === "USDC")
          ? wallet.balance
          : usdValue;

      return total + finalUsdValue;
    }, 0);
  }, [cryptoWallets, cryptoPrices, getCryptoPriceData]);

  // Format USD value
  const formatUSD = (value: number) => {
    return `$${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  };

  // Format holdings (crypto balance)
  const formatHoldings = (balance: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(balance);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScreenTitle title="Wallets" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Fiat Wallets Skeleton */}
          <View style={styles.section}>
            <SkeletonTitle
              width="40%"
              height={20}
              style={styles.sectionTitleSkeleton}
            />
            {[1, 2].map((index) => (
              <View key={index} style={styles.walletCardWrapper}>
                <Card style={styles.walletCard}>
                  <View style={styles.walletHeader}>
                    <Skeleton
                      type="square"
                      size={56}
                      style={styles.skeletonIcon}
                    />
                    <View style={styles.walletInfo}>
                      <SkeletonText
                        width="50%"
                        height={20}
                        style={styles.skeletonCurrency}
                      />
                      <SkeletonText
                        width="60%"
                        height={14}
                        style={styles.skeletonType}
                      />
                    </View>
                  </View>
                  <View style={styles.balanceContainer}>
                    <SkeletonText
                      width="45%"
                      height={13}
                      style={styles.skeletonBalanceLabel}
                    />
                    <SkeletonText
                      width="70%"
                      height={28}
                      style={styles.skeletonBalanceAmount}
                    />
                  </View>
                </Card>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScreenTitle title="Wallets" />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={48}
            color={AppColors.error}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>Failed to load wallets</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="My Wallet" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Balance Card */}
        <View style={styles.balanceSection}>
          <View style={styles.totalBalanceCard}>
            <View style={styles.balanceCardContent}>
              <View style={styles.balanceInfo}>
                <Text style={styles.totalBalanceLabel}>Total Balance</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.totalBalanceAmount}>
                    {showBalance ? formatUSD(totalCryptoBalanceUSD) : "*****"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowBalance(!showBalance)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showBalance ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.balanceIllustration}>
                <Image
                  source={require("@/assets/images/wallet.jpeg")}
                  style={styles.balanceIllustrationImage}
                />
                <View style={styles.decorativeDots}>
                  <View
                    style={[
                      styles.dot,
                      { position: "absolute", top: 10, right: 30 },
                    ]}
                  />
                  <View
                    style={[
                      styles.dot,
                      { position: "absolute", top: 30, right: 50 },
                    ]}
                  />
                  <View
                    style={[
                      styles.dot,
                      { position: "absolute", top: 50, right: 20 },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons: Send, Receive, Convert */}
        <View style={styles.actionSection}>
          <FlatList
            data={ACTION_BUTTONS}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.actionButtonSquare}
                onPress={() => router.push(item.route)}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icon} size={18} color="#fff" />
                <Text style={styles.actionButtonLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.actionButtonsGrid}
            columnWrapperStyle={{
              justifyContent: "space-between",
            }}
          />
        </View>

        {/* Crypto Wallets */}
        {cryptoWallets.length > 0 && (
          <View
            style={[
              styles.section,
              {
                marginTop: -10,
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Assets</Text>
            {cryptoWallets.map((wallet) => {
              const priceData = getCryptoPriceData(wallet.currency);
              const usdValue = wallet.balance;
              const holdings = formatHoldings(wallet.balance);
              const isPositive = priceData.change >= 0;

              return (
                <TouchableOpacity
                  key={wallet.id}
                  style={styles.walletCard}
                  onPress={() =>
                    router.push({
                      pathname: "/crypto-wallet-details",
                      params: {
                        wallet: JSON.stringify(wallet) as any,
                      },
                    } as any)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.coinIcon}>
                    <Image
                      source={{ uri: wallet?.image_url || "" }}
                      style={styles.coinIcon}
                      contentFit="contain"
                    />
                  </View>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.coinTicker}>
                      {wallet.currency}
                      {wallet.network && wallet.network !== wallet.currency && (
                        <Text style={styles.coinName}> ({wallet.network})</Text>
                      )}
                    </Text>
                    <View style={styles.amountUSDContainer}>
                      <Text style={styles.amountUSD}>
                        {formatUSD(usdValue)}
                      </Text>
                      <View style={styles.amountColumn}>
                        {priceData.change !== 0 && (
                          <View style={styles.priceChangeContainer}>
                            <Ionicons
                              name={isPositive ? "arrow-up" : "arrow-down"}
                              size={12}
                              color={
                                isPositive ? AppColors.green : AppColors.red
                              }
                            />
                            <Text
                              style={[
                                styles.priceChange,
                                {
                                  color: isPositive
                                    ? AppColors.green
                                    : AppColors.red,
                                },
                              ]}
                            >
                              {Math.abs(priceData.change).toFixed(2)}%
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.currencyHoldings}>
                    <Text style={styles.holdingsValue}>${holdings}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {fiatWallets.length === 0 && cryptoWallets.length === 0 && (
          <Empty
            title="No wallets found"
            description="You don't have any wallets yet"
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  balanceIllustrationImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  section: {},
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingBottom: 10,
    color: AppColors.text,
    letterSpacing: 0.3,
  },
  walletCardWrapper: {
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 10,
    padding: 12,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coinColumn: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  coinIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  currencyInfo: {
    flex: 1,
  },
  coinInfo: {
    flex: 1,
  },
  coinTickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coinTicker: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 2,
  },
  coinName: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: "400",
  },
  amountColumn: {
    alignItems: "flex-start",
    marginTop: -4,
    marginRight: 10,
    paddingLeft: 4,
  },
  amountUSDContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyHoldings: {
    alignItems: "flex-end",
  },
  holdingsValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 2,
  },
  amountUSD: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: "400",
    marginBottom: 4,
  },
  priceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceChange: {
    fontSize: 10,
    fontWeight: "600",
  },
  pnlColumn: {
    alignItems: "flex-end",
    minWidth: 70,
  },
  pnlValue: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 2,
  },
  pnlPercentage: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: "400",
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  walletInfo: {
    flex: 1,
  },
  walletCurrency: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  walletTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  networkBadge: {
    backgroundColor: AppColors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  networkText: {
    fontSize: 10,
    fontWeight: "600",
    color: AppColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  walletProvider: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  walletType: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  balanceContainer: {
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 14,
  },
  balanceLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.text,
    letterSpacing: 0.3,
  },
  addressContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  copyButtonText: {
    fontSize: 10,
    color: AppColors.primary,
    fontWeight: "600",
  },
  addressBox: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  addressText: {
    fontSize: 11,
    color: AppColors.text,
    fontFamily: "monospace",
    letterSpacing: 0.3,
  },
  sectionTitleSkeleton: {
    marginBottom: 14,
  },
  skeletonIcon: {
    marginRight: 12,
    borderRadius: 12,
  },
  skeletonCurrency: {
    marginBottom: 4,
  },
  skeletonType: {
    marginTop: 0,
  },
  skeletonNetworkBadge: {
    marginRight: 6,
    borderRadius: 6,
  },
  skeletonProvider: {
    marginTop: 0,
  },
  skeletonBalanceLabel: {
    marginBottom: 6,
  },
  skeletonBalanceAmount: {
    marginTop: 0,
  },
  skeletonAddressLabel: {
    marginBottom: 0,
  },
  skeletonCopyButton: {
    borderRadius: 6,
  },
  skeletonAddressText: {
    marginTop: 0,
  },
  balanceSection: {
    marginBottom: 12,
  },
  totalBalanceCard: {
    backgroundColor: AppColors.orange,
    borderRadius: 12,
    padding: 14,
    minHeight: 110,
    overflow: "hidden",
  },
  balanceCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  balanceInfo: {
    flex: 1,
    zIndex: 2,
  },
  totalBalanceLabel: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 6,
    fontWeight: "500",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  totalBalanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  eyeButton: {
    padding: 4,
  },
  balanceIllustration: {
    position: "absolute",
    right: -24,
    top: -24,
    opacity: 0.25,
    zIndex: 1,
  },
  decorativeDots: {
    position: "relative",
    width: 80,
    height: 80,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#fff",
    opacity: 0.4,
  },
  actionSection: {
    marginBottom: 20,
  },
  actionButtonsGrid: {},
  actionButtonSquare: {
    width: "31%",
    aspectRatio: 1.5,
    backgroundColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  actionButtonLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});
