import Empty from "@/components/empty";
import { ScreenTitle } from "@/components/ui/screen-title";
import { TransactionItem } from "@/components/ui/transaction-item";
import { AppColors } from "@/constants/theme";
import { useCryptoPrices } from "@/hooks/api/use-crypto";
import { useTransactions, useWallets } from "@/hooks/api/use-wallet";
import { Wallet } from "@/services/api/wallet";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
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

// Helper function to parse date string and extract date and time
const parseDateString = (
  dateString: string
): { date: string; time: string } => {
  // Handle "Today, 10:37 AM" format
  if (dateString.toLowerCase().includes("today")) {
    const timeMatch = dateString.match(/(\d{1,2}:\d{2}\s?(AM|PM))/i);
    return {
      date: "Today",
      time: timeMatch ? timeMatch[1] : "",
    };
  }

  // Handle "Nov 28, 04:57 PM" format
  const parts = dateString.split(",");
  if (parts.length >= 2) {
    const datePart = parts[0].trim(); // "Nov 28"
    const timePart = parts[1]?.trim() || ""; // "04:57 PM"
    return {
      date: datePart,
      time: timePart,
    };
  }

  // Try to parse as ISO date string
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    }
  } catch (error) {
    // Fall through to default
  }

  return {
    date: dateString,
    time: "",
  };
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
    label: "Convert",
    icon: "swap-horizontal",
    route: "/exchange-crypto" as any,
  },
];

