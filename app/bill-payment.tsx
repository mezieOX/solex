import Error from "@/components/error";
import ShowImage from "@/components/show-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import {
  useBillCategories,
  useBillers,
  useBillItems,
  usePayBill,
  useValidateCustomerQuery,
} from "@/hooks/api/use-bills";
import { BillCategory, Biller, BillItem } from "@/services/api/bills";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

// Helper function to get category gradient colors
const getCategoryGradientColors = (categoryCode: string): [string, string] => {
  const code = categoryCode.toUpperCase();
  switch (code) {
    case "AIRTIME":
      return [AppColors.blue, AppColors.blueAccent];
    case "MOBILEDATA":
      return [AppColors.primary, AppColors.orangeAccent];
    case "CABLEBILLS":
      return [AppColors.redAccent, AppColors.red];
    case "INTSERVICE":
      return [AppColors.blueAccent, AppColors.blue];
    case "UTILITYBILLS":
      return [AppColors.orange, AppColors.orangeAccent];
    case "TAX":
      return [AppColors.textSecondary, AppColors.textMuted];
    case "DONATIONS":
      return [AppColors.redAccent, AppColors.red];
    case "TRANSLOG":
      return [AppColors.blue, AppColors.blueAccent];
    case "DEALPAY":
      return [AppColors.green, AppColors.greenAccent];
    case "RELINST":
      return [AppColors.primary, AppColors.orangeAccent];
    case "SCHPB":
      return [AppColors.blueAccent, AppColors.blue];
    default:
      return [AppColors.primary, AppColors.orangeAccent];
  }
};

