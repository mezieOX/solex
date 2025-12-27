import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WithdrawalSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse withdrawal data from params
  const withdrawalData = useMemo(() => {
    try {
      // Handle both string and array formats from expo-router
      const dataParam = params.withdrawalData;
      const data = Array.isArray(dataParam)
        ? dataParam[0]
        : (dataParam as string);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }, [params.withdrawalData]);

  // Format amount with currency symbol
  const formattedAmount = useMemo(() => {
    if (!withdrawalData?.formData?.amount) return "₦0.00";
    const amount = parseFloat(withdrawalData.formData.amount);
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }, [withdrawalData]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal Successful</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>
        </View>

        {/* Amount */}
        <Text style={styles.amountText}>{formattedAmount}</Text>

        {/* Success Message */}
        <Card style={styles.messageCard}>
          <Text style={styles.successMessage}>
            {withdrawalData?.message ||
              "You have successfully withdrawn this amount from your Fiat Wallet."}
            {"\n"}Payment arrives within 5min-10mins
          </Text>
          {withdrawalData?.data?.reference && (
            <View style={styles.referenceContainer}>
              <Text style={styles.referenceLabel}>Reference:</Text>
              <Text style={styles.referenceValue}>
                {withdrawalData.data.reference}
              </Text>
            </View>
          )}
          {withdrawalData?.data?.status && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={styles.statusValue}>
                {withdrawalData.data.status.toUpperCase()}
              </Text>
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="View Details"
            onPress={() => {
              router.push({
                pathname: "/view-details",
                params: {
                  withdrawalData: params.withdrawalData as string,
                },
              });
            }}
            variant="outline"
            style={styles.viewDetailsButton}
          />
          <Button
            title="Done"
            onPress={() => router.replace("/(tabs)")}
            style={styles.doneButton}
          />
        </View>
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
  amountText: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 12,
  },
  messageCard: {
    width: "100%",
    backgroundColor: AppColors.surface,
    padding: 12,
    marginBottom: 20,
  },
  successMessage: {
    fontSize: 12,
    color: AppColors.text,
    textAlign: "center",
    lineHeight: 18,
  },
  buttonContainer: {
    width: "100%",
    gap: 8,
    marginTop: "auto",
    marginBottom: 20,
  },
  viewDetailsButton: {
    width: "100%",
  },
  doneButton: {
    width: "100%",
    marginBottom: 20,
  },
  referenceContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  referenceLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginBottom: 2,
  },
  referenceValue: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
  },
  statusContainer: {
    marginTop: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
  },
});
