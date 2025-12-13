import { Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useUser } from "@/hooks/api/use-auth";
import { showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as ClipboardLib from "expo-clipboard";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const EXPIRY_MINUTES = 60;

export default function BankTransferScreen() {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(EXPIRY_MINUTES * 60);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const { data: user } = useUser();
  console.log(user);

  const ACCOUNT_NUMBER = user?.va_account_number || "N/A";
  const ACCOUNT_NAME = user?.va_account_name || "N/A";
  const BANK_NAME = user?.va_bank_name || "N/A";
  const AMOUNT = "N50,000.00";

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyAccount = async () => {
    const accountNumber = user?.va_account_number || ACCOUNT_NUMBER;
    await ClipboardLib.setStringAsync(accountNumber);
    setCopiedAccount(true);
    showSuccessToast({
      message: "Account number copied to clipboard",
    });
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyName = async () => {
    const accountName = user?.va_account_name || ACCOUNT_NAME;
    await ClipboardLib.setStringAsync(accountName);
    setCopiedName(true);
    showSuccessToast({
      message: "Account name copied to clipboard",
    });
    setTimeout(() => setCopiedName(false), 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <ScreenTitle title="Bank Transfer" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.transferCard}>
          {/* Amount */}
          {/* <Text style={styles.amountText}>{AMOUNT}</Text> */}

          {/* Instructions */}
          {/* <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              You are to send exactly {AMOUNT} to the account below
            </Text>
            <Text style={styles.instructionText}>
              Do not re-use this account after the transaction
            </Text>
            <View style={styles.expiryRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={AppColors.textSecondary}
              />
              <Text style={styles.expiryText}>
                Account Expires after {formatTime(timeRemaining)}Min
              </Text>
            </View>
          </View> */}

          {/* Bank Info */}
          <View style={styles.bankInfo}>
            <View style={[styles.bankIcon, { backgroundColor: AppColors.red }]}>
              <Ionicons name="business" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.bankName}>{BANK_NAME}</Text>
          </View>

          {/* Account Details */}
          <View style={styles.accountSection}>
            <View style={styles.accountField}>
              <Text style={styles.accountLabel}>Account Number</Text>
              <View style={styles.accountValueContainer}>
                <Text style={styles.accountValue}>{ACCOUNT_NUMBER}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyAccount}
                >
                  <Ionicons
                    name={copiedAccount ? "checkmark" : "copy-outline"}
                    size={20}
                    color={AppColors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.accountField}>
              <Text style={styles.accountLabel}>Account Name</Text>
              <View style={styles.accountValueContainer}>
                <Text style={styles.accountValue}>{ACCOUNT_NAME}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyName}
                >
                  <Ionicons
                    name={copiedName ? "checkmark" : "copy-outline"}
                    size={20}
                    color={AppColors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  transferCard: {
    backgroundColor: AppColors.surface,
    padding: 20,
    paddingBottom: 40,
  },
  amountText: {
    fontSize: 32,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 24,
    textAlign: "center",
  },
  instructions: {
    marginBottom: 24,
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  expiryText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  bankInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 12,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  bankName: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
  },
  accountSection: {
    gap: 20,
  },
  accountField: {
    gap: 8,
  },
  accountLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  accountValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  accountValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  copyButton: {
    padding: 8,
  },
});