export default function BillPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data: categories, isLoading: isLoadingCategories } =
    useBillCategories();
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | null>(
    null
  );
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);
  const [selectedItem, setSelectedItem] = useState<BillItem | null>(null);
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isBillerModalVisible, setIsBillerModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Get billers for selected category
  const {
    data: billersData,
    isLoading: isLoadingBillers,
    error: billersError,
  } = useBillers(selectedCategory?.code || "", !!selectedCategory);

  // Get items for selected biller
  const {
    data: itemsData,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useBillItems(selectedBiller?.biller_code || "", !!selectedBiller);

  // Validate customer - only if we have an item_code
  // For some billers, items might not be available, so we skip validation
  const shouldValidate =
    selectedBiller && selectedItem && customer.trim().length > 0;
  const {
    data: validatedCustomer,
    isLoading: isValidatingCustomer,
    error: validateCustomerError,
  } = useValidateCustomerQuery(
    selectedBiller?.biller_code || "",
    selectedItem?.code || "",
    customer.trim(),
    shouldValidate || false
  );

  // Check if items are available for this biller
  const hasItems = itemsData?.items && itemsData.items.length > 0;
  const itemsErrorOccurred = !!itemsError;

  const payBill = usePayBill();

  // Pre-select category from route params if provided
  useEffect(() => {
    if (categories && params.categoryCode) {
      const categoryCode = Array.isArray(params.categoryCode)
        ? params.categoryCode[0]
        : params.categoryCode;
      const category = categories.find((cat) => cat.code === categoryCode);
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [categories, params.categoryCode]);

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

  // Show error toast when validation fails
  useEffect(() => {
    if (validateCustomerError && customer.trim().length > 0) {
      const errorMessage =
        (validateCustomerError as any)?.message ||
        (validateCustomerError as any)?.data?.message ||
        "Invalid customer number. Please check and try again.";
      showErrorToast({
        message: errorMessage,
      });
    }
  }, [validateCustomerError, customer]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const query = searchQuery.toLowerCase().trim();
    return query
      ? categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(query) ||
            cat.description.toLowerCase().includes(query)
        )
      : categories;
  }, [categories, searchQuery]);

  // Filter billers based on search
  const filteredBillers = useMemo(() => {
    if (!billersData?.billers) return [];
    const query = searchQuery.toLowerCase().trim();
    return query
      ? billersData.billers.filter(
          (biller) =>
            biller.name.toLowerCase().includes(query) ||
            biller.short_name.toLowerCase().includes(query)
        )
      : billersData.billers;
  }, [billersData, searchQuery]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!itemsData?.items) return [];
    const query = searchQuery.toLowerCase().trim();
    return query
      ? itemsData.items.filter((item) =>
          item.name.toLowerCase().includes(query)
        )
      : itemsData.items;
  }, [itemsData, searchQuery]);

  const handleSelectCategory = useCallback((category: BillCategory) => {
    setSelectedCategory(category);
    setSelectedBiller(null);
    setSelectedItem(null);
    setCustomer("");
    setAmount("");
    setSearchQuery("");
    setIsCategoryModalVisible(false);
  }, []);

  const handleSelectBiller = useCallback((biller: Biller) => {
    setSelectedBiller(biller);
    setSelectedItem(null);
    setCustomer("");
    setAmount("");
    setSearchQuery("");
    setIsBillerModalVisible(false);
  }, []);

  const handleSelectItem = useCallback((item: BillItem) => {
    setSelectedItem(item);
    if (item.amount > 0) {
      setAmount(item.amount.toString());
    }
    setSearchQuery("");
    setIsItemModalVisible(false);
  }, []);

  const handleOpenContacts = useCallback(async () => {
    try {
      // Request permission to access contacts
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        showErrorToast({
          message: "Permission to access contacts is required",
        });
        return;
      }

      setIsLoadingContacts(true);
      setIsContactModalVisible(true);

      // Get contacts with phone numbers
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      // Filter contacts that have phone numbers
      const contactsWithPhones = data.filter(
        (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
      );

      setContacts(contactsWithPhones);
    } catch (error: any) {
      showErrorToast({
        message: error?.message || "Failed to load contacts. Please try again.",
      });
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  const handleSelectContact = useCallback((contact: Contacts.Contact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      // Get the first phone number
      const phoneNumber = contact.phoneNumbers[0]?.number;

      if (!phoneNumber) {
        showErrorToast({
          message: "Selected contact has no valid phone number",
        });
        return;
      }

      // Clean the phone number (remove spaces, dashes, etc.)
      const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");

      // Set the customer number
      setCustomer(cleanedNumber);

      setIsContactModalVisible(false);
      setSearchQuery("");

      showSuccessToast({
        message: `Selected ${contact.name || "contact"}`,
      });
    } else {
      showErrorToast({
        message: "Selected contact has no phone number",
      });
    }
  }, []);

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    const query = searchQuery.toLowerCase().trim();
    return query
      ? contacts.filter(
          (contact) =>
            contact.name?.toLowerCase().includes(query) ||
            contact.phoneNumbers?.some((phone) =>
              phone.number?.replace(/[\s\-\(\)]/g, "").includes(query)
            )
        )
      : contacts;
  }, [contacts, searchQuery]);

  const handlePay = async () => {
    if (
      !selectedCategory ||
      !selectedBiller ||
      !customer.trim() ||
      !amount.trim()
    ) {
      showErrorToast({
        message: "Please fill in all required fields",
      });
      return;
    }

    // If items are available, we need item selection and validation
    if (hasItems) {
      if (!selectedItem) {
        showErrorToast({
          message: "Please select a package",
        });
        return;
      }

      // Check if validation is still in progress
      if (isValidatingCustomer) {
        showErrorToast({
          message: "Please wait for customer validation to complete",
        });
        return;
      }

      // Check if validation has been attempted and succeeded
      // Validation should run when: selectedBiller, selectedItem, and customer are all present
      const validationShouldHaveRun =
        selectedBiller && selectedItem && customer.trim().length > 0;

      if (!validationShouldHaveRun) {
        showErrorToast({
          message:
            "Please ensure package is selected and customer number is entered",
        });
        return;
      }

      // If validation has an error, show it and block
      if (validateCustomerError) {
        const errorMessage =
          (validateCustomerError as any)?.message ||
          (validateCustomerError as any)?.data?.message ||
          "Invalid customer number. Please check and try again.";
        showErrorToast({
          message: errorMessage,
        });
        return;
      }

      // Check if validation succeeded - if UI shows checkmark, this should be true
      const validationSucceeded =
        validatedCustomer && validatedCustomer.customer_name;

      if (!validationSucceeded) {
        // If there's a validation error, block and show it
        if (validateCustomerError) {
          const errorMessage =
            (validateCustomerError as any)?.message ||
            (validateCustomerError as any)?.data?.message ||
            "Invalid customer number. Please check and try again.";
          showErrorToast({
            message: errorMessage,
          });
          return;
        }

        // If validation should have run but returned no data and no error,
        // it might be that the query didn't trigger or the API returned empty
        // In this case, we'll allow proceeding - the backend will validate anyway
        // This handles cases where the validation query doesn't return data but there's no error

        // Allow proceeding - backend will validate
        // The user has entered all required info, and there's no validation error
      }
    }

    // If items failed to load, we can't proceed
    if (itemsErrorOccurred) {
      showErrorToast({
        message:
          "Unable to load packages. Please try again or contact support.",
      });
      return;
    }

    // Ensure item_code is provided - API requires it
    // If items are available, selectedItem should be set
    // If items are not available, we still need item_code (might need to be handled differently)
    // Try multiple possible property names in case API structure differs
    const itemCode =
      selectedItem?.code ||
      (selectedItem as any)?.item_code ||
      (selectedItem as any)?.itemCode;


    if (!itemCode) {
      if (hasItems) {
        if (selectedItem) {
          // Item is selected but doesn't have code - this is unexpected
          showErrorToast({
            message:
              "Selected package is missing required code. Please try selecting a different package or contact support.",
          });
        } else {
          showErrorToast({
            message: "Please select a package",
          });
        }
      } else {
        // Items are not available but API still requires item_code
        // This might be a configuration issue - show helpful error
        showErrorToast({
          message:
            "Item code is required. Please contact support if packages are not available for this provider.",
        });
      }
      return;
    }

    try {
      const result = await payBill.mutateAsync({
        category: selectedCategory.code,
        biller_code: selectedBiller.biller_code,
        item_code: itemCode,
        customer: customer.trim(),
        amount: amount.trim(),
      });

      if (result) {
        showSuccessToast({
          message: "Bill payment successful",
        });

        // Navigate to success screen
        router.replace({
          pathname: "/bill-payment-success",
          params: {
            paymentData: JSON.stringify({
              ...result,
              category: selectedCategory.name,
              biller: selectedBiller.name,
              item: selectedItem?.name || "N/A",
              customer: customer.trim(),
              amount: amount.trim(),
            }),
          },
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to process payment. Please try again.";
      showErrorToast({
        message: errorMessage,
      });
    }
  };

  const canProceed = useMemo(() => {
    // Item selection is required if items are available
    // If items failed to load, we can't proceed (item_code is required by API)
    if (itemsErrorOccurred) {
      return false;
    }

    // If items are available, we need to select one and validate customer
    if (hasItems) {
      return (
        selectedCategory &&
        selectedBiller &&
        selectedItem &&
        customer.trim().length > 0 &&
        amount.trim().length > 0 &&
        validatedCustomer &&
        !isValidatingCustomer
      );
    }

    // If items are not loaded yet, wait
    if (isLoadingItems) {
      return false;
    }

    // If no items are available (empty array), we might be able to proceed
    // But item_code is still required by API, so this might fail
    // For now, we'll allow it and let the API handle the error
    return (
      selectedCategory &&
      selectedBiller &&
      customer.trim().length > 0 &&
      amount.trim().length > 0
    );
  }, [
    selectedCategory,
    selectedBiller,
    selectedItem,
    customer,
    amount,
    validatedCustomer,
    isValidatingCustomer,
    hasItems,
    itemsErrorOccurred,
    isLoadingItems,
  ]);

  // Check if category was pre-selected from params
  const isCategoryPreSelected = !!params.categoryCode && !!selectedCategory;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Bill Payment" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Display - Show gradient card if pre-selected, otherwise show selection */}
        {isCategoryPreSelected && selectedCategory ? (
          <View style={styles.section}>
            <LinearGradient
              colors={getCategoryGradientColors(selectedCategory.code)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryGradientCard}
            >
              <View style={styles.categoryCardContent}>
                <View
                  style={[
                    styles.categoryIconContainer,
                    { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(selectedCategory.code)}
                    size={32}
                    color="#fff"
                  />
                </View>
                <View style={styles.categoryCardInfo}>
                  <Text style={styles.categoryCardTitle}>
                    {selectedCategory.name}
                  </Text>
                  <Text style={styles.categoryCardSubtitle}>
                    {selectedCategory.description}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setIsCategoryModalVisible(true)}>
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={AppColors.text}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.card}
              onPress={() => setIsCategoryModalVisible(true)}
              activeOpacity={0.8}
            >
              {selectedCategory ? (
                <>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: getCategoryColor(
                          selectedCategory.code
                        ),
                      },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(selectedCategory.code)}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.cardTitle}>
                      {selectedCategory.name}
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      {selectedCategory.description}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.placeholderText}>
                  {isLoadingCategories ? "Loading..." : "Select a category"}
                </Text>
              )}
              <Ionicons
                name="chevron-forward"
                size={24}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Biller Selection */}
        {selectedCategory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Provider</Text>
              <TouchableOpacity onPress={() => setIsBillerModalVisible(true)}>
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={AppColors.text}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.card}
              onPress={() => setIsBillerModalVisible(true)}
              activeOpacity={0.8}
            >
              {selectedBiller ? (
                <>
                  <View style={[styles.iconContainer]}>
                    <ShowImage source={selectedBiller.short_name || ""} />
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.cardTitle}>{selectedBiller.name}</Text>
                    <Text style={styles.cardSubtitle}>
                      {selectedBiller.short_name}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.placeholderText}>
                  {isLoadingBillers ? "Loading..." : "Select a provider"}
                </Text>
              )}
              <Ionicons
                name="chevron-forward"
                size={24}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Item Selection (if items available) */}
        {selectedBiller && hasItems && !itemsErrorOccurred && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Package</Text>
              <TouchableOpacity onPress={() => setIsItemModalVisible(true)}>
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={AppColors.text}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.card}
              onPress={() => setIsItemModalVisible(true)}
              activeOpacity={0.8}
            >
              {selectedItem ? (
                <>
                  <View style={styles.infoContainer}>
                    <Text style={styles.cardTitle}>
                      {selectedCategory?.name
                        ? selectedItem?.biller_name
                        : selectedItem.name}
                    </Text>
                    {selectedItem.amount > 0 && (
                      <Text style={styles.cardSubtitle}>
                        ₦{selectedItem.amount.toLocaleString()}
                      </Text>
                    )}
                  </View>
                </>
              ) : (
                <Text style={styles.placeholderText}>
                  {isLoadingItems ? "Loading..." : "Select a package"}
                </Text>
              )}
              <Ionicons
                name="chevron-forward"
                size={24}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Customer Number Input */}
        {selectedBiller && (
          <View style={styles.section}>
            <Text style={styles.label}>Customer Number</Text>
            <Input
              value={customer}
              onChangeText={setCustomer}
              placeholder="Enter customer number"
              keyboardType="default"
              style={styles.input}
              rightIcon={
                <TouchableOpacity
                  onPress={handleOpenContacts}
                  activeOpacity={0.7}
                  style={styles.contactIconButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={styles.contactIconContainer}>
                    <Ionicons
                      name="person"
                      size={20}
                      color={AppColors.primary}
                    />
                  </View>
                </TouchableOpacity>
              }
            />
            {isValidatingCustomer ? (
              <View style={styles.validationContainer}>
                <ActivityIndicator size="small" color={AppColors.primary} />
                <Text style={styles.validationText}>Validating...</Text>
              </View>
            ) : validatedCustomer?.customer_name ? (
              <View style={styles.validationContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={AppColors.green}
                  style={styles.validationIcon}
                />
                <Text style={styles.validationText}>
                  {validatedCustomer.customer_name}
                </Text>
              </View>
            ) : null}
            {itemsErrorOccurred && !hasItems && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={AppColors.error}
                  style={styles.validationIcon}
                />
                <Text style={styles.errorText}>
                  Unable to load packages. Please ensure customer number is
                  correct.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Amount Input */}
        {selectedBiller && (
          <View style={[styles.section, { marginTop: -18 }]}>
            <Text style={styles.label}>Amount</Text>
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        )}

        <Button
          title={`Pay ${
            amount ? `₦${parseFloat(amount).toLocaleString()}` : ""
          }`}
          onPress={handlePay}
          style={styles.button}
          loading={payBill.isPending}
        />
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={isCategoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCategoryModalVisible(false)}
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
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setIsCategoryModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search categories..."
                style={styles.searchInput}
                placeholderTextColor={AppColors.textSecondary}
              />
            </View>

            <View style={styles.listContainer}>
              {isLoadingCategories ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={AppColors.primary} />
                </View>
              ) : (
                <FlatList
                  data={filteredCategories}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    const isSelected = selectedCategory?.id === item.id;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.listItem,
                          isSelected && styles.listItemSelected,
                        ]}
                        onPress={() => handleSelectCategory(item)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.iconContainer,
                            { backgroundColor: getCategoryColor(item.code) },
                          ]}
                        >
                          <Ionicons
                            name={getCategoryIcon(item.code)}
                            size={24}
                            color="#fff"
                          />
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={styles.listItemTitle}>{item.name}</Text>
                          <Text style={styles.listItemSubtitle}>
                            {item.description}
                          </Text>
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
                        No categories found matching "{searchQuery}"
                      </Text>
                    </View>
                  )}
                  {...(filteredCategories.length === 0
                    ? { style: styles.emptyListContainer }
                    : { contentContainerStyle: { paddingBottom: 10 } })}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Biller Modal */}
      <Modal
        visible={isBillerModalVisible && !!selectedCategory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBillerModalVisible(false)}
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
              <Text style={styles.modalTitle}>Select Provider</Text>
              <TouchableOpacity onPress={() => setIsBillerModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search providers..."
                style={styles.searchInput}
                placeholderTextColor={AppColors.textSecondary}
              />
            </View>

            <View style={styles.listContainer}>
              {isLoadingBillers ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={AppColors.primary} />
                </View>
              ) : billersError ? (
                <Error message="Failed to load providers" onRetry={() => {}} />
              ) : (
                <FlatList
                  data={filteredBillers}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    const isSelected = selectedBiller?.id === item.id;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.listItem,
                          isSelected && styles.listItemSelected,
                        ]}
                        onPress={() => handleSelectBiller(item)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.iconContainer,
                            { backgroundColor: AppColors.primary },
                          ]}
                        >
                          <ShowImage source={item.short_name || ""} />
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={styles.listItemTitle}>{item.name}</Text>
                          <Text style={styles.listItemSubtitle}>
                            {item.short_name}
                          </Text>
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
                        No providers found matching "{searchQuery}"
                      </Text>
                    </View>
                  )}
                  {...(filteredBillers.length === 0
                    ? { style: styles.emptyListContainer }
                    : { contentContainerStyle: { paddingBottom: 10 } })}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Item Modal */}
      <Modal
        visible={isItemModalVisible && !!selectedBiller}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsItemModalVisible(false)}
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
              <Text style={styles.modalTitle}>Select Package</Text>
              <TouchableOpacity onPress={() => setIsItemModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search packages..."
                style={styles.searchInput}
                placeholderTextColor={AppColors.textSecondary}
              />
            </View>

            <View style={styles.listContainer}>
              {isLoadingItems ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={AppColors.primary} />
                </View>
              ) : itemsError ? (
                <Error message="Failed to load packages" onRetry={() => {}} />
              ) : (
                <FlatList
                  data={filteredItems}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.listItem,
                          isSelected && styles.listItemSelected,
                        ]}
                        onPress={() => handleSelectItem(item)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.infoContainer}>
                          <Text style={styles.listItemTitle}>
                            {selectedCategory?.name
                              ? item?.biller_name
                              : item.name}
                          </Text>
                          {item.amount > 0 && (
                            <Text style={styles.listItemSubtitle}>
                              ₦{item.amount.toLocaleString()}
                            </Text>
                          )}
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
                        No packages found matching "{searchQuery}"
                      </Text>
                    </View>
                  )}
                  {...(filteredItems.length === 0
                    ? { style: styles.emptyListContainer }
                    : { contentContainerStyle: { paddingBottom: 10 } })}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Contact Selection Modal */}
      <Modal
        visible={isContactModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsContactModalVisible(false)}
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
              <Text style={styles.modalTitle}>Select Contact</Text>
              <TouchableOpacity onPress={() => setIsContactModalVisible(false)}>
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search contacts..."
                style={styles.searchInput}
                placeholderTextColor={AppColors.textSecondary}
              />
            </View>

            <View style={styles.listContainer}>
              {isLoadingContacts ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={AppColors.primary} />
                </View>
              ) : (
                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item, index) =>
                    `${item.name || "contact"}-${index}`
                  }
                  renderItem={({ item }) => {
                    const primaryPhone =
                      item.phoneNumbers && item.phoneNumbers.length > 0
                        ? item.phoneNumbers[0].number
                        : "No phone number";
                    return (
                      <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => handleSelectContact(item)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.iconContainer,
                            { backgroundColor: AppColors.primary },
                          ]}
                        >
                          <Ionicons name="person" size={24} color="#fff" />
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={styles.listItemTitle}>
                            {item.name || "Unknown"}
                          </Text>
                          <Text style={styles.listItemSubtitle}>
                            {primaryPhone}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={AppColors.textSecondary}
                        />
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                      <Ionicons
                        name="person-outline"
                        size={48}
                        color={AppColors.textSecondary}
                      />
                      <Text style={styles.emptyText}>
                        {searchQuery
                          ? `No contacts found matching "${searchQuery}"`
                          : "No contacts with phone numbers found"}
                      </Text>
                    </View>
                  )}
                  {...(filteredContacts.length === 0
                    ? { style: styles.emptyListContainer }
                    : { contentContainerStyle: { paddingBottom: 10 } })}
                />
              )}
            </View>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
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
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  placeholderText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    flex: 1,
  },
  input: {
    marginBottom: 0,
  },
  validationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  validationIcon: {
    marginRight: 6,
  },
  validationText: {
    fontSize: 14,
    color: AppColors.green,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    flex: 1,
  },
  button: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    minHeight: 0,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  listItemSelected: {
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  emptyListContainer: {
    flexGrow: 1,
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
  categoryGradientCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  categoryCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryCardInfo: {
    flex: 1,
  },
  categoryCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  categoryCardSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  contactIconButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  contactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${AppColors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
});
