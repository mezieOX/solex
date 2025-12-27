import {
  SkeletonAvatar,
  SkeletonText,
  SkeletonTitle,
} from "@/components/skeleton";
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
  loading?: boolean;
  status?: "Pending" | "Confirmed" | "Failed";
}

export function TransactionItem({
  title,
  time,
  amount,
  type,
  icon,
  subtitle,
  change,
  status,
  onPress,
  loading = false,
}: TransactionItemProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.dashedLine} />
        <View style={styles.content}>
          <SkeletonAvatar size={36} type="circle" style={styles.skeletonIcon} />
          <View style={styles.textContainer}>
            <SkeletonTitle width="70%" style={styles.skeletonTitle} />
            <SkeletonText width="50%" rows={1} />
          </View>
          <View style={styles.amountContainer}>
            <SkeletonText width={80} rows={1} style={styles.skeletonAmount} />
            {change && (
              <SkeletonText width={60} rows={1} style={styles.skeletonChange} />
            )}
          </View>
        </View>
      </View>
    );
  }

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
            <Ionicons name={defaultIcon.name} size={18} color={"#000"} />
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
          <Text style={[styles.amount, { color: amountColor }]}>{amount}</Text>
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
          {status ? (
            <Text
              style={[
                styles.status,
                {
                  color:
                    status === "Pending"
                      ? AppColors.warning
                      : status === "Confirmed"
                      ? AppColors.success
                      : AppColors.error,
                },
              ]}
            >
              {status}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  dashedLine: {
    height: 1,
    marginBottom: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  time: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
  change: {
    fontSize: 12,
    marginTop: 2,
  },
  iconText: {
    fontSize: 18,
  },
  skeletonIcon: {
    marginRight: 0,
  },
  skeletonTitle: {
    marginBottom: 6,
  },
  skeletonAmount: {
    marginBottom: 2,
  },
  skeletonChange: {
    marginTop: 2,
  },
  status: {
    fontSize: 10,
    color: AppColors.textSecondary,
  },
});
