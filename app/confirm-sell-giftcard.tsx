import { Button } from "@/components/ui/button";
import { ScreenTitle } from "@/components/ui/screen-title";
import { TransactionSummaryCard } from "@/components/ui/transaction-summary-card";
import { AppColors } from "@/constants/theme";
import { useSellGiftCard } from "@/hooks/api/use-giftcards";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface SellGiftCardParams {
  giftCardId?: string;
  brandName?: string;
  rangeId?: string;
  amount?: string;
  rate?: string;
  currency?: string;
  total?: string;
  cardCode?: string;
  pin?: string;
  notes?: string;
  cardImages?: string;
}

export default function ConfirmSellGiftCardScreen() {
  const params = useLocalSearchParams();
  const sellGiftCard = useSellGiftCard();

  // Type assertion for params
  const typedParams = params as unknown as SellGiftCardParams;

  const formatAmount = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!typedParams.rangeId || !typedParams.amount) {
      showErrorToast({ message: "Missing required information" });
      return;
    }

    // Parse images array from JSON string
    let images: string[] | undefined;
    if (typedParams.cardImages) {
      try {
        images = JSON.parse(typedParams.cardImages);
      } catch (error) {
        // If parsing fails, treat as empty array
        images = undefined;
      }
    }

    try {
      const result = await sellGiftCard.mutateAsync({
        range_id: typedParams.rangeId,
        amount: typedParams.amount,
        code: typedParams.cardCode || "",
        pin: typedParams.pin || undefined,
        notes: typedParams.notes || undefined,
        images: images && images.length > 0 ? images : undefined,
      });

      if (result) {
        showSuccessToast({
          message: "Gift card submitted for review",
        });
        // Navigate back to gift card screen
        router.replace("/(tabs)/giftcard");
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to submit gift card. Please try again.";
      showErrorToast({ message: errorMessage });

      console.log(error);
    }
  };

  const currency = typedParams.currency || "USD";
  const amountNum = parseFloat(typedParams.amount || "0");
  const rateNum = parseFloat(typedParams.rate || "0");
  const totalNum = typedParams.total
    ? parseFloat(typedParams.total)
    : amountNum * rateNum;

  const summaryRows = [
    {
      label: "Gift Card Brand",
      value: typedParams.brandName || "N/A",
    },
    {
      label: "Amount",
      value: formatAmount(amountNum, currency),
    },
    {
      label: "Rate per $1",
      value: `₦${rateNum.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
  ];

  const totalAmount = `₦${totalNum.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Sell Gift Card" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TransactionSummaryCard rows={summaryRows} totalAmount={totalAmount} />

        <Button
          title="Submit for Reviews"
          onPress={handleSubmit}
          loading={sellGiftCard.isPending}
          disabled={sellGiftCard.isPending}
          style={styles.submitButton}
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
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
  submitButton: {
    marginTop: 12,
  },
});
