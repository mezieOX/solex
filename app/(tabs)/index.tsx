import Empty from "@/components/empty";
import { Card } from "@/components/ui/card";
import { MoreIcon } from "@/components/ui/icons/more-icon";
import { QuickActions } from "@/components/ui/quick-actions";
import { SectionHeader } from "@/components/ui/section-header";
import { TransactionItem } from "@/components/ui/transaction-item";
import { WalletSelectBottomSheet } from "@/components/ui/wallet-select-bottom-sheet";
import { AppColors } from "@/constants/theme";
import { useUser } from "@/hooks/api/use-auth";
import { useCryptoPrices } from "@/hooks/api/use-crypto";
import { useDashboard } from "@/hooks/api/use-dashboard";
import { useNotifications } from "@/hooks/api/use-notifications";
import { useServices } from "@/hooks/api/use-services";
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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Crypto coin IDs for CoinGecko API
const CRYPTO_IDS = ["bitcoin", "ethereum", "tether"];

// Helper function to determine transaction type from name
const getTransactionType = (
  name: string
):
  | "withdrawal"
  | "deposit"
  | "transfer"
  | "exchange"
  | "payment"
  | "giftcard_buy"
  | "giftcard_sell"
  | "other" => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("withdrawal") || lowerName.includes("withdraw")) {
    return "withdrawal";
  }
  if (lowerName.includes("deposit") || lowerName.includes("refund")) {
    return "deposit";
  }
  if (lowerName.includes("transfer")) {
    return "transfer";
  }
  // Check for giftcard buy/sell first (more specific)
  if (lowerName.includes("giftcard") || lowerName.includes("gift card")) {
    if (lowerName.includes("buy") || lowerName.includes("purchase")) {
      return "giftcard_buy";
    }
    if (lowerName.includes("sell") || lowerName.includes("sale")) {
      return "giftcard_sell";
    }
    // Default to buy if it's a giftcard transaction but unclear
    return "giftcard_buy";
  }
  if (lowerName.includes("swap") || lowerName.includes("exchange")) {
    return "exchange";
  }
  if (lowerName.includes("bill") || lowerName.includes("payment")) {
    return "payment";
  }

  return "other";
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

  return {
    date: dateString,
    time: "",
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const { data: user } = useUser();
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboard();
  const { data: cryptoPrices, isLoading: isLoadingCrypto } = useCryptoPrices(
    CRYPTO_IDS,
    "usd",
    1000
  ); // Refetch every 1 second
  const { data: notificationsData } = useNotifications();
  const { services: allServices, isLoading: isLoadingServices } = useServices();

  // Calculate unread notification count
  const unreadCount = useMemo(() => {
    if (!notificationsData?.notifications) return 0;
    const unread = notificationsData.notifications.filter(
      (notification) =>
        notification.read_at === null || notification.read_at === undefined
    );
    return unread.length;
  }, [notificationsData]);
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
    if (!dashboardData?.ngn_balance) return "₦0.00";
    return showFiatBalance
      ? formatBalance(dashboardData.ngn_balance)
      : "********";
  }, [dashboardData, showFiatBalance, isLoadingDashboard]);

  // Format crypto balance
  const cryptoBalance = useMemo(() => {
    if (isLoadingDashboard) return "Loading...";
    if (!dashboardData?.total_crypto_usdt) return "$0.00";
    return `$${dashboardData.total_crypto_usdt.toFixed(2)}`;
  }, [dashboardData, isLoadingDashboard]);

  // Map dashboard transactions to TransactionItem format
  const transactions = useMemo(() => {
    if (!dashboardData?.transactions) return [];
    return dashboardData.transactions.map((transaction) => {
      const isCredit = transaction.amount.startsWith("+");
      const { time, date } = parseDateString(transaction.date);

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
        time: time,
        date: date,
        amount: transaction.amount,
        type: (isCredit ? "credit" : "debit") as "credit" | "debit",
        icon,
        transactionType: getTransactionType(transaction.name),
        status: transaction.status,
      };
    });
  }, [dashboardData]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Sticky Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={styles.profileSection}
        >
          <View style={styles.avatar}>
            {user?.profile_image_url ? (
              <Image
                source={{ uri: user.profile_image_url }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <Image
                source={require("@/assets/images/no-user-img.png")}
                style={styles.avatar}
                contentFit="cover"
              />
            )}
          </View>
          <Text style={styles.greeting}>
            Hi,{" "}
            {userName?.length > 10 ? userName.slice(0, 10) + "..." : userName}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          style={styles.notificationButton}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={AppColors.text}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
              <TouchableOpacity onPress={() => router.push("/wallet")}>
                <Feather name="arrow-right" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceAmountCrypto}>
                {showBalance ? (
                  isLoadingDashboard ? (
                    <ActivityIndicator size={32} color={AppColors.text} />
                  ) : (
                    cryptoBalance
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

        {/* Quick Actions */}
        <View
          style={[
            styles.section,
            {
              paddingHorizontal: 0,
              marginHorizontal: 20,
              borderRadius: 12,
              paddingTop: 20,
              marginTop: -14,
              backgroundColor: AppColors.surface,
            },
          ]}
        >
          <QuickActions
            actions={
              allServices?.slice(0, 7).concat({
                title: "More",
                icon: "ellipsis-horizontal",
                customIcon: <MoreIcon size={24} color="#fff" />,
                iconColor: "#fff",
                iconSize: 24,
                iconBackgroundColor: AppColors.redAccent,
                onPress: () => router.push("/services"),
              }) || []
            }
            isLoading={isLoadingServices}
          />
        </View>

        {/* Recent Transactions */}
        <View
          style={[
            styles.section,
            {
              marginTop: 10,
            },
          ]}
        >
          <SectionHeader
            title="Recent Transaction"
            actionText="Sell All"
            onActionPress={() => router.push("/transaction-history")}
          />
          {transactions.slice(0, 3).map((item) => {
            const handlePress = () => {
              const transactionData = {
                amount: item.amount || "0",
                currency: "NGN",
                reference: item.id.toString(),
                date: item.date || item.time,
                time: item.time,
                name: item.title,
                id: item.id,
                status: item.status,
              };

              router.push({
                pathname: "/view-details",
                params: {
                  type: item.transactionType,
                  transactionData: JSON.stringify(transactionData),
                },
              });
            };

            return (
              <TransactionItem
                key={item.id.toString()}
                loading={isLoadingDashboard}
                title={item.title}
                time={item.time}
                amount={item.amount}
                type={item.type}
                icon={item.icon}
                onPress={handlePress}
                status={item.status}
              />
            );
          })}
          {transactions.length === 0 && !isLoadingDashboard ? (
            <Empty
              title="No transactions yet"
              description="You haven't made any transactions yet"
            />
          ) : null}
        </View>
      </ScrollView>

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
              router.push("/crypto-withdrawal-select");
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
  notificationButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -20,
    right: -10,
    backgroundColor: AppColors.red,
    borderRadius: 100,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: AppColors.background,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
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
    marginBottom: 14,
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
