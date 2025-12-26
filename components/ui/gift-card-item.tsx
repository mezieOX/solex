import { AppColors } from "@/constants/theme";
import { GiftCardProduct } from "@/services/api/giftcards";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GiftCardItemProps {
  product: GiftCardProduct;
  onPress: () => void;
  formatAmount: (amount: number, currency: string) => string;
}

export function GiftCardItem({
  product,
  onPress,
  formatAmount,
}: GiftCardItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.logo }}
          style={styles.image}
          contentFit="contain"
        />
        {product.discount_percentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {product.discount_percentage}% OFF
            </Text>
          </View>
        )}
      </View>
      <View style={styles.banner}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand.name}
        </Text>
        <Text style={styles.price}>
          {product.denomination_type === "FIXED"
            ? formatAmount(
                product.min_recipient_amount,
                product.recipient_currency
              )
            : formatAmount(
                product.min_recipient_amount,
                product.recipient_currency
              )}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: AppColors.surface,
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: AppColors.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: AppColors.red,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
  },
  brand: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },
});

