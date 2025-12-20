import { Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useWallets } from "@/hooks/api/use-wallet";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
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
              <Card key={wallet.id} style={styles.walletCard}>
                <View style={styles.walletHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: AppColors.primary },
                    ]}
                  >
                    <Ionicons name="cash" size={24} color="#fff" />
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletCurrency}>{wallet.currency}</Text>
                    <Text style={styles.walletType}>
                      {wallet.provider} • {wallet.network}
                    </Text>
                  </View>
                </View>
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>Balance</Text>
                  <Text style={styles.balanceAmount}>
                    {formatBalance(wallet.balance, wallet.currency)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Crypto Wallets */}
        {cryptoWallets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crypto Wallets</Text>
            {cryptoWallets.map((wallet) => (
              <Card key={wallet.id} style={styles.walletCard}>
                <View style={styles.walletHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: getCryptoColor(wallet.currency) },
                    ]}
                  >
                    <Ionicons
                      name={getCryptoIcon(wallet.currency)}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletCurrency}>{wallet.currency}</Text>
                    <Text style={styles.walletType}>
                      {wallet.network} • {wallet.provider}
                    </Text>
                  </View>
                </View>
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>Balance</Text>
                  <Text style={styles.balanceAmount}>
                    {formatBalance(wallet.balance, wallet.currency)}
                  </Text>
                </View>
                {wallet.external_address && (
                  <View style={styles.addressContainer}>
                    <Text style={styles.addressLabel}>Address:</Text>
                    <View style={styles.addressRow}>
                      <Text style={styles.addressText} numberOfLines={1}>
                        {wallet.external_address}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          // Copy to clipboard
                        }}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={20}
                          color={AppColors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {fiatWallets.length === 0 && cryptoWallets.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="wallet-outline"
              size={64}
              color={AppColors.textSecondary}
            />
            <Text style={styles.emptyText}>No wallets found</Text>
          </View>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 16,
  },
  walletCard: {
    marginBottom: 12,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletCurrency: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  walletType: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  balanceContainer: {
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
  },
  addressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  addressLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.text,
    fontFamily: "monospace",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginTop: 16,
  },
});
