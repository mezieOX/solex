import { Button } from "@/components/ui/button";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ViewDetailsScreen() {
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
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed;
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

  // Format account number (mask middle digits)
  const maskedAccountNumber = useMemo(() => {
    if (!withdrawalData?.formData?.account_number) return "";
    const account = withdrawalData.formData.account_number;
    if (account.length <= 4) return account;
    const start = account.substring(0, 3);
    const end = account.substring(account.length - 3);
    return `${start}****${end}`;
  }, [withdrawalData]);

  // Get current date and time
  const currentDate = useMemo(() => {
    const now = new Date();
    const date = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return { date, time };
  }, []);

  // Generate a dummy QR code placeholder
  const QRCodePlaceholder = () => (
    <View style={styles.qrCodeContainer}>
      <View style={styles.qrCodeGrid}>
        {Array.from({ length: 25 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.qrCodeSquare,
              Math.random() > 0.5 && styles.qrCodeSquareFilled,
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Header */}
        <Text style={styles.successHeader}>Withdrawal Successful</Text>

        {/* Transaction Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>{formattedAmount}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Receiver</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>
                {withdrawalData?.formData?.account_name || "N/A"}
              </Text>
              <Text style={styles.detailSubValue}>
                {maskedAccountNumber ||
                  withdrawalData?.formData?.account_number ||
                  "N/A"}
              </Text>
              <Text style={styles.detailSubValue}>
                {withdrawalData?.formData?.bank_name || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {withdrawalData?.data?.status && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.detailValue, styles.statusValue]}>
                  {withdrawalData.data.status.toUpperCase()}
                </Text>
              </View>
              <View style={styles.separator} />
            </>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>
                {withdrawalData?.data?.reference?.trim() || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Withdrawal Date</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>{currentDate.date}</Text>
              <Text style={styles.detailSubValue}>{currentDate.time}</Text>
            </View>
          </View>
        </View>

        {/* QR Code and Report */}
        <View style={styles.qrReportSection}>
          <QRCodePlaceholder />
          <TouchableOpacity style={styles.reportButton}>
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Share"
            onPress={() => {
              // Handle share
            }}
            style={styles.shareButton}
          />
          <Button
            title="Download"
            onPress={() => {
              // Handle download
            }}
            variant="outline"
            style={styles.downloadButton}
          />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  successHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    textAlign: "right",
  },
  detailValueContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  detailSubValue: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: AppColors.border,
    opacity: 0.3,
  },
  qrReportSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24,
  },
  qrCodeContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  qrCodeGrid: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
  },
  qrCodeSquare: {
    width: "18%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
  },
  qrCodeSquareFilled: {
    backgroundColor: "#000000",
  },
  reportButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    flex: 1,
  },
  downloadButton: {
    flex: 1,
  },
  statusValue: {
    color: AppColors.primary,
  },
});
