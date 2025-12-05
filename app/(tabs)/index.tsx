import { Card } from "@/components/ui/card";
import { CryptoIcon } from "@/components/ui/icons/crypto-icon";
import { ReceiptIcon } from "@/components/ui/icons/receipt-icon";
import { QuickActions } from "@/components/ui/quick-actions";
import { SectionHeader } from "@/components/ui/section-header";
import { TransactionItem } from "@/components/ui/transaction-item";
import { WalletSelectBottomSheet } from "@/components/ui/wallet-select-bottom-sheet";
import { AppColors } from "@/constants/theme";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const getCryptoData = () => [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: "$45,230.50",
    change: "+2.45%",
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
    price: "$2,456.80",
    change: "+1.23%",
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
    price: "$1.00",
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

const transactions = [
  {
    id: 1,
    title: "Fiat Wallet Deposit",
    time: "10:30PM",
    amount: "250,000.00",
    type: "credit" as const,
    icon: {
      name: "wallet" as const,
      backgroundColor: AppColors.primary,
    },
  },
  {
    id: 2,
    title: "Data Subscription",
    time: "2:45PM",
    amount: "450.00",
    type: "debit" as const,
  },
];

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [showFiatBalance, setShowFiatBalance] = useState(true);
  const cryptoBalance = showBalance ? "$250.00" : "********";
  const fiatBalance = showFiatBalance ? "₦250,000.00" : "********";

  const walletSelectBottomSheetRef = useRef<BottomSheetModal>(null);

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
              source={require("@/assets/images/profile.png")}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
          <Text style={styles.greeting}>Hi, Sunday</Text>
        </View>
        <TouchableOpacity>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={AppColors.text}
          />
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
              <TouchableOpacity>
                <Feather name="arrow-right" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceAmountCrypto}>{cryptoBalance}</Text>
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
                {fiatBalance}
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
                onPress={() => walletSelectBottomSheetRef.current?.present()}
              >
                <Feather
                  name="download"
                  size={20}
                  style={{ marginTop: -2 }}
                  color={"#fff"}
                />
                <Text style={styles.actionButtonText}>Deposit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonWithGradient}>
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
          <SectionHeader title="Recent Transaction" actionText="Sell All" />
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              title={transaction.title}
              time={transaction.time}
              amount={transaction.amount}
              type={transaction.type}
              icon={transaction.icon}
            />
          ))}
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
          {getCryptoData().map((crypto, index) => (
            <TransactionItem
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

      <WalletSelectBottomSheet
        bottomSheetModalRef={walletSelectBottomSheetRef}
        onSelectWallet={(walletType) => {
          // Handle wallet selection
          if (walletType === "crypto") {
            // Navigate to crypto deposit screen
            router.push("/exchange-crypto");
          } else {
            // Navigate to fiat deposit screen or handle fiat deposit
            console.log("Fiat deposit selected");
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
});
