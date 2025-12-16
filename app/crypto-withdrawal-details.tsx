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
import QRCode from "react-native-qrcode-svg";
import * as ClipboardLib from "expo-clipboard";
import { showSuccessToast } from "@/utils/toast";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

export default function CryptoWithdrawalDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const withdrawalData = useMemo(() => {
    try {
      const wallet = params.wallet ? JSON.parse(params.wallet as string) : null;
      return {
        wallet,
        network: params.network as string,
        address: params.address as string,
        amount: params.amount as string,
        narration: params.narration as string,
        networkFee: params.networkFee as string,
        totalAmount: params.totalAmount as string,
      };
    } catch (error) {
      return null;
    }
  }, [params]);

  // Generate reference (mock for now)
  const reference = useMemo(() => {
    return `rigo9589ijbi293nd40b94hd94d4`;
  }, []);

  // Format date
  const withdrawalDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const withdrawalTime = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  // Format amount
  const formattedAmount = useMemo(() => {
    if (!withdrawalData?.totalAmount) return "-$0.00";
    const amount = parseFloat(withdrawalData.totalAmount);
    return `-$${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }, [withdrawalData]);

  const handleCopy = async (text: string, label: string) => {
    await ClipboardLib.setStringAsync(text);
    showSuccessToast({
      message: `${label} copied to clipboard`,
    });
  };

  const handleShare = async () => {
    try {
      const receiptText = generateReceiptText();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync({
          message: receiptText,
        });
      }
    } catch (error) {
      // Handle error
    }
  };

  const handleDownload = async () => {
    try {
      const receiptText = generateReceiptText();
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { text-align: center; }
              .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <pre>${receiptText}</pre>
          </body>
        </html>
      `;
      await Print.printAsync({ html });
    } catch (error) {
      // Handle error
    }
  };

  const generateReceiptText = () => {
    return `
═══════════════════════════════
      SOLEX TRADE RECEIPT
═══════════════════════════════

Crypto Withdrawal Details

Amount: ${formattedAmount}
Crypto Address: ${withdrawalData?.address || "N/A"}
Narration: ${withdrawalData?.narration || "N/A"}
Reference: ${reference}
Withdrawal Date: ${withdrawalDate}, ${withdrawalTime}
Network Fee: ${withdrawalData?.networkFee || "0"}
Network: ${withdrawalData?.network || "N/A"}

═══════════════════════════════
    `;
  };

  // Generate QR code value
  const qrCodeValue = useMemo(() => {
    return JSON.stringify({
      type: "crypto_withdrawal",
      reference: reference,
      amount: formattedAmount,
      address: withdrawalData?.address,
      network: withdrawalData?.network,
      date: `${withdrawalDate}, ${withdrawalTime}`,
    });
  }, [reference, formattedAmount, withdrawalData, withdrawalDate, withdrawalTime]);

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
        {/* Title */}
        <Text style={styles.title}>Crypto Withdrawal Details</Text>

        {/* Details Section */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>{formattedAmount}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Crypto Address</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>
                {withdrawalData?.address || "N/A"}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  withdrawalData?.address &&
                  handleCopy(withdrawalData.address, "Crypto Address")
                }
              >
                <Ionicons
                  name="copy-outline"
                  size={20}
                  color={AppColors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Narration</Text>
            <Text style={styles.detailValue}>
              {withdrawalData?.narration || "N/A"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.referenceText}>{reference}</Text>
              <TouchableOpacity onPress={() => handleCopy(reference, "Reference")}>
                <Ionicons
                  name="copy-outline"
                  size={20}
                  color={AppColors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Withdrawal Date</Text>
            <Text style={styles.detailValue}>
              {withdrawalDate}, {withdrawalTime}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network Fee</Text>
            <Text style={styles.detailValue}>
              {withdrawalData?.networkFee || "0"}
            </Text>
          </View>
        </View>

        {/* QR Code and Report Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrCodeContainer}>
            <QRCode value={qrCodeValue} size={150} color="#000" backgroundColor="#fff" />
          </View>
          <TouchableOpacity style={styles.reportButton}>
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Share"
            onPress={handleShare}
            style={styles.shareButton}
          />
          <Button
            title="Download"
            onPress={handleDownload}
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
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 24,
  },
  detailsCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.text,
    fontFamily: "monospace",
    lineHeight: 18,
  },
  referenceText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.text,
    fontFamily: "monospace",
  },
  qrSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24,
  },
  qrCodeContainer: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
  },
  reportButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  shareButton: {
    flex: 1,
  },
  downloadButton: {
    flex: 1,
  },
});

