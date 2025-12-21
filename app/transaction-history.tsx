import Empty from "@/components/empty";
import Error from "@/components/error";
import { SkeletonTitle } from "@/components/skeleton";
import { ScreenTitle } from "@/components/ui/screen-title";
import { TransactionItem } from "@/components/ui/transaction-item";
import { AppColors } from "@/constants/theme";
import { useTransactions } from "@/hooks/api/use-wallet";
import { Transaction } from "@/services/api/wallet";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FilterType = "All" | "Deposit" | "Withdrawal" | "Gift Card Exchange";

interface TransactionGroup {
  date: string;
  transactions: Transaction[];
}

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

// Helper function to get icon for transaction name
const getTransactionIcon = (
  name: string
): {
  name: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
} => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("deposit") || lowerName.includes("refund")) {
    return {
      name: "arrow-down",
      backgroundColor: AppColors.green,
    };
  }
  if (lowerName.includes("withdrawal") || lowerName.includes("withdraw")) {
    return {
      name: "arrow-up",
      backgroundColor: AppColors.red,
    };
  }
  // Check for giftcard transactions - differentiate buy and sell
  if (lowerName.includes("giftcard") || lowerName.includes("gift card")) {
    if (lowerName.includes("buy") || lowerName.includes("purchase")) {
      return {
        name: "gift",
        backgroundColor: AppColors.primary,
      };
    }
    if (lowerName.includes("sell") || lowerName.includes("sale")) {
      return {
        name: "gift-outline",
        backgroundColor: AppColors.orange,
      };
    }
    // Default to buy icon if it's a giftcard but unclear
    return {
      name: "gift",
      backgroundColor: AppColors.primary,
    };
  }
  if (lowerName.includes("swap")) {
    return {
      name: "swap-horizontal",
      backgroundColor: AppColors.primary,
    };
  }
  if (lowerName.includes("bill") || lowerName.includes("payment")) {
    return {
      name: "receipt",
      backgroundColor: AppColors.textSecondary,
    };
  }
  if (lowerName.includes("airtime")) {
    return {
      name: "phone-portrait",
      backgroundColor: AppColors.textSecondary,
    };
  }

  // Default icon
  return {
    name: "wallet",
    backgroundColor: AppColors.primary,
  };
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

// Helper function to group transactions by date
const groupTransactionsByDate = (
  transactions: Transaction[]
): TransactionGroup[] => {
  const groups: { [key: string]: Transaction[] } = {};

  transactions.forEach((transaction) => {
    const { date } = parseDateString(transaction.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
  });

  // Convert to array and sort by date (most recent first)
  return Object.entries(groups)
    .map(([date, transactions]) => ({
      date,
      transactions,
    }))
    .sort((a, b) => {
      // Sort "Today" first, then by date string
      if (a.date === "Today") return -1;
      if (b.date === "Today") return 1;
      return b.date.localeCompare(a.date);
    });
};

export default function TransactionHistoryScreen() {
  const { height } = Dimensions.get("window");
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");

  // Build filter params - only include non-null values
  const filterParams = useMemo(() => {
    const params: {
      wallet_type?: string;
      currency?: string;
      transaction_type?: string;
      direction?: string;
      status?: string;
      from_date?: string;
      to_date?: string;
      per_page?: number;
      reference?: string;
    } = {};

    // Map filter to API params
    if (selectedFilter === "Deposit") {
      params.direction = "credit";
    } else if (selectedFilter === "Withdrawal") {
      params.direction = "debit";
    }

    // Only return params that have values (don't include null/undefined)
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value != null)
    );
  }, [selectedFilter]);

  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useTransactions(filterParams);

  const filters: FilterType[] = [
    "All",
    "Deposit",
    "Withdrawal",
    "Gift Card Exchange",
  ];

  // Process and filter transactions
  const filteredTransactions = useMemo(() => {
    if (!transactionsData?.transactions) return [];

    let transactions = transactionsData.transactions;

    // Apply client-side filters for Gift Card Exchange
    if (selectedFilter === "Gift Card Exchange") {
      transactions = transactions.filter((t) => {
        const lowerName = t.name.toLowerCase();
        return (
          lowerName.includes("giftcard") || lowerName.includes("gift card")
        );
      });
    }

    // Group by date
    const grouped = groupTransactionsByDate(transactions);

    return grouped;
  }, [transactionsData, selectedFilter]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <ScreenTitle title="Transaction History" />

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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            {[1, 2].map((groupIndex) => (
              <View key={groupIndex} style={styles.groupContainer}>
                <SkeletonTitle
                  width="30%"
                  height={18}
                  style={styles.skeletonDate}
                />
                {Array.from({ length: groupIndex === 1 ? 3 : 2 }).map(
                  (_, index) => (
                    <TransactionItem
                      key={`${groupIndex}-${index}`}
                      loading={true}
                      title=""
                      amount=""
                    />
                  )
                )}
              </View>
            ))}
          </View>
        ) : error ? (
          <Error
            message="Failed to load transactions"
            onRetry={() => refetch()}
          />
        ) : filteredTransactions.length === 0 ? (
          <Empty
            title="No transactions found"
            description="You haven't made any transactions yet"
            style={{ minHeight: height - 200 }}
          />
        ) : (
          filteredTransactions.map((group) => (
            <View key={group.date} style={styles.groupContainer}>
              <Text style={styles.dateText}>{group.date}</Text>
              {group.transactions.map((transaction) => {
                const { time, date } = parseDateString(transaction.date);
                // Remove +/- prefix and clean the amount
                const amount = transaction.amount;
                const type = transaction.amount.startsWith("+")
                  ? "credit"
                  : transaction.amount.startsWith("-")
                  ? "debit"
                  : undefined;
                const icon = getTransactionIcon(transaction.name);
                const transactionType = getTransactionType(transaction.name);

                // Prepare transaction data for view-details screen
                const handlePress = () => {
                  // Clean amount: remove currency symbols, commas, and whitespace for storage

                  const transactionData = {
                    amount: transaction.amount,
                    reference: transaction.reference?.toString(),
                    date: date,
                    time: time,
                    name: transaction.name,
                    id: transaction.id,
                  };

                  router.push({
                    pathname: "/view-details",
                    params: {
                      type: transactionType,
                      transactionData: JSON.stringify(transactionData),
                    },
                  });
                };

                return (
                  <TransactionItem
                    key={transaction.id.toString()}
                    title={transaction.name}
                    time={time}
                    amount={amount}
                    type={type}
                    icon={icon}
                    onPress={handlePress}
                    status={transaction.status}
                  />
                );
              })}
            </View>
          ))
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
  skeletonDate: {
    marginBottom: 16,
  },
  loadingContainer: {
    gap: 12,
  },
});
