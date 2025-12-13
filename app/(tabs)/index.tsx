import Empty from "@/components/empty";
import { Card } from "@/components/ui/card";
import { CryptoIcon } from "@/components/ui/icons/crypto-icon";
import { ReceiptIcon } from "@/components/ui/icons/receipt-icon";
import { QuickActions } from "@/components/ui/quick-actions";
import { SectionHeader } from "@/components/ui/section-header";
import { TransactionItem } from "@/components/ui/transaction-item";
import { WalletSelectBottomSheet } from "@/components/ui/wallet-select-bottom-sheet";
import { AppColors } from "@/constants/theme";
import { useUser } from "@/hooks/api/use-auth";
import { useCryptoPrices, type CoinGeckoPrice } from "@/hooks/api/use-crypto";
import { useDashboard } from "@/hooks/api/use-dashboard";
import { getBoolean, setBoolean, StorageKeys } from "@/utils/local-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Crypto coin IDs for CoinGecko API
const CRYPTO_IDS = ["bitcoin", "ethereum", "tether"];

interface CryptoDisplayData {
  name: string;
  symbol: string;
  price: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: user } = useUser();
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboard();
  const { data: cryptoPrices, isLoading: isLoadingCrypto } = useCryptoPrices(
    CRYPTO_IDS,
    "usd",
    30000
  ); // Refetch every 30 seconds
  const [showBalance, setShowBalance] = useState(true);
  const [showFiatBalance, setShowFiatBalance] = useState(true);

  const walletSelectBottomSheetRef = useRef<BottomSheetModal>(null);
  const [bottomSheetMode, setBottomSheetMode] = useState<
    "deposit" | "withdrawal"
  >("deposit");

  const allLoader = isLoadingDashboard || isLoadingCrypto;

  // Load showBalance preference from local storage on mount
  useEffect(() => {
    const loadShowBalance = async () => {
      const savedValue = await getBoolean(StorageKeys.SHOW_BALANCE);
      if (savedValue !== null) {
        setShowBalance(savedValue);
      }
    };
    loadShowBalance();
  }, []);

  // Save showBalance preference to local storage whenever it changes
  useEffect(() => {
    setBoolean(StorageKeys.SHOW_BALANCE, showBalance);
  }, [showBalance]);

  // Load showFiatBalance preference from local storage on mount
  useEffect(() => {
    const loadShowFiatBalance = async () => {
      const savedValue = await getBoolean(StorageKeys.SHOW_FIAT_BALANCE);
      if (savedValue !== null) {
        setShowFiatBalance(savedValue);
      }
    };
    loadShowFiatBalance();
  }, []);

  // Save showFiatBalance preference to local storage whenever it changes
  useEffect(() => {
    setBoolean(StorageKeys.SHOW_FIAT_BALANCE, showFiatBalance);
  }, [showFiatBalance]);

  // Format balance with currency symbol
  const formatBalance = (amount: number) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  // Get user's name
  const userName = user?.name || "User";

  // Format fiat balance
  const fiatBalance = useMemo(() => {
    if (isLoadingDashboard) return "Loading...";
    if (!dashboardData?.total_balance_ngn) return "₦0.00";
    return showFiatBalance
      ? formatBalance(dashboardData.total_balance_ngn)
      : "********";
  }, [dashboardData, showFiatBalance, isLoadingDashboard]);

  // Map dashboard transactions to TransactionItem format
  const transactions = useMemo(() => {
    if (!dashboardData?.transactions) return [];
    return dashboardData.transactions.map((transaction) => {
      const isCredit = transaction.amount.startsWith("+");
      const isDebit = transaction.amount.startsWith("-");
      const amount = transaction.amount.replace(/[+-]/g, "");

      // Determine icon based on transaction name
      let icon: {
        name?: keyof typeof Ionicons.glyphMap;
        backgroundColor?: string;
      } = {
        name: "wallet",
        backgroundColor: AppColors.primary,
      };

      if (transaction.name.toLowerCase().includes("bill")) {
        icon = {
          name: "receipt",
          backgroundColor: isCredit ? AppColors.green : AppColors.red,
        };
      }

      return {
        id: transaction.id,
        title: transaction.name,
        time: transaction.date,
        amount: amount,
        type: (isCredit ? "credit" : "debit") as "credit" | "debit",
        icon,
      };
    });
  }, [dashboardData]);

  // Map crypto prices to display format
  const cryptoData = useMemo((): CryptoDisplayData[] => {
    if (!cryptoPrices || cryptoPrices.length === 0) {
      // Return fallback data if API fails
      return [
        {
          name: "Bitcoin",
          symbol: "BTC",
          price: "$0.00",
          change: "0.00%",
          icon: (
            <Image
              source={require("@/assets/images/bitcoin.png")}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
            />
          ),
          color: AppColors.orange,
        },
        {
          name: "Ethereum",
          symbol: "ETH",
          price: "$0.00",
          change: "0.00%",
          icon: (
            <Image
              source={require("@/assets/images/eth.png")}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
            />
          ),
          color: AppColors.blue,
        },
        {
          name: "Tether",
          symbol: "USDT",
          price: "$0.00",
          change: "0.00%",
          icon: (
            <Image
              source={require("@/assets/images/usdt.png")}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
            />
          ),
          color: AppColors.green,
        },
      ];
    }

    return cryptoPrices.map((crypto: CoinGeckoPrice) => {
      // Format price with commas
      const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(crypto.current_price);

      // Format percentage change
      const change = crypto.price_change_percentage_24h || 0;
      const formattedChange = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

      // Get icon and color based on crypto symbol
      let icon: React.ReactNode;
      let color: string;

      switch (crypto.symbol.toLowerCase()) {
        case "btc":
          icon = (
            <Image
              source={require("@/assets/images/bitcoin.png")}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
            />
          );
          color = AppColors.orange;
          break;
        case "eth":
          icon = (
            <Image
              source={require("@/assets/images/eth.png")}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
            />
          );
          color = AppColors.blue;
          break;
        case "usdt":
          icon = (
            <Image
              source={require("@/assets/images/usdt.png")}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
            />
          );
          color = AppColors.green;
          break;
        default:
          icon = (
            <Image
              source={require("@/assets/images/bitcoin.png")}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
            />
          );
          color = AppColors.orange;
      }

      return {
        name: crypto.name,
        symbol: crypto.symbol.toUpperCase(),
        price: formattedPrice,
        change: formattedChange,
        icon,
        color,
      };
    });
  }, [cryptoPrices]);

  const quickActionsData = [
    {
      title: "Crypto Exchange",
      customIcon: <CryptoIcon size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => router.push("/exchange-crypto"),
    },
    {
      title: "Gift Card Exchange",
      icon: "gift-outline" as const,
      iconColor: "#fff",
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => router.push("/exchange-giftcard"),
    },
    {
      title: "Pay Bills",
      customIcon: <ReceiptIcon size={32} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Sticky Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Image
              source={require("@/assets/images/no-user-img.png")}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
          <Text style={styles.greeting}>Hi, {userName}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/notifications")}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={AppColors.text}
          />
        </TouchableOpacity>
      </View>
      {/* {allLoader ? (
        <LoadingScreen style={{ minHeight: "100%" }} />
      ) : ( */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Cards */}
        <View style={styles.balanceContainer}>
          <Card
            style={[
              styles.balanceCard,
              { backgroundColor: AppColors.red },
              styles.gradientCard,
            ]}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Crypto Balance</Text>
              <TouchableOpacity>
                <Feather name="arrow-right" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceAmountCrypto}>
                {showBalance ? (
                  isLoadingDashboard ? (
                    <ActivityIndicator size={30} color={AppColors.primary} />
                  ) : (
                    "$250.00"
                  )
                ) : (
                  "********"
                )}
              </Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                <Feather
                  name={showBalance ? "eye" : "eye-off"}
                  size={20}
                  color={AppColors.text}
                />
              </TouchableOpacity>
            </View>
          </Card>

          <Card
            backgroundImage={require("@/assets/images/fiat-background.png")}
            style={[
              styles.balanceCard,
              styles.fiatCard,
              { backgroundColor: "transparent" },
            ]}
          >
            <View style={styles.fiatHeader}>
              <Text
                style={[
                  styles.balanceLabel,
                  {
                    color: "#000",
                  },
                ]}
              >
                Fiat Account
              </Text>
              <View style={styles.currencyTag}>
                <Text style={styles.currencyText}>NGN</Text>
              </View>
            </View>
            <View style={styles.balanceHeader}>
              <Text style={[styles.balanceAmount, { color: "#000" }]}>
                {showFiatBalance ? (
                  isLoadingDashboard ? (
                    <ActivityIndicator size={40} color={AppColors.red} />
                  ) : (
                    fiatBalance
                  )
                ) : (
                  "*****"
                )}
              </Text>
              <TouchableOpacity
                onPress={() => setShowFiatBalance(!showFiatBalance)}
              >
                <Feather
                  name={showFiatBalance ? "eye" : "eye-off"}
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setBottomSheetMode("deposit");
                  walletSelectBottomSheetRef.current?.present();
                }}
              >
                <Feather
                  name="download"
                  size={20}
                  style={{ marginTop: -2 }}
                  color={"#fff"}
                />
                <Text style={styles.actionButtonText}>Deposit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonWithGradient}
                onPress={() => {
                  setBottomSheetMode("withdrawal");
                  walletSelectBottomSheetRef.current?.present();
                }}
              >
                <LinearGradient
                  colors={["#000000", "#000000", "#F94B32"]}
                  start={{ x: 0.5, y: 0.5 }}
                  end={{ x: 1, y: 1 }}
                  locations={[0, 0.3, 1]}
                  style={styles.gradientButton}
                >
                  <Feather
                    name="upload"
                    size={20}
                    style={{ marginTop: -2 }}
                    color={"#fff"}
                  />
                  <Text style={styles.actionButtonText}>Withdraw</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Transaction"
            actionText="Sell All"
            onActionPress={() => router.push("/transaction-history")}
          />
          <FlatList
            data={transactions.slice(0, 3)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TransactionItem
                loading={isLoadingDashboard}
                title={item.title}
                time={item.time}
                amount={item.amount}
                type={item.type}
                icon={item.icon}
              />
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => null}
            ListEmptyComponent={() => (
              <Empty
                title="No transactions yet"
                description="You haven't made any transactions yet"
              />
            )}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActions title="Quick Action" actions={quickActionsData} />
        </View>

        {/* Market */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: AppColors.surface,
              paddingVertical: 20,
              borderRadius: 16,
            },
          ]}
        >
          <SectionHeader title="Market" actionText="Price" />
          {cryptoData.map((crypto: CryptoDisplayData, index: number) => (
            <TransactionItem
              loading={isLoadingCrypto}
              key={index}
              title={crypto.name}
              subtitle={crypto.symbol}
              amount={crypto.price}
              change={crypto.change}
              icon={{
                customIcon: crypto.icon,
                backgroundColor: crypto.color,
              }}
            />
          ))}
        </View>
      </ScrollView>
      {/* )} */}

      <WalletSelectBottomSheet
        bottomSheetModalRef={walletSelectBottomSheetRef}
        mode={bottomSheetMode}
        onSelectWallet={(walletType) => {
          // Handle wallet selection based on mode
          if (bottomSheetMode === "deposit") {
            if (walletType === "crypto") {
              router.push("/crypto-deposit");
            } else {
              router.push("/fiat-deposit");
            }
          } else {
            // Withdrawal mode
            if (walletType === "crypto") {
              // Navigate to exchange crypto for crypto withdrawal
              router.push("/exchange-crypto");
            } else {
              router.push("/fiat-withdrawal");
            }
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  gradientCard: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingTop: 120,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "500",
    color: AppColors.text,
  },
  quickActionIcon: {
    width: 55,
    height: 55,
    borderRadius: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.redAccent,
  },
  balanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceCard: {
    marginBottom: 16,
    padding: 20,
  },
  fiatCard: {
    marginTop: -44,
    paddingTop: 35,
    padding: 10,
  },
  fiatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: AppColors.text,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: AppColors.text,
    marginTop: 8,
  },
  balanceAmountCrypto: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
    marginTop: 4,
  },
  currencyTag: {
    backgroundColor: AppColors.red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: -10,
  },
  actionButton: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 8,
    width: 900,
  },
  actionButtonWithGradient: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    width: "100%",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
});
