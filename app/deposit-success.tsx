import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DepositSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Format amount from params
  const formattedAmount = useMemo(() => {
    const amountParam = params.amount;
    const amount = Array.isArray(amountParam)
      ? amountParam[0]
      : (amountParam as string) || "0";

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "₦0.00";
    }

    return `₦${amountValue.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [params.amount]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deposit Successful</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </View>
        </View>

        {/* Amount Card */}
        <Card style={styles.amountCard}>
          <Text style={styles.amountText}>{formattedAmount}</Text>
          <Text style={styles.successMessage}>
            You have successfully Added this amount to your Cash Wallet
          </Text>
          <Text style={styles.successSubMessage}>
            you can now use it to trade and pay bills.
          </Text>
        </Card>

        {/* Transaction Info */}
        <Text style={styles.transactionInfo}>
          This Transaction will appear in Cash Wallet
        </Text>

        {/* Done Button */}
        <Button
          title="Done"
          onPress={() => router.replace("/(tabs)")}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  amountCard: {
    width: "100%",
    backgroundColor: AppColors.surface,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  amountText: {
    fontSize: 32,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 14,
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  successSubMessage: {
    fontSize: 14,
    color: AppColors.text,
    textAlign: "center",
    lineHeight: 20,
  },
  transactionInfo: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    width: "100%",
    marginTop: "auto",
    marginBottom: 80,
  },
});
