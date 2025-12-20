/**
 * Services hooks - Maps bill categories to services format
 */

import { AppColors } from "@/constants/theme";
import { useBillCategories } from "@/hooks/api/use-bills";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";

// Helper function to get category icon
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

// Helper function to get category color
const getCategoryColor = (categoryCode: string): string => {
  const code = categoryCode.toUpperCase();
  switch (code) {
    case "AIRTIME":
      return AppColors.blue;
    case "MOBILEDATA":
      return AppColors.primary;
    case "CABLEBILLS":
      return AppColors.red;
    case "INTSERVICE":
      return AppColors.blueAccent;
    case "UTILITYBILLS":
      return AppColors.orange;
    case "TAX":
      return AppColors.textSecondary;
    case "DONATIONS":
      return AppColors.red;
    case "TRANSLOG":
      return AppColors.blue;
    case "DEALPAY":
      return AppColors.green;
    case "RELINST":
      return AppColors.primary;
    case "SCHPB":
      return AppColors.blueAccent;
    default:
      return AppColors.primary;
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

    return categories.map((category) => ({
      title: category.name,
      icon: getCategoryIcon(category.code),
      iconColor: "#fff",
      iconBackgroundColor: getCategoryColor(category.code),
      onPress: () => {
        router.push({
          pathname: "/bill-payment",
          params: {
            categoryCode: category.code,
            categoryName: category.name,
          },
        });
      },
    }));
  }, [categories, router]);

  return {
    services,
    isLoading,
  };
}

