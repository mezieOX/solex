import LoadingScreen from "@/app/loading";
import Error from "@/components/error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import {
  useBanks,
  useResolveAccountQuery,
  useWithdrawFiat,
} from "@/hooks/api/use-wallet";
import { Bank } from "@/services/api/wallet";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Helper function to get bank icon and colors
const getBankIcon = (
  bankName: string
): {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
} => {
  const name = bankName.toLowerCase();
  if (name.includes("opay") || name.includes("pay")) {
    return {
      icon: "ellipse",
      iconColor: "#FFFFFF",
      iconBg: "#00D9FF",
    };
  }
  if (name.includes("first")) {
    return {
      icon: "business",
      iconColor: "#FFFFFF",
      iconBg: "#007B2D",
    };
  }
  if (name.includes("fidelity")) {
    return {
      icon: "business",
      iconColor: "#FFFFFF",
      iconBg: "#0066CC",
    };
  }
  // Default icon
  return {
    icon: "business",
    iconColor: "#FFFFFF",
    iconBg: AppColors.primary,
  };
};

export default function FiatWithdrawalScreen() {
  const router = useRouter();
  const {
    data: banks,
    isLoading: isLoadingBanks,
    error: banksError,
  } = useBanks();
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%"], []);

  // Resolve account query - automatically fetches when conditions are met
  const trimmedAccountNumber = accountNumber.trim();
  const shouldResolve =
    selectedBank &&
    trimmedAccountNumber.length === 10 &&
    /^\d+$/.test(trimmedAccountNumber);
  const {
    data: resolvedAccount,
    isLoading: isResolvingAccount,
    error: resolveAccountError,
  } = useResolveAccountQuery(
    trimmedAccountNumber,
    selectedBank?.code || "",
    shouldResolve || false
  );

  const withdrawFiat = useWithdrawFiat();

  // Show error toast when account resolution fails
  useEffect(() => {
    if (resolveAccountError) {
      const errorMessage =
        (resolveAccountError as any)?.message ||
        (resolveAccountError as any)?.data?.message ||
        "Failed to resolve account. Please check the account number and bank.";
      showErrorToast({
        message: errorMessage,
      });
    }
  }, [resolveAccountError]);

  const BackDrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const handleOpenSheet = () => {
    bottomSheetRef.current?.present();
  };

  const handleSelectBank = useCallback((bank: Bank) => {
    setSelectedBank(bank);
    setSearchQuery(""); // Clear search when bank is selected
    bottomSheetRef.current?.dismiss();
  }, []);

  // Filter banks based on search query and pre-compute icon data
  const filteredBanks = useMemo(() => {
    if (!banks) return null;

    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? banks.filter(
          (bank) =>
            bank.name.toLowerCase().includes(query) ||
            bank.code.toLowerCase().includes(query)
        )
      : banks;

    // Pre-compute icon data to avoid calling getBankIcon multiple times
    return filtered.map((bank) => ({
      ...bank,
      iconData: getBankIcon(bank.name),
    }));
  }, [banks, searchQuery]);

  const handleContinue = async () => {
    if (
      !amount.trim() ||
      !selectedBank ||
      !accountNumber.trim() ||
      !resolvedAccount?.account_name
    ) {
      return;
    }

    try {
      const result = await withdrawFiat.mutateAsync({
        amount: amount.trim(),
        bank_code: selectedBank.code,
        account_number: accountNumber.trim(),
        account_name: resolvedAccount.account_name,
      });

      if (result.status === "success" || result.status === "pending") {
        showSuccessToast({
          message: "Withdrawal initiated successfully",
        });

        // Prepare withdrawal data to pass as params
        const withdrawalData = {
          ...result,
          formData: {
            amount: amount.trim(),
            bank_name: selectedBank.name,
            bank_code: selectedBank.code,
            account_number: accountNumber.trim(),
            account_name: resolvedAccount.account_name,
          },
        };

        router.replace({
          pathname: "/withdrawal-success",
          params: {
            withdrawalData: JSON.stringify(withdrawalData),
          },
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to initiate withdrawal. Please try again.";
      showErrorToast({
        message: errorMessage,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <ScreenTitle title="Fiat Withdrawal" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount</Text>
          <Input
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            style={styles.amountInput}
          />
        </View>

        {/* Bank Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Bank</Text>
            <TouchableOpacity onPress={handleOpenSheet}>
              <Ionicons name="chevron-down" size={24} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.accountCard}
            onPress={handleOpenSheet}
            activeOpacity={0.8}
          >
            {selectedBank ? (
              <>
                <View
                  style={[
                    styles.accountIcon,
                    { backgroundColor: getBankIcon(selectedBank.name).iconBg },
                  ]}
                >
                  <Ionicons
                    name={getBankIcon(selectedBank.name).icon}
                    size={24}
                    color={getBankIcon(selectedBank.name).iconColor}
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{selectedBank.name}</Text>
                  <Text style={styles.accountNumber}>{selectedBank.code}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.placeholderText}>Select a bank</Text>
            )}
            <Ionicons
              name="chevron-forward"
              size={24}
              color={AppColors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Account Number Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Account Number</Text>
          <Input
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="Enter account number"
            keyboardType="numeric"
            maxLength={10}
            style={styles.amountInput}
          />
          {isResolvingAccount ? (
            <View style={styles.accountNameContainer}>
              <Text style={styles.accountNameText}>Resolving...</Text>
            </View>
          ) : resolvedAccount?.account_name ? (
            <View style={styles.accountNameContainer}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={AppColors.primary}
                style={styles.accountNameIcon}
              />
              <Text style={styles.accountNameText}>
                {resolvedAccount.account_name}
              </Text>
            </View>
          ) : null}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.button}
          loading={withdrawFiat.isPending}
          disabled={
            withdrawFiat.isPending ||
            !amount.trim() ||
            !selectedBank ||
            !accountNumber ||
            !resolvedAccount?.account_name
          }
        />
      </ScrollView>

      {/* Bottom Sheet for Account Selection */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enableOverDrag={false}
        enablePanDownToClose={true}
        handleComponent={null}
        index={0}
        backdropComponent={BackDrop}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        animateOnMount={true}
      >
        <BottomSheetView style={styles.bottomSheetView}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              Choose or Connect Account
            </Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()}>
              <Ionicons name="close" size={24} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search banks or bank code..."
              style={styles.searchInput}
              placeholderTextColor={AppColors.textSecondary}
            />
          </View>

          {isLoadingBanks ? (
            <LoadingScreen />
          ) : banksError ? (
            <Error message="Failed to load banks" onRetry={() => {}} />
          ) : (
            <FlatList
              data={filteredBanks || []}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item: bank }) => {
                const iconData = bank.iconData;
                const isSelected = selectedBank?.id === bank.id;
                // Extract bank properties without iconData for handleSelectBank
                const { iconData: _, ...bankData } = bank;
                return (
                  <TouchableOpacity
                    style={[
                      styles.accountListItem,
                      isSelected && styles.accountListItemSelected,
                    ]}
                    onPress={() => handleSelectBank(bankData as Bank)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.accountIcon,
                        { backgroundColor: iconData.iconBg },
                      ]}
                    >
                      <Ionicons
                        name={iconData.icon}
                        size={24}
                        color={iconData.iconColor}
                      />
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{bank.name}</Text>
                      <Text style={styles.accountNumber}>{bank.code}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={AppColors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="search-outline"
                    size={48}
                    color={AppColors.textSecondary}
                  />
                  <Text style={styles.emptyText}>
                    No banks found matching "{searchQuery}"
                  </Text>
                </View>
              )}
              // showsVerticalScrollIndicator={false}
              style={styles.accountList}
              contentContainerStyle={
                filteredBanks && filteredBanks.length === 0
                  ? styles.emptyListContainer
                  : undefined
              }
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={10}
              windowSize={10}
            />
          )}

          <Button
            title="Connect New Account"
            onPress={() => {
              // Handle connect new account
              bottomSheetRef.current?.dismiss();
            }}
            variant="outline"
            style={styles.connectButton}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 12,
  },
  amountInput: {
    marginBottom: 0,
  },
  narrationInput: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  accountName: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  accountNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  accountNameIcon: {
    marginRight: 6,
  },
  accountNameText: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "500",
  },
  accountNameError: {
    fontSize: 12,
    color: "#FF6B6B",
    marginTop: 4,
  },
  button: {
    marginTop: 20,
  },
  bottomSheetBackground: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetView: {
    flex: 1,
    paddingHorizontal: 20,
    maxHeight: height,
    paddingTop: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
  },
  accountList: {
    flex: 1,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  accountListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  accountListItemSelected: {
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  connectButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    flex: 1,
  },
  searchContainer: {},
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 12,
    textAlign: "center",
  },
});
