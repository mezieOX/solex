import { Button } from "@/components/ui/button";
import { AppColors } from "@/constants/theme";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
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

// Transaction type definitions
type TransactionType =
  | "withdrawal"
  | "deposit"
  | "transfer"
  | "exchange"
  | "payment"
  | "giftcard"
  | "giftcard_buy"
  | "giftcard_sell"
  | "other";

interface TransactionData {
  // Common fields
  amount?: string | number;
  currency?: string;
  status?: string;
  reference?: string;
  date?: string;
  time?: string;

  // Transaction-specific data
  formData?: {
    account_name?: string;
    account_number?: string;
    bank_name?: string;
    [key: string]: any;
  };

  // API response data
  data?: {
    status?: string;
    reference?: string;
    [key: string]: any;
  };

  // Additional fields
  [key: string]: any;
}

interface TransactionConfig {
  type: TransactionType;
  title: string;
  successMessage: string;
  receiptTitle: string;
  dateLabel: string;
  recipientLabel?: string;
  senderLabel?: string;
  showRecipient?: boolean;
  showSender?: boolean;
}

export default function ViewDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get transaction type from params (defaults to withdrawal for backward compatibility)
  const transactionType =
    (params.type as TransactionType) ||
    (params.withdrawalData ? "withdrawal" : "other");

  // Parse transaction data from params
  const transactionData = useMemo(() => {
    try {
      // Try different param names for backward compatibility
      const dataParam =
        params.transactionData ||
        params.withdrawalData ||
        params.depositData ||
        params.data;
      const data = Array.isArray(dataParam)
        ? dataParam[0]
        : (dataParam as string);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed as TransactionData;
    } catch (error) {
      return null;
    }
  }, [
    params.transactionData,
    params.withdrawalData,
    params.depositData,
    params.data,
  ]);

  // Get transaction configuration based on type
  const config = useMemo((): TransactionConfig => {
    const baseConfig = {
      type: transactionType,
      dateLabel: "Transaction Date",
      showRecipient: true,
      showSender: false,
    };

    switch (transactionType) {
      case "withdrawal":
        return {
          ...baseConfig,
          title: "Withdrawal Details",
          successMessage: "Withdrawal Successful",
          receiptTitle: "Withdrawal Receipt",
          recipientLabel: "Receiver",
          dateLabel: "Withdrawal Date",
        };
      case "deposit":
        return {
          ...baseConfig,
          title: "Deposit Details",
          successMessage: "Deposit Successful",
          receiptTitle: "Deposit Receipt",
          recipientLabel: "Account",
          dateLabel: "Deposit Date",
        };
      case "transfer":
        return {
          ...baseConfig,
          title: "Transfer Details",
          successMessage: "Transfer Successful",
          receiptTitle: "Transfer Receipt",
          recipientLabel: "Recipient",
          senderLabel: "Sender",
          showSender: true,
          dateLabel: "Transfer Date",
        };
      case "exchange":
        return {
          ...baseConfig,
          title: "Exchange Details",
          successMessage: "Exchange Successful",
          receiptTitle: "Exchange Receipt",
          recipientLabel: "Recipient",
          dateLabel: "Exchange Date",
        };
      case "payment":
        return {
          ...baseConfig,
          title: "Payment Details",
          successMessage: "Payment Successful",
          receiptTitle: "Payment Receipt",
          recipientLabel: "Payee",
          dateLabel: "Payment Date",
        };
      case "giftcard":
      case "giftcard_buy":
        return {
          ...baseConfig,
          title: "Gift Card Purchase",
          successMessage: "Gift Card Purchased Successfully",
          receiptTitle: "Gift Card Receipt",
          recipientLabel: "Product",
          dateLabel: "Purchase Date",
        };
      case "giftcard_sell":
        return {
          ...baseConfig,
          title: "Gift Card Sale",
          successMessage: "Gift Card Sale Submitted Successfully",
          receiptTitle: "Gift Card Sale Receipt",
          recipientLabel: "Product",
          dateLabel: "Sale Date",
        };
      default:
        return {
          ...baseConfig,
          title: "Transaction Details",
          successMessage: "Transaction Successful",
          receiptTitle: "Transaction Receipt",
          recipientLabel: "Recipient",
          dateLabel: "Transaction Date",
        };
    }
  }, [transactionType]);

  // Format amount with currency symbol
  const formattedAmount = useMemo(() => {
    const amount =
      transactionData?.formData?.amount ||
      transactionData?.amount ||
      transactionData?.data?.amount ||
      "0";

    return amount;
  }, [transactionData]);

  // Format account number (mask middle digits)
  const maskedAccountNumber = useMemo(() => {
    const accountNumber =
      transactionData?.formData?.account_number ||
      transactionData?.account_number ||
      "";
    if (!accountNumber || accountNumber.length <= 4) return accountNumber;
    const start = accountNumber.substring(0, 3);
    const end = accountNumber.substring(accountNumber.length - 3);
    return `${start}****${end}`;
  }, [transactionData]);

  // Get current date and time (use from transaction data if available)
  const currentDate = useMemo(() => {
    if (transactionData?.date && transactionData?.time) {
      return {
        date: transactionData.date,
        time: transactionData.time,
      };
    }

    // Parse from createdAt or timestamp if available
    if (transactionData?.createdAt) {
      const dateObj = new Date(transactionData.createdAt);
      const date = dateObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const time = dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return { date, time };
    }

    // Fallback to current date/time
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
  }, [transactionData]);

  // Generate QR code value from transaction data
  const qrCodeValue = useMemo(() => {
    const reference =
      transactionData?.data?.reference?.trim() ||
      transactionData?.reference?.trim() ||
      transactionData?.id?.toString() ||
      "";

    // Create a JSON object with transaction details for the QR code
    const qrData = {
      type: transactionType,
      reference: reference,
      amount: formattedAmount,
      date: currentDate.date,
      time: currentDate.time,
      name: transactionData?.name || "",
    };

    // Return as JSON string, or just the reference if no reference available
    return reference ? JSON.stringify(qrData) : "http://awesome.link.qr";
  }, [transactionData, transactionType, formattedAmount, currentDate]);

  // Generate receipt text for sharing
  const generateReceiptText = () => {
    const recipientName = transactionData?.formData?.account_name || "N/A";
    const recipientAccount = transactionData?.formData?.account_number || "N/A";
    const recipientBank = transactionData?.formData?.bank_name || "N/A";
    const reference =
      transactionData?.data?.reference?.trim() ||
      transactionData?.reference?.trim() ||
      "N/A";

    const transactionName = transactionData?.name || "";

    const lines = [
      "═══════════════════════════════",
      "      SOLEX TRADE RECEIPT",
      "═══════════════════════════════",
      "",
      config.successMessage,
      "",
    ];

    if (transactionName) {
      lines.push(`Transaction: ${transactionName}`, "");
    }

    lines.push(`Amount: ${formattedAmount}`, "");

    // Add recipient/sender details if applicable
    if (config.showRecipient && recipientName !== "N/A") {
      lines.push(`${config.recipientLabel} Details:`, "");
      lines.push(`  Name: ${recipientName}`);
      if (recipientAccount !== "N/A") {
        lines.push(`  Account: ${recipientAccount}`);
      }
      if (recipientBank !== "N/A") {
        lines.push(`  Bank: ${recipientBank}`);
      }
      lines.push("");
    }

    lines.push(
      `Reference: ${reference}`,
      "",
      `Date: ${currentDate.date}`,
      `Time: ${currentDate.time}`,
      "",
      "═══════════════════════════════",
      "Thank you for using Solex Trade",
      "═══════════════════════════════"
    );

    return lines.filter((line) => line !== "").join("\n");
  };

  // Generate HTML receipt for PDF
  const generateReceiptHTML = () => {
    const recipientName = transactionData?.formData?.account_name || "N/A";
    const recipientAccount = transactionData?.formData?.account_number || "N/A";
    const recipientBank = transactionData?.formData?.bank_name || "N/A";
    const reference =
      transactionData?.data?.reference?.trim() ||
      transactionData?.reference?.trim() ||
      "N/A";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 18px;
              color: #666;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 25px;
            }
            .label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .value {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 15px;
            }
            .divider {
              border-top: 1px solid #ddd;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #000;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">SOLEX TRADE</div>
            <div class="subtitle">${config.receiptTitle}</div>
          </div>
          
          ${
            transactionData?.name
              ? `
          <div class="section">
            <div class="label">Transaction</div>
            <div class="value">${transactionData.name}</div>
          </div>
          
          <div class="divider"></div>
          `
              : ""
          }
          
          <div class="section">
            <div class="label">Amount</div>
            <div class="value">${formattedAmount}</div>
          </div>
          
          <div class="divider"></div>
          
          ${
            config.showRecipient && recipientName !== "N/A"
              ? `
          <div class="section">
            <div class="label">${config.recipientLabel}</div>
            <div class="value">${recipientName}</div>
            ${
              recipientAccount !== "N/A"
                ? `<div style="font-size: 14px; color: #666; margin-top: 5px;">${recipientAccount}</div>`
                : ""
            }
            ${
              recipientBank !== "N/A"
                ? `<div style="font-size: 14px; color: #666; margin-top: 5px;">${recipientBank}</div>`
                : ""
            }
          </div>
          
          <div class="divider"></div>
          `
              : ""
          }
          
          <div class="section">
            <div class="label">Reference</div>
            <div class="value">${reference}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="section">
            <div class="label">${config.dateLabel}</div>
            <div class="value">${currentDate.date}</div>
            <div style="font-size: 14px; color: #666; margin-top: 5px;">
              ${currentDate.time}
            </div>
          </div>
          
          <div class="footer">
            Thank you for using Solex Trade
          </div>
        </body>
      </html>
    `;
  };

  // Handle share functionality
  const handleShare = async () => {
    try {
      const receiptText = generateReceiptText();
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Create a temporary file to share
        const { uri } = await Print.printToFileAsync({
          html: generateReceiptHTML(),
          base64: false,
        });
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Share Receipt",
        });
        showSuccessToast({
          message: "Receipt shared successfully",
        });
      } else {
        // Fallback: share as text
        await Sharing.shareAsync(receiptText);
        showSuccessToast({
          message: "Receipt shared successfully",
        });
      }
    } catch (error: any) {
      showErrorToast({
        message: error?.message || "Failed to share receipt. Please try again.",
      });
    }
  };

  // Handle download functionality
  const handleDownload = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: generateReceiptHTML(),
        base64: false,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Save Receipt",
        });
        showSuccessToast({
          message: "Receipt downloaded successfully",
        });
      } else {
        showErrorToast({
          message: "Sharing is not available on this device",
        });
      }
    } catch (error: any) {
      showErrorToast({
        message:
          error?.message || "Failed to download receipt. Please try again.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{config.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Header */}
        <Text style={styles.successHeader}>{config.successMessage}</Text>

        {/* Transaction Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>{formattedAmount}</Text>
          </View>

          <View style={styles.separator} />

          {transactionData?.name && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction</Text>
                <Text style={styles.detailValue}>{transactionData.name}</Text>
              </View>
              <View style={styles.separator} />
            </>
          )}

          {config.showRecipient &&
            transactionData?.formData?.account_name &&
            transactionData?.formData?.account_name !== "N/A" && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {config.recipientLabel}
                  </Text>
                  <View style={styles.detailValueContainer}>
                    <Text style={styles.detailValue}>
                      {transactionData.formData.account_name}
                    </Text>
                    {transactionData?.formData?.account_number && (
                      <Text style={styles.detailSubValue}>
                        {maskedAccountNumber ||
                          transactionData.formData.account_number}
                      </Text>
                    )}
                    {transactionData?.formData?.bank_name && (
                      <Text style={styles.detailSubValue}>
                        {transactionData.formData.bank_name}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.separator} />
              </>
            )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>
                {transactionData?.data?.reference?.trim() ||
                  transactionData?.reference?.trim() ||
                  "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.detailValueContainer}>
              <Text
                style={[
                  styles.detailValue,
                  styles.statusValue,
                  {
                    color:
                      (transactionData?.status ||
                        transactionData?.data?.status) === "Confirmed"
                        ? AppColors.green
                        : (transactionData?.status ||
                            transactionData?.data?.status) === "Pending"
                        ? AppColors.orange
                        : (transactionData?.status ||
                            transactionData?.data?.status) === "Failed"
                        ? AppColors.red
                        : AppColors.text,
                  },
                ]}
              >
                {transactionData?.status ||
                  transactionData?.data?.status ||
                  "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{config.dateLabel}</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>{currentDate.date}</Text>
              <Text style={styles.detailSubValue}>{currentDate.time}</Text>
            </View>
          </View>
        </View>

        {/* QR Code and Report */}
        <View style={styles.qrReportSection}>
          <View style={styles.qrCodeContainer}>
            <QRCode
              value={qrCodeValue}
              size={80}
              logo={require("@/assets/images/app-logo.png")}
              logoBorderRadius={300}
            />
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
  successHeader: {
    fontSize: 24,
    fontWeight: "500",
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
    borderBottomWidth: 1,
    borderBottomColor: "gray",
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 70,
    marginBottom: 80,
    backgroundColor: AppColors.surfaceLight,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
  },
  qrCodeContainer: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  reportButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "gray",
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
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
