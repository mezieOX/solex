import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BillPaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse payment data from params
  const paymentData = useMemo(() => {
    try {
      const dataParam = params.paymentData;
      const dataString = Array.isArray(dataParam)
        ? dataParam[0]
        : (dataParam as string) || "{}";
      return JSON.parse(dataString);
    } catch {
      return null;
    }
  }, [params.paymentData]);

  // Format amount
  const formattedAmount = useMemo(() => {
    const amount = paymentData?.amount || "0";
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "₦0.00";
    }

    return `₦${amountValue.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [paymentData?.amount]);

  // Format wallet balance
  const formattedBalance = useMemo(() => {
    const balance = paymentData?.wallet_balance || "0";
    const balanceValue = parseFloat(balance);
    if (isNaN(balanceValue)) {
      return "₦0.00";
    }

    return `₦${balanceValue.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [paymentData?.wallet_balance]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Successful</Text>
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
            Bill payment completed successfully
          </Text>
          {paymentData?.category && (
            <Text style={styles.categoryText}>
              {paymentData.category} - {paymentData.biller}
            </Text>
          )}
          {paymentData?.item && (
            <Text style={styles.itemText}>Package: {paymentData.item}</Text>
          )}
          {paymentData?.customer && (
            <Text style={styles.customerText}>
              Customer: {paymentData.customer}
            </Text>
          )}
        </Card>

        {/* Payment Details */}
        {paymentData?.reference && (
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference</Text>
              <Text style={styles.detailValue}>{paymentData.reference}</Text>
            </View>
            {paymentData?.flutterwave?.flw_ref && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>
                  {paymentData.flutterwave.flw_ref}
                </Text>
              </View>
            )}
            {paymentData?.flutterwave?.reference && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Reference</Text>
                <Text style={styles.detailValue}>
                  {paymentData.flutterwave.reference}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Wallet Balance</Text>
              <Text style={[styles.detailValue, styles.balanceValue]}>
                {formattedBalance}
              </Text>
            </View>
          </Card>
        )}

        {/* Info Text */}
        <Text style={styles.infoText}>
          This transaction will appear in your transaction history
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
    backgroundColor: AppColors.green,
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
    fontSize: 16,
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
  },
  categoryText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  itemText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  customerText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: AppColors.surface,
    padding: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  balanceValue: {
    color: AppColors.green,
    fontWeight: "600",
  },
  infoText: {
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
