import Empty from "@/components/empty";
import Skeleton, { SkeletonText, SkeletonTitle } from "@/components/skeleton";
import { Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useCryptoPrices } from "@/hooks/api/use-crypto";
import { useWallets } from "@/hooks/api/use-wallet";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import {
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

export default function WalletScreen() {
  const { data: walletsData, isLoading, error } = useWallets();

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

  const formatBalance = (balance: number, currency: string) => {
    if (currency === "NGN") {
      return `₦${new Intl.NumberFormat("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(balance)}`;
    }
    return `${balance.toFixed(8)} ${currency}`;
  };

  // Get crypto price and calculate USD value
  const getCryptoPriceData = (currency: string) => {
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
  };

  // Format USD value
  const formatUSD = (value: number) => {
    return `$${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  };

  const getCryptoIcon = (currency: string): keyof typeof Ionicons.glyphMap => {
    const upperCurrency = currency.toUpperCase();
    switch (upperCurrency) {
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

  const getCryptoColor = (currency: string): string => {
    const upperCurrency = currency.toUpperCase();
    switch (upperCurrency) {
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
      <ScreenTitle title="Wallets" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Fiat Wallets */}
        {fiatWallets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fiat Wallets</Text>
            {fiatWallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                activeOpacity={0.9}
                style={styles.walletCardWrapper}
              >
                <Card style={styles.walletCard}>
                  <View style={styles.walletHeader}>
                    <LinearGradient
                      colors={[AppColors.primary, AppColors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconContainer}
                    >
                      <Ionicons name="cash" size={24} color="#fff" />
                    </LinearGradient>
                    <View style={styles.walletInfo}>
                      <Text style={styles.walletCurrency}>
                        {wallet.currency}
                      </Text>
                      <Text style={styles.walletType}>{wallet.provider}</Text>
                    </View>
                  </View>
                  <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>
                      {formatBalance(wallet.balance, wallet.currency)}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Crypto Wallets */}
        {cryptoWallets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crypto Wallets</Text>
            {cryptoWallets.map((wallet) => {
              const cryptoColor = getCryptoColor(wallet.currency);
              const colorVariations: Record<string, [string, string]> = {
                BTC: [AppColors.orange, "#FF8C00"],
                ETH: [AppColors.blue, "#0051D5"],
                USDT: [AppColors.green, "#00A86B"],
                USDC: [AppColors.green, "#00A86B"],
                BNB: [AppColors.primary, AppColors.primaryDark],
              };
              const gradientColors: [string, string] = colorVariations[
                wallet.currency.toUpperCase()
              ] || [cryptoColor, cryptoColor];

              const priceData = getCryptoPriceData(wallet.currency);
              const usdValue = wallet.balance * priceData.price;
              const coinName =
                COIN_NAMES[wallet.currency.toUpperCase()] || wallet.currency;

              return (
                <TouchableOpacity
                  key={wallet.id}
                  activeOpacity={0.9}
                  style={styles.walletCardWrapper}
                >
                  <Card style={styles.walletCard}>
                    <View style={styles.walletRow}>
                      {/* Coin Column */}
                      <View style={styles.coinColumn}>
                        <Image
                          source={{
                            uri: wallet?.image_url || "",
                          }}
                          style={styles.coinIcon}
                          contentFit="cover"
                        />
                        <View style={styles.coinInfo}>
                          <Text style={styles.coinTicker}>
                            {wallet.currency}
                          </Text>
                          <Text style={styles.coinName}>{coinName}</Text>
                        </View>
                      </View>

                      {/* Amount Column */}
                      <View style={styles.amountColumn}>
                        <Text style={styles.amountValue}>
                          {wallet.balance.toFixed(4)}
                        </Text>
                        <Text style={styles.amountUSD}>
                          {formatUSD(usdValue)} USD
                        </Text>
                      </View>
                    </View>
                  </Card>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  walletCardWrapper: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  walletCard: {
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  coinInfo: {
    flex: 1,
  },
  coinTicker: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 2,
  },
  coinName: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "400",
  },
  amountColumn: {
    alignItems: "flex-end",
    flex: 1,
    marginRight: 16,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 2,
  },
  amountUSD: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "400",
  },
  pnlColumn: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  pnlValue: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 2,
  },
  pnlPercentage: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "400",
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  walletInfo: {
    flex: 1,
  },
  walletCurrency: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  walletTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  networkBadge: {
    backgroundColor: AppColors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  networkText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  walletProvider: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  walletType: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  balanceContainer: {
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 20,
  },
  balanceLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: AppColors.text,
    letterSpacing: 0.5,
  },
  addressContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  copyButtonText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: "600",
  },
  addressBox: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  addressText: {
    fontSize: 13,
    color: AppColors.text,
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  sectionTitleSkeleton: {
    marginBottom: 20,
  },
  skeletonIcon: {
    marginRight: 16,
    borderRadius: 16,
  },
  skeletonCurrency: {
    marginBottom: 6,
  },
  skeletonType: {
    marginTop: 0,
  },
  skeletonNetworkBadge: {
    marginRight: 8,
    borderRadius: 8,
  },
  skeletonProvider: {
    marginTop: 0,
  },
  skeletonBalanceLabel: {
    marginBottom: 8,
  },
  skeletonBalanceAmount: {
    marginTop: 0,
  },
  skeletonAddressLabel: {
    marginBottom: 0,
  },
  skeletonCopyButton: {
    borderRadius: 8,
  },
  skeletonAddressText: {
    marginTop: 0,
  },
});
