/**
 * Bills hooks using TanStack Query
 */

import { billsApi } from "@/services/api/bills";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const billsKeys = {
  all: ["bills"] as const,
  categories: () => [...billsKeys.all, "categories"] as const,
  billers: (category: string) =>
    [...billsKeys.all, "billers", category] as const,
  items: (biller_code: string) =>
    [...billsKeys.all, "items", biller_code] as const,
};

/**
 * Hook to get all bill categories
 */
export function useBillCategories() {
  return useQuery({
    queryKey: billsKeys.categories(),
    queryFn: () => billsApi.getCategories(),
    retry: false,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (categories don't change often)
  });
}

/**
 * Hook to get billers for a category
 */
export function useBillers(category: string, enabled: boolean = true) {
  return useQuery({
    queryKey: billsKeys.billers(category),
    queryFn: () => billsApi.getBillers(category),
    enabled: enabled && !!category,
    retry: false,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to get bill items for a biller
 */
export function useBillItems(biller_code: string, enabled: boolean = true) {
  return useQuery({
    queryKey: billsKeys.items(biller_code),
    queryFn: () => billsApi.getBillItems(biller_code),
    enabled: enabled && !!biller_code,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to validate customer
 */
export function useValidateCustomer() {
  return useMutation({
    mutationFn: (data: {
      biller_code: string;
      item_code: string;
      customer: string;
    }) => billsApi.validateCustomer(data),
  });
}

/**
 * Hook to validate customer (query version - auto-fetches when enabled)
 */
export function useValidateCustomerQuery(
  biller_code: string,
  item_code: string,
  customer: string,
  enabled: boolean = false
) {
  return useQuery({
    queryKey: [
      ...billsKeys.all,
      "validate-customer",
      biller_code,
      item_code,
      customer,
    ],
    queryFn: () =>
      billsApi.validateCustomer({
        biller_code,
        item_code,
        customer,
      }),
    enabled: enabled && !!biller_code && !!item_code && !!customer,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to pay bill
 */
export function usePayBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      category: string;
      biller_code: string;
      item_code: string;
      customer: string;
      amount: string;
    }) => billsApi.payBill(data),
    onSuccess: () => {
      // Invalidate wallets and transactions after payment
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
