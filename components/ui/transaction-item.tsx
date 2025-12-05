import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TransactionItemProps {
  title: string;
  time?: string;
  amount: string;
  type?: "credit" | "debit";
  icon?: {
    name?: keyof typeof Ionicons.glyphMap;
    color?: string;
    backgroundColor?: string;
    customIcon?: React.ReactNode;
    text?: string | React.ReactNode;
  };
  subtitle?: string;
  change?: string;
  onPress?: () => void;
}

export function TransactionItem({
  title,
  time,
  amount,
  type,
  icon,
  subtitle,
  change,
  onPress,
}: TransactionItemProps) {
  const defaultIcon = icon || {
    name: "wallet",
    color: AppColors.text,
    backgroundColor: AppColors.primary,
  };

  const amountColor =
    type === "credit"
      ? AppColors.green
      : type === "debit"
      ? AppColors.red
      : AppColors.text;
  const amountPrefix = type === "credit" ? "+" : type === "debit" ? "-" : "";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dashedLine} />
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: defaultIcon.backgroundColor || AppColors.primary,
            },
          ]}
        >
          {defaultIcon.customIcon ? (
            defaultIcon.customIcon
          ) : defaultIcon.text ? (
            <Text style={styles.iconText}>{defaultIcon.text}</Text>
          ) : defaultIcon.name ? (
            <Ionicons name={defaultIcon.name} size={24} color={"#000"} />
          ) : null}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : time ? (
            <Text style={styles.time}>{time}</Text>
          ) : null}
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {amountPrefix}
            {amount}
          </Text>
          {change && (
            <Text
              style={[
                styles.change,
                {
                  color: change.startsWith("+")
                    ? AppColors.green
                    : AppColors.textSecondary,
                },
              ]}
            >
              {change}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  dashedLine: {
    height: 1,
    marginBottom: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  time: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
  change: {
    fontSize: 14,
    marginTop: 4,
  },
  iconText: {
    fontSize: 24,
  },
});
