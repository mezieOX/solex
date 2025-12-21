import Empty from "@/components/empty";
import Skeleton, { SkeletonText, SkeletonTitle } from "@/components/skeleton";
import { Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useWallets } from "@/hooks/api/use-wallet";
import { Ionicons } from "@expo/vector-icons";
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

export default function WalletScreen() {
  const { data: walletsData, isLoading, error } = useWallets();

  // Separate wallets by type
  const { fiatWallets, cryptoWallets } = useMemo(() => {
    if (!walletsData) return { fiatWallets: [], cryptoWallets: [] };

    const fiat = walletsData.filter((wallet) => wallet.type === "fiat");
    const crypto = walletsData.filter((wallet) => wallet.type === "crypto");

    return { fiatWallets: fiat, cryptoWallets: crypto };
  }, [walletsData]);

  const formatBalance = (balance: number, currency: string) => {
    if (currency === "NGN") {
      return `₦${new Intl.NumberFormat("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(balance)}`;
    }
    return `${balance.toFixed(8)} ${currency}`;
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

              return (
                <TouchableOpacity
                  key={wallet.id}
                  activeOpacity={0.9}
                  style={styles.walletCardWrapper}
                >
                  <Card style={styles.walletCard}>
                    <View style={styles.walletHeader}>
                      <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconContainer}
                      >
                        <Ionicons
                          name={getCryptoIcon(wallet.currency)}
                          size={24}
                          color="#fff"
                        />
                      </LinearGradient>
                      <View style={styles.walletInfo}>
                        <Text style={styles.walletCurrency}>
                          {wallet.currency}
                        </Text>
                        <View style={styles.walletTypeRow}>
                          <View style={styles.networkBadge}>
                            <Text style={styles.networkText}>
                              {wallet.meta?.network || "Network"}
                            </Text>
                          </View>
                          <Text style={styles.walletProvider}>
                            {wallet.provider}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.balanceContainer}>
                      <Text style={styles.balanceLabel}>Available Balance</Text>
                      <Text style={styles.balanceAmount}>
                        {formatBalance(wallet.balance, wallet.currency)}
                      </Text>
                    </View>
                    {wallet.external_address && (
                      <View style={styles.addressContainer}>
                        <View style={styles.addressHeader}>
                          <Text style={styles.addressLabel}>
                            Wallet Address
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              // Copy to clipboard
                            }}
                            style={styles.copyButton}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="copy-outline"
                              size={18}
                              color={AppColors.primary}
                            />
                            <Text style={styles.copyButtonText}>Copy</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.addressBox}>
                          <Text style={styles.addressText} numberOfLines={1}>
                            {wallet.external_address}
                          </Text>
                        </View>
                      </View>
                    )}
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
    borderRadius: 20,
    padding: 20,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
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