export default function CryptoWalletDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showBalance, setShowBalance] = useState(true);

  // Parse wallet data from params
  const wallet = useMemo(() => {
    try {
      if (params.wallet) {
        return JSON.parse(params.wallet as string) as Wallet;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [params.wallet]);

  const { data: walletsData } = useWallets();

  // Get CoinGecko IDs for crypto prices
  const cryptoIds = useMemo(() => {
    if (!wallet?.currency) return [];
    const coinId = COIN_GECKO_MAP[wallet.currency.toUpperCase()];
    return coinId ? [coinId] : [];
  }, [wallet?.currency]);

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

  // Get price data for this wallet
  const priceData = useMemo(() => {
    if (!wallet?.currency) return { price: 0, change: 0 };
    return getCryptoPriceData(wallet.currency);
  }, [wallet?.currency, getCryptoPriceData]);

  // Format USD value
  const formatUSD = (value: number) => {
    return `$${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  };

  // Format crypto balance
  const formatCryptoBalance = (balance: number) => {
    return balance.toFixed(8);
  };

  // Get transactions for this wallet
  const transactionParams = useMemo(() => {
    if (!wallet?.currency) return undefined;
    return {
      currency: wallet.currency.toUpperCase(),
      wallet_type: "crypto",
      per_page: 20,
    };
  }, [wallet?.currency]);

  const { data: transactionsData } = useTransactions(transactionParams);

  // Filter transactions to ensure they match the wallet currency
  const transactions = useMemo(() => {
    if (!transactionsData?.transactions || !wallet?.currency) return [];

    const currencyUpper = wallet.currency.toUpperCase();

    // Filter transactions that match this currency
    return transactionsData.transactions.filter((transaction) => {
      // Check if transaction name contains the currency
      const nameUpper = transaction.name.toUpperCase();
      if (nameUpper.includes(currencyUpper)) {
        return true;
      }

      // Check if transaction amount contains the currency symbol
      const amountUpper = transaction.amount.toUpperCase();
      if (amountUpper.includes(currencyUpper)) {
        return true;
      }

      // If API already filtered by currency, include all returned transactions
      // Otherwise, exclude transactions that clearly belong to other currencies
      const commonCurrencies = [
        "BTC",
        "ETH",
        "USDT",
        "USDC",
        "BNB",
        "XRP",
        "SOL",
        "ADA",
        "DOT",
        "MATIC",
      ];
      const otherCurrencies = commonCurrencies.filter(
        (c) => c !== currencyUpper
      );
      const hasOtherCurrency = otherCurrencies.some(
        (c) => nameUpper.includes(c) || amountUpper.includes(c)
      );

      // If transaction doesn't have any currency indicator, include it (API filtered)
      // If it has other currency indicators, exclude it
      return !hasOtherCurrency;
    });
  }, [transactionsData, wallet?.currency]);

  if (!wallet) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScreenTitle title="Wallet Details" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Wallet not found</Text>
        </View>
      </View>
    );
  }

  const coinName = COIN_NAMES[wallet.currency.toUpperCase()] || wallet.currency;
  const usdValue = wallet.balance * priceData.price;
  const balanceDisplay = showBalance
    ? `${wallet.currency} ${formatCryptoBalance(wallet.balance)}`
    : "*****";

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title={`${coinName} Wallet`} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Crypto Header */}
        <View style={styles.cryptoHeader}>
          <View style={styles.cryptoIconContainer}>
            {wallet.image_url ? (
              <Image
                source={{ uri: wallet.image_url }}
                style={styles.cryptoIcon}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.cryptoIcon, styles.cryptoIconPlaceholder]}>
                <Text style={styles.cryptoIconText}>
                  {wallet.currency.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.cryptoSymbol}>{wallet.currency}</Text>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{balanceDisplay}</Text>
            <TouchableOpacity
              onPress={() => setShowBalance(!showBalance)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showBalance ? "eye-off-outline" : "eye-outline"}
                size={16}
                color={AppColors.text}
              />
            </TouchableOpacity>
          </View>
          {priceData.change !== 0 && (
            <View style={styles.changeRow}>
              <Ionicons
                name={priceData.change >= 0 ? "arrow-up" : "arrow-down"}
                size={14}
                color={priceData.change >= 0 ? AppColors.green : AppColors.red}
              />
              <Text
                style={[
                  styles.changeText,
                  {
                    color:
                      priceData.change >= 0 ? AppColors.green : AppColors.red,
                  },
                ]}
              >
                {Math.abs(priceData.change).toFixed(2)}%
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <FlatList
            data={ACTION_BUTTONS}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.actionButtonSquare}
                onPress={() => {
                  router.push({
                    pathname: item.route,
                    params: { wallet: JSON.stringify(wallet) },
                  });
                }}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icon} size={18} color={AppColors.text} />
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

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent transactions</Text>
            <TouchableOpacity
              onPress={() => router.push("/transaction-history")}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <Empty
              title="No Transactions yet!"
              description="Any transactions you make will appear here. Let's trading!"
            />
          ) : (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 5).map((transaction) => {
                const isCredit = transaction.amount.startsWith("+");
                const type = isCredit ? "credit" : "debit";
                const { time, date } = parseDateString(transaction.date);

                return (
                  <TransactionItem
                    key={transaction.id}
                    title={transaction.name}
                    time={time}
                    amount={transaction.amount}
                    type={type}
                    status={transaction.status}
                    onPress={() => {
                      router.push({
                        pathname: "/view-details",
                        params: {
                          type: "other",
                          transactionData: JSON.stringify({
                            amount: transaction.amount,
                            reference: transaction.reference?.toString(),
                            date: date,
                            time: time,
                            name: transaction.name,
                            id: transaction.id,
                            status: transaction.status,
                          }),
                        },
                      });
                    }}
                  />
                );
              })}
            </View>
          )}
        </View>
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
    padding: 12,
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  cryptoHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  cryptoIconContainer: {
    marginBottom: 6,
  },
  cryptoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  cryptoIconPlaceholder: {
    backgroundColor: AppColors.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  cryptoIconText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  cryptoSymbol: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  balanceSection: {
    alignItems: "center",
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.text,
  },
  eyeButton: {
    padding: 2,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  actionSection: {
    marginBottom: 12,
  },
  actionButtonsGrid: {},
  actionButtonSquare: {
    width: "31%",
    aspectRatio: 1.5,
    backgroundColor: AppColors.surface,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  actionButtonLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: AppColors.text,
    textAlign: "center",
  },
  transactionsSection: {
    marginTop: 6,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },
  seeAllText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: "600",
  },
  transactionsList: {
    gap: 8,
  },
});
