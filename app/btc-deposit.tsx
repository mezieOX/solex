import { AppColors } from "@/constants/theme";
import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import * as ClipboardLib from "expo-clipboard";

const BITCOIN_ADDRESS =
  "bt394isht937ohg93782ge939fhh375fhfrj893g93y7593rhrjjtfhr45757575";

export default function BTCDepositScreen() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    await ClipboardLib.setStringAsync(BITCOIN_ADDRESS);
    setCopied(true);
    Alert.alert("Copied", "Bitcoin address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

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
        <Text style={styles.headerTitle}>BTC Deposit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selected Crypto */}
        <View style={styles.cryptoInfo}>
          <View style={[styles.cryptoIcon, { backgroundColor: AppColors.orange }]}>
            <Image
              source={require("@/assets/images/bitcoin.png")}
              style={styles.cryptoIconImage}
              contentFit="contain"
            />
          </View>
          <Text style={styles.cryptoName}>Bitcoin</Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.instructionText}>
            Scan the QR code to get receiver address
          </Text>
          <QRCodePlaceholder />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>Your Bitcoin Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>{BITCOIN_ADDRESS}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyAddress}
            >
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={20}
                color={AppColors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Deposit Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Minimum Deposit</Text>
            <Text style={styles.infoValue}>0.0005000 BTC</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Deposit Arrival</Text>
            <Text style={styles.infoValue}>4 Confirmations</Text>
          </View>
        </View>

        <Button
          title="Save Address"
          onPress={() => {
            Alert.alert("Success", "Address saved successfully");
          }}
          style={styles.button}
        />
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
  cryptoInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cryptoIconImage: {
    width: 24,
    height: 24,
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
  },
  qrSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  qrCodeContainer: {
    width: 250,
    height: 250,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  addressSection: {
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.text,
    fontFamily: "monospace",
    lineHeight: 18,
  },
  copyButton: {
    marginLeft: 12,
    padding: 8,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  button: {
    marginTop: 20,
  },
});

