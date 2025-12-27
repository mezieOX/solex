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
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Helper function to get bank icon data
const getBankIconData = (
  bankCode?: string,
  bankName?: string
): {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
} => {
  // Return default icon
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

  // Listen to keyboard show/hide events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleOpenSheet = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleSelectBank = useCallback((bank: Bank) => {
    setSelectedBank(bank);
    setSearchQuery(""); // Clear search when bank is selected
    setIsModalVisible(false);
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

    // Pre-compute icon data to avoid calling getBankIconData multiple times
    return filtered.map((bank) => ({
      ...bank,
      iconData: getBankIconData(bank.code, bank.name),
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
      <ScreenTitle title="Fiat Withdrawal" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Bank Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Bank</Text>
            <TouchableOpacity onPress={handleOpenSheet}>
              <Ionicons name="chevron-down" size={18} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.accountCard}
            onPress={handleOpenSheet}
            activeOpacity={0.8}
          >
            {selectedBank ? (
              (() => {
                const bankIconData = getBankIconData(
                  selectedBank.code,
                  selectedBank.name
                );
                return (
                  <>
                    <View
                      style={[
                        styles.accountIcon,
                        { backgroundColor: bankIconData.iconBg },
                      ]}
                    >
                      <Ionicons
                        name={bankIconData.icon}
                        size={18}
                        color={bankIconData.iconColor}
                      />
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>
                        {selectedBank.name}
                      </Text>
                    </View>
                  </>
                );
              })()
            ) : (
              <Text style={styles.placeholderText}>
                {isLoadingBanks ? "Loading..." : "Select a bank"}
              </Text>
            )}
            <Ionicons
              name="chevron-forward"
              size={18}
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
        {/* Amount Input */}
        <View style={[styles.section, { marginTop: -18 }]}>
          <Text style={styles.label}>Amount</Text>
          <Input
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            style={styles.amountInput}
          />
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

      {/* Modal for Account Selection */}
      <Modal
        visible={isModalVisible && !isLoadingBanks}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                height: isKeyboardVisible ? height * 0.6 : height * 0.9,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose or Connect Account</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={18} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search banks..."
                style={styles.searchInput}
                placeholderTextColor={AppColors.textSecondary}
              />
            </View>

            {/* Bank List Container */}
            <View style={styles.bankListContainer}>
              {banksError ? (
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
                        <View style={styles.accountInfo}>
                          <Text style={styles.accountName}>{bank.name}</Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
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
                  {...(filteredBanks && filteredBanks.length === 0
                    ? { style: styles.emptyListContainer }
                    : { contentContainerStyle: { paddingBottom: 10 } })}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  updateCellsBatchingPeriod={50}
                  initialNumToRender={10}
                  windowSize={10}
                />
              )}
            </View>

            <Button
              title="Connect New Account"
              onPress={() => {
                // Handle connect new account
                setIsModalVisible(false);
              }}
              variant="outline"
              style={styles.connectButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 8,
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  accountInfo: {
    flex: 1,
  },
  accountNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 2,
  },
  accountName: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  accountNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  accountNameIcon: {
    marginRight: 4,
  },
  accountNameText: {
    fontSize: 12,
    color: AppColors.text,
    fontWeight: "500",
  },
  accountNameError: {
    fontSize: 11,
    color: "#FF6B6B",
    marginTop: 2,
  },
  button: {
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  bankListContainer: {
    flex: 1,
    marginVertical: 16,
    minHeight: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
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
