import { ChartIcon } from "@/components/ui/icons/chart-icon";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ExchangeRateCardProps {
  giftCardValue: string;
  localCurrency: string;
  ratePerUnit: string;
}

export function ExchangeRateCard({
  giftCardValue,
  localCurrency,
  ratePerUnit,
}: ExchangeRateCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={require("@/assets/images/sell-gift-card-exchange-rate-banner.png")}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <ChartIcon size={24} color={AppColors.primary} />
          <Text style={styles.title}>Current Exchange Rate</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <Text style={styles.value}>{giftCardValue}</Text>
            <Text style={styles.label}>Gift Card Value</Text>
          </View>
          <View style={styles.centerSection}>
            <Ionicons
              name="swap-horizontal"
              size={28}
              color={AppColors.primary}
            />
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.value}>{localCurrency}</Text>
            <Text style={styles.label}>Local Currency</Text>
          </View>
        </View>
        <View style={styles.rateSection}>
          <Text style={styles.rateLabel}>Rate per $1</Text>
          <Text style={styles.rateValue}>{ratePerUnit}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
    minHeight: 180,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },
  overlay: {
    position: "relative",
    padding: 20,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  label: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
    fontWeight: "400",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
    letterSpacing: 0.5,
  },
  rateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  rateLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  rateValue: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.primary,
    letterSpacing: 0.3,
  },
});
