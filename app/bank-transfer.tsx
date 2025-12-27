import { Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useUser } from "@/hooks/api/use-auth";
import { showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as ClipboardLib from "expo-clipboard";
import { useFocusEffect, useRouter } from "expo-router";
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
  const [, setTimeRemaining] = useState(EXPIRY_MINUTES * 60);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const { data: user } = useUser();

  useFocusEffect(
    React.useCallback(() => {
      if (!user?.has_account) {
        router.replace("/virtual-account");
      }
    }, [user, router])
  );

  const ACCOUNT_NUMBER = user?.va_account_number || "N/A";
  const ACCOUNT_NAME = user?.va_account_name || "N/A";
  const BANK_NAME = user?.va_bank_name || "N/A";

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
      <ScreenTitle title="Bank Transfer" />

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
              <Ionicons name="business" size={18} color="#FFFFFF" />
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
                    size={16}
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
                    size={16}
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
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  transferCard: {
    backgroundColor: AppColors.surface,
    padding: 12,
    paddingBottom: 24,
  },
  amountText: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  instructions: {
    marginBottom: 12,
    gap: 8,
  },
  instructionText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  expiryText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  bankInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 10,
  },
  bankIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  bankName: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  accountSection: {
    gap: 12,
  },
  accountField: {
    gap: 6,
  },
  accountLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  accountValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  accountValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  copyButton: {
    padding: 8,
  },
});
