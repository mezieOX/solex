/**
 * Services hooks - Maps bill categories to services format
 */

import { AirtimeIcon } from "@/components/ui/icons/airtime-icon";
import { DataIcon } from "@/components/ui/icons/data-icon";
import { DealsIcon } from "@/components/ui/icons/deals-icon";
import { ElectricityIcon } from "@/components/ui/icons/electricity-icon";
import { InternetIcon } from "@/components/ui/icons/internet-icon";
import { MoreIcon } from "@/components/ui/icons/more-icon";
import { TvIcon } from "@/components/ui/icons/tv-icon";
import { AppColors } from "@/constants/theme";
import { useBillCategories } from "@/hooks/api/use-bills";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";

// Helper function to get category custom icon
const getCategoryCustomIcon = (
  categoryCode: string,
  color: string
): React.ReactElement | null => {
  const code = categoryCode.toUpperCase();
  switch (code) {
    case "AIRTIME":
      return React.createElement(AirtimeIcon, { size: 24, color });
    case "MOBILEDATA":
      return React.createElement(DataIcon, { size: 24, color });
    case "CABLEBILLS":
      return React.createElement(TvIcon, { size: 24, color });
    case "INTSERVICE":
      return React.createElement(InternetIcon, { size: 24, color });
    case "UTILITYBILLS":
      return React.createElement(ElectricityIcon, { size: 24, color });
    case "TAX":
      return null; // Use Expo Ionicons
    case "DONATIONS":
      return null; // Use Expo Ionicons
    case "TRANSLOG":
      return null; // Use Expo Ionicons
    case "DEALPAY":
      return React.createElement(DealsIcon, { size: 24, color });
    case "RELINST":
      return null; // Use Expo Ionicons (people)
    case "SCHPB":
      return null; // Use Expo Ionicons (school)
    default:
      return React.createElement(MoreIcon, { size: 24, color });
  }
};

// Helper function to get category icon (kept for backward compatibility)
const getCategoryIcon = (
  categoryCode: string
): keyof typeof Ionicons.glyphMap => {
  const code = categoryCode.toUpperCase();
  switch (code) {
    case "AIRTIME":
      return "phone-portrait";
    case "MOBILEDATA":
      return "cellular";
    case "CABLEBILLS":
      return "tv";
    case "INTSERVICE":
      return "wifi";
    case "UTILITYBILLS":
      return "flash";
    case "TAX":
      return "document-text";
    case "DONATIONS":
      return "heart";
    case "TRANSLOG":
      return "car";
    case "DEALPAY":
      return "card";
    case "RELINST":
      return "people";
    case "SCHPB":
      return "school";
    default:
      return "receipt";
  }
};

// Helper function to get category short name
const getCategoryName = (categoryCode: string): string => {
  const code = categoryCode.toUpperCase();
  switch (code) {
    case "AIRTIME":
      return "Airtime";
    case "MOBILEDATA":
      return "Data";
    case "CABLEBILLS":
      return "Tv";
    case "INTSERVICE":
      return "Internet";
    case "UTILITYBILLS":
      return "Electricity";
    case "TAX":
      return "Tax";
    case "DONATIONS":
      return "Donate";
    case "TRANSLOG":
      return "Transport";
    case "DEALPAY":
      return "Ticket";
    case "RELINST":
      return "Relief";
    case "SCHPB":
      return "Betting";
    default:
      return "More";
  }
};

/**
 * Hook to get services from bill categories
 */
export function useServices() {
  const router = useRouter();
  const { data: categories, isLoading } = useBillCategories();

  // Map bill categories to services format
  const services = useMemo(() => {
    if (!categories) return [];

    return categories.map((category) => {
      const customIcon = getCategoryCustomIcon(category.code, "#fff");
      return {
        title: getCategoryName(category.code),
        icon: getCategoryIcon(category.code),
        iconColor: "#fff",
        iconSize: 24,
        iconBackgroundColor: AppColors.redAccent,
        ...(customIcon && { customIcon }),
        onPress: () => {
          router.push({
            pathname: "/bill-payment",
            params: {
              categoryCode: category.code,
              categoryName: category.name,
            },
          });
        },
      };
    });
  }, [categories, router]);

  return {
    services,
    isLoading,
  };
}
