import { ScreenTitle } from "@/components/ui/screen-title";
import { TransactionItem } from "@/components/ui/transaction-item";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Transaction {
  id: string;
  title: string;
  time: string;
  amount: string;
  type: "credit" | "debit";
  icon?: {
    name?: keyof typeof Ionicons.glyphMap;
    backgroundColor?: string;
  };
}

interface TransactionGroup {
  date: string;
  transactions: Transaction[];
}

const transactionData: TransactionGroup[] = [
  {
    date: "04 Dec, 2025",
    transactions: [
      {
        id: "1",
        title: "Fiat Wallet Deposit",
        time: "10:30 PM",
        amount: "N250,000.00",
        type: "credit",
        icon: {
          name: "wallet",
          backgroundColor: AppColors.green,
        },
      },
      {
        id: "2",
        title: "Crypto Withdrawal",
        time: "10:00 PM",
        amount: "$300.00",
        type: "debit",
        icon: {
          name: "arrow-down",
          backgroundColor: AppColors.red,
        },
      },
      {
        id: "3",
        title: "Airtime",
        time: "09:22 PM",
        amount: "N2,000.00",
        type: "debit",
        icon: {
          name: "phone-portrait",
          backgroundColor: AppColors.textSecondary,
        },
      },
      {
        id: "4",
        title: "Fiat Wallet Deposit",
        time: "10:30 PM",
        amount: "N25,000.00",
        type: "credit",
        icon: {
          name: "wallet",
          backgroundColor: AppColors.green,
        },
      },
    ],
  },
  {
    date: "03 Dec, 2025",
    transactions: [
      {
        id: "5",
        title: "Gift Card Exchange",
        time: "10:30 PM",
        amount: "N550,000.00",
        type: "credit",
        icon: {
          name: "gift",
          backgroundColor: AppColors.green,
        },
      },
      {
        id: "6",
        title: "Betting",
        time: "10:30 PM",
        amount: "N2500.00",
        type: "debit",
        icon: {
          name: "trophy",
          backgroundColor: AppColors.textSecondary,
        },
      },
    ],
  },
  {
    date: "01 Dec, 2025",
    transactions: [
      {
        id: "7",
        title: "Fiat Wallet Deposit",
        time: "10:30 PM",
        amount: "N250,000.00",
        type: "credit",
        icon: {
          name: "wallet",
          backgroundColor: AppColors.green,
        },
      },
      {
        id: "8",
        title: "Crypto Wallet Deposit",
        time: "10:00 PM",
        amount: "$300.00",
        type: "debit",
        icon: {
          name: "arrow-up",
          backgroundColor: AppColors.red,
        },
      },
      {
        id: "9",
        title: "Airtime",
        time: "09:22 PM",
        amount: "N2,000.00",
        type: "debit",
        icon: {
          name: "phone-portrait",
          backgroundColor: AppColors.textSecondary,
        },
      },
      {
        id: "10",
        title: "Fiat Wallet Deposit",
        time: "10:30 PM",
        amount: "N250,000.00",
        type: "credit",
        icon: {
          name: "wallet",
          backgroundColor: AppColors.green,
        },
      },
    ],
  },
];

type FilterType = "All" | "Deposit" | "Withdrawal" | "Gift Card Exchange";

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");

  const filters: FilterType[] = [
    "All",
    "Deposit",
    "Withdrawal",
    "Gift Card Exchange",
  ];

  const filteredTransactions = transactionData
    .map((group) => ({
      ...group,
      transactions: group.transactions.filter((transaction) => {
        if (selectedFilter === "All") return true;
        if (selectedFilter === "Deposit") return transaction.type === "credit";
        if (selectedFilter === "Withdrawal")
          return transaction.type === "debit";
        if (selectedFilter === "Gift Card Exchange")
          return transaction.title.toLowerCase().includes("gift card");
        return true;
      }),
    }))
    .filter((group) => group.transactions.length > 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <ScreenTitle title="Transaction History" />
      </View>

      {/* Filters */}
      <FlatList
        data={filters}
        horizontal
        style={{ maxHeight: 70, minHeight: 70 }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        keyExtractor={(item) => item}
        renderItem={({ item: filter }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        )}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredTransactions.map((group) => (
          <View key={group.date} style={styles.groupContainer}>
            <Text style={styles.dateText}>{group.date}</Text>
            {group.transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                title={transaction.title}
                time={transaction.time}
                amount={transaction.amount}
                type={transaction.type}
                icon={transaction.icon}
                onPress={() => router.push("/view-details")}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  filters: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginRight: 12,
    marginBottom: 20,
  },
  filterButtonActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterText: {
    fontSize: 16,
    color: AppColors.text,
  },
  filterTextActive: {
    color: AppColors.background,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  groupContainer: {
    marginBottom: 32,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 16,
  },
});
