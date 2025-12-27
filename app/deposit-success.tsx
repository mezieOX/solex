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
          <Ionicons name="arrow-back" size={20} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deposit Successful</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
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
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 24,
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: AppColors.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  amountCard: {
    width: "100%",
    backgroundColor: AppColors.surface,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  amountText: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 12,
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 6,
    lineHeight: 18,
  },
  successSubMessage: {
    fontSize: 12,
    color: AppColors.text,
    textAlign: "center",
    lineHeight: 18,
  },
  transactionInfo: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    width: "100%",
    marginTop: "auto",
    marginBottom: 50,
  },
});
