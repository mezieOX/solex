import { AppColors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SummaryRow {
  label: string;
  value: string;
}

interface TransactionSummaryCardProps {
  rows: SummaryRow[];
  totalAmount?: string;
}

export function TransactionSummaryCard({
  rows,
  totalAmount,
}: TransactionSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Transaction Summary</Text>
      {rows.map((row, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
      {totalAmount && (
        <View style={styles.totalContainer}>
          <Text style={styles.total}>{totalAmount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  value: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
  },
  totalContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    alignItems: "center",
  },
  total: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.primary,
  },
});

