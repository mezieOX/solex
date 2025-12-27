import ComingSoon from "@/components/coming-soon";
import Empty from "@/components/empty";
import Error from "@/components/error";
import { Button } from "@/components/ui/button";
import { ExchangeRateCard } from "@/components/ui/exchange-rate-card";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { SectionHeader } from "@/components/ui/section-header";
import { TransactionSummaryCard } from "@/components/ui/transaction-summary-card";
import { AppColors } from "@/constants/theme";
import {
  useBuyGiftCard,
  useGiftCardProducts,
  useGiftCardsList,
} from "@/hooks/api/use-giftcards";
import { GiftCardForSell, GiftCardProduct } from "@/services/api/giftcards";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GiftCardScreen() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("sell");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<GiftCardProduct | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [isBuyModalVisible, setIsBuyModalVisible] = useState(false);

  // Use new API for sell
  const {
    data: giftCardsListData,
    isLoading: isLoadingList,
    error: listError,
  } = useGiftCardsList();
  const { data: productsData, isLoading, error } = useGiftCardProducts("US");
  const buyGiftCard = useBuyGiftCard();

  // Filter giftcards for sell based on search
  const filteredGiftCardsForSell = useMemo(() => {
    if (!giftCardsListData || !Array.isArray(giftCardsListData)) return [];
    const query = searchQuery.toLowerCase().trim();
    return query
      ? giftCardsListData.filter((giftcard) =>
          giftcard.name.toLowerCase().includes(query)
        )
      : giftCardsListData;
  }, [giftCardsListData, searchQuery]);

  // Filter products based on search (for buy - disabled)
  const filteredProducts = useMemo(() => {
    if (!productsData?.products) return [];
    const query = searchQuery.toLowerCase().trim();
    return query
      ? productsData.products.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.brand.name.toLowerCase().includes(query) ||
            product.category.name.toLowerCase().includes(query)
        )
      : productsData.products;
  }, [productsData, searchQuery]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    if (!filteredProducts.length) return {};
    const grouped: Record<string, GiftCardProduct[]> = {};
    filteredProducts.forEach((product) => {
      const category = product.category.name;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  const handleBuyProduct = (product: GiftCardProduct) => {
    setSelectedProduct(product);
    setQuantity("1");
    setIsBuyModalVisible(true);
  };

  const handleConfirmBuy = async () => {
    if (!selectedProduct || !quantity.trim()) {
      showErrorToast({ message: "Please select a product and quantity" });
      return;
    }

    try {
      const result = await buyGiftCard.mutateAsync({
        product_id: selectedProduct.id.toString(),
        quantity: quantity.trim(),
      });

      if (result && result.purchase?.transaction_id) {
        showSuccessToast({ message: "Gift card purchased successfully" });
        setIsBuyModalVisible(false);
        setSelectedProduct(null);
        setQuantity("1");

        // Navigate to gift card codes screen
        router.push({
          pathname: "/giftcard-codes",
          params: {
            transaction_id: result.purchase.transaction_id.toString(),
          },
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to purchase gift card. Please try again.";
      showErrorToast({ message: errorMessage });
    }
  };

  const formatAmount = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTotalCost = () => {
    if (!selectedProduct || !quantity.trim()) return 0;
    const qty = parseFloat(quantity) || 1;
    const unitPrice =
      selectedProduct.denomination_type === "FIXED"
        ? selectedProduct.min_recipient_amount
        : selectedProduct.min_recipient_amount;
    const totalRecipientAmount = unitPrice * qty;
    const totalCostNGN =
      totalRecipientAmount * selectedProduct.rate_recipient_to_sender +
      selectedProduct.sender_fee_ngn * qty;
    return totalCostNGN;
  };

  // Quick amount buttons for buy
  const quickAmounts = ["100", "200", "500", "1000", "2000", "5000"];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Sell Gift Cards" />

      {/* Tabs */}
      {/* <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sell" && styles.activeTab]}
          onPress={() => setActiveTab("sell")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sell" && styles.activeTabText,
            ]}
          >
            Sell
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "buy" && styles.activeTab]}
          onPress={() => setActiveTab("buy")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "buy" && styles.activeTabText,
            ]}
          >
            Buy
          </Text>
        </TouchableOpacity>
      </View> */}

      {activeTab === "buy" ? (
        // <>
        //   {/* Search */}
        //   <View style={styles.searchContainer}>
        //     <Input
        //       value={searchQuery}
        //       onChangeText={setSearchQuery}
        //       placeholder="Search Gift Card......"
        //       style={styles.searchInput}
        //       placeholderTextColor={AppColors.textSecondary}
        //       rightIcon={
        //         <Ionicons
        //           name="search"
        //           size={20}
        //           color={AppColors.textSecondary}
        //         />
        //       }
        //     />
        //   </View>

        //   {/* Products Grid */}
        //   {isLoading ? (
        //     <ScrollView
        //       contentContainerStyle={styles.gridContent}
        //       showsVerticalScrollIndicator={false}
        //     >
        //       <View style={styles.gridContainer}>
        //         {[1, 2, 3, 4, 5, 6].map((index) => (
        //           <View
        //             key={index}
        //             style={[styles.giftCardContainer, styles.skeletonCard]}
        //           />
        //         ))}
        //       </View>
        //     </ScrollView>
        //   ) : error ? (
        //     <Error message="Failed to load gift cards" onRetry={() => {}} />
        //   ) : (
        //     <FlatList
        //       data={filteredProducts}
        //       numColumns={2}
        //       keyExtractor={(product) => product.id.toString()}
        //       contentContainerStyle={styles.gridContent}
        //       columnWrapperStyle={styles.gridRow}
        //       showsVerticalScrollIndicator={false}
        //       renderItem={({ item: product }) => (
        //         <GiftCardItem
        //           product={product}
        //           onPress={() => handleBuyProduct(product)}
        //           formatAmount={formatAmount}
        //         />
        //       )}
        //       ListEmptyComponent={() => (
        //         <Empty
        //           title="No gift cards found"
        //           description="Try adjusting your search"
        //         />
        //       )}
        //     />
        //   )}
        // </>
        <ComingSoon />
      ) : (
        <>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Gift Card......"
              style={styles.searchInput}
              placeholderTextColor={AppColors.textSecondary}
              rightIcon={
                <Ionicons
                  name="search"
                  size={20}
                  color={AppColors.textSecondary}
                />
              }
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.sellContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Get More Gift Cards Section */}
            <View style={styles.sectionContainer}>
              <SectionHeader
                title="Get More Gift Cards"
                titleStyle={styles.sectionTitleSmall}
              />
              {isLoadingList ? (
                <ScrollView
                  contentContainerStyle={[
                    styles.gridContent,
                    {
                      padding: isLoadingList ? 0 : 20,
                    },
                  ]}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.gridContainer}>
                    {[1, 2, 3, 4].map((index) => (
                      <View
                        key={index}
                        style={[styles.giftCardContainer, styles.skeletonCard]}
                      />
                    ))}
                  </View>
                </ScrollView>
              ) : listError ? (
                <Error message="Failed to load gift cards" onRetry={() => {}} />
              ) : (
                <FlatList
                  data={filteredGiftCardsForSell}
                  numColumns={2}
                  keyExtractor={(giftcard) => giftcard.id.toString()}
                  contentContainerStyle={styles.sellGridContent}
                  columnWrapperStyle={styles.gridRow}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  renderItem={({
                    item: giftcard,
                  }: {
                    item: GiftCardForSell;
                  }) => {
                    // Get the first available currency and range for display
                    const firstCurrency =
                      giftcard.physical?.[0] || giftcard.ecode?.[0];
                    const firstRange = firstCurrency?.ranges?.[0];
                    const minRate = firstRange?.rate || 0;
                    // const currencyCode = firstCurrency?.currency_code || "USD";

                    return (
                      <TouchableOpacity
                        style={styles.giftCardContainer}
                        onPress={() => {
                          router.push({
                            pathname: "/sell-giftcard",
                            params: {
                              giftCardId: giftcard.id.toString(),
                              brandName: giftcard.name,
                              brandLogo: giftcard.image_url,
                            },
                          });
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.giftCardImageContainer}>
                          <Image
                            source={{ uri: giftcard.image_url }}
                            style={styles.giftCardImage}
                            contentFit="contain"
                          />
                        </View>
                        <View style={styles.giftCardBanner}>
                          <Text style={styles.giftCardBrand} numberOfLines={1}>
                            {giftcard.name}
                          </Text>
                          {minRate > 0 && (
                            <Text style={styles.giftCardPrice}>
                              ₦{minRate.toLocaleString("en-NG")}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={() => (
                    <Empty
                      title="No gift cards found"
                      description="Try adjusting your search"
                    />
                  )}
                />
              )}
            </View>
          </ScrollView>
        </>
      )}

      {/* Buy Modal */}
      <Modal
        visible={isBuyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBuyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buy Gift Card</Text>
              <TouchableOpacity onPress={() => setIsBuyModalVisible(false)}>
                <Ionicons name="close" size={20} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Gift Card Brand Display */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Gift Card</Text>
                  <View style={styles.productSelector}>
                    <View style={styles.productSelectorContent}>
                      <Image
                        source={{ uri: selectedProduct.logo }}
                        style={styles.productSelectorLogo}
                        contentFit="contain"
                      />
                      <Text style={styles.productSelectorText}>
                        {selectedProduct.name}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Card Currency Display */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Card Currency</Text>
                  <View style={styles.currencyDisplay}>
                    <Text style={styles.currencyDisplayText}>
                      {selectedProduct.recipient_currency}
                    </Text>
                  </View>
                </View>

                {/* Amount Input */}
                <Input
                  label="Amount"
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="Enter quantity"
                  keyboardType="numeric"
                  style={styles.input}
                />

                {/* Quick Amount Buttons - Show for fixed denomination products */}
                {selectedProduct.denomination_type === "FIXED" && (
                  <View style={styles.quickAmountContainer}>
                    {quickAmounts
                      .filter((amt) => {
                        const amount = parseFloat(amt);
                        return (
                          amount >= selectedProduct.min_recipient_amount &&
                          amount <= selectedProduct.max_recipient_amount
                        );
                      })
                      .map((amt) => {
                        const isSelected = quantity === amt;
                        return (
                          <TouchableOpacity
                            key={amt}
                            style={[
                              styles.quickAmountButton,
                              isSelected && styles.quickAmountButtonSelected,
                            ]}
                            onPress={() => {
                              // Calculate quantity based on product's fixed amount
                              const productAmount =
                                selectedProduct.min_recipient_amount;
                              const qty = Math.floor(
                                parseFloat(amt) / productAmount
                              );
                              setQuantity(qty > 0 ? qty.toString() : "1");
                            }}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.quickAmountText,
                                isSelected && styles.quickAmountTextSelected,
                              ]}
                            >
                              ${amt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                )}

                {/* Current Exchange Rate Section */}
                <ExchangeRateCard
                  giftCardValue={formatAmount(
                    (selectedProduct.denomination_type === "FIXED"
                      ? selectedProduct.min_recipient_amount
                      : selectedProduct.min_recipient_amount) *
                      (parseFloat(quantity) || 1),
                    selectedProduct.recipient_currency
                  )}
                  localCurrency={`₦${calculateTotalCost().toLocaleString(
                    "en-NG",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`}
                  ratePerUnit={`₦${selectedProduct.rate_recipient_to_sender.toLocaleString(
                    "en-NG",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`}
                />

                {/* Transaction Summary */}
                <TransactionSummaryCard
                  rows={[
                    {
                      label: "Gift Card Brand:",
                      value: selectedProduct.brand.name,
                    },
                    {
                      label: "Amount:",
                      value: formatAmount(
                        (selectedProduct.denomination_type === "FIXED"
                          ? selectedProduct.min_recipient_amount
                          : selectedProduct.min_recipient_amount) *
                          (parseFloat(quantity) || 1),
                        selectedProduct.recipient_currency
                      ),
                    },
                  ]}
                  totalAmount={`₦${calculateTotalCost().toLocaleString(
                    "en-NG",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`}
                />

                <Button
                  title="Continue"
                  onPress={handleConfirmBuy}
                  loading={buyGiftCard.isPending}
                  disabled={buyGiftCard.isPending}
                  style={styles.purchaseButton}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: AppColors.background,
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  activeTab: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.text,
  },
  activeTabText: {
    color: AppColors.background,
  },
  searchContainer: {
    paddingHorizontal: 12,
    marginTop: 6,
  },
  searchInput: {
    marginBottom: 0,
  },
  gridContent: {
    padding: 10,
    paddingBottom: 20,
  },
  sellGridContent: {
    padding: 0,
    paddingBottom: 0,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 0,
  },
  giftCardContainer: {
    width: "48%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: AppColors.surface,
    marginBottom: 10,
  },
  giftCardImageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  giftCardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  skeletonCard: {
    height: 170,
    backgroundColor: AppColors.surface,
  },
  giftCardBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: AppColors.red,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 32,
  },
  giftCardBrand: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
    flex: 1,
  },
  giftCardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: AppColors.green,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
  },
  sellContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitleSmall: {
    fontSize: 10,
  },
  availableCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  availableCardPlaceholder: {
    width: "25%",
  },
  placeholderCard: {
    width: "100%",
    height: 80,
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sellButton: {
    marginTop: 16,
    marginBottom: 14,
  },
  sellCard: {
    marginBottom: 14,
  },
  sellTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 6,
  },
  sellDescription: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
  },
  submitButton: {
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 12,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  productInfo: {
    alignItems: "center",
    marginBottom: 14,
  },
  modalProductLogo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  modalProductName: {
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 2,
  },
  modalProductBrand: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  priceBreakdown: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  purchaseButton: {
    marginTop: 0,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 6,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  currencySelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currencySelectorSymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  currencySelectorText: {
    fontSize: 14,
    color: AppColors.text,
  },
  currencySelectorPlaceholder: {
    color: AppColors.textSecondary,
  },
  currencySearchContainer: {
    marginBottom: 12,
  },
  currencySearchInput: {
    marginBottom: 0,
  },
  currencyList: {
    maxHeight: 300,
  },
  currencyItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface,
  },
  currencyItemSelected: {
    backgroundColor: AppColors.surface,
  },
  currencyItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currencyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
    minWidth: 26,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 2,
  },
  currencyCodeSelected: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  currencyName: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  emptyCurrencyContainer: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCurrencyText: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  brandSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  brandSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  brandIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  brandIconText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  brandSelectorText: {
    fontSize: 14,
    color: AppColors.text,
  },
  brandSelectorPlaceholder: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginBottom: 14,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 14,
    borderRadius: 10,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 160,
    borderRadius: 10,
  },
  removeImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: AppColors.background + "CC",
    borderRadius: 10,
  },
  exchangeRateCard: {
    backgroundColor: AppColors.orange + "20",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  exchangeRateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  exchangeRateTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  exchangeRateContent: {
    gap: 8,
  },
  exchangeRateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exchangeRateLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  exchangeRateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  exchangeRateArrow: {
    alignItems: "center",
    marginVertical: 6,
  },
  ratePerUnit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  ratePerUnitLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  ratePerUnitValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
  },
  transactionSummaryCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  transactionSummaryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
  },
  totalAmountContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    alignItems: "center",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.primary,
  },
  productSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  productSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  productSelectorLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  productSelectorText: {
    fontSize: 14,
    color: AppColors.text,
    flex: 1,
  },
  currencyDisplay: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  currencyDisplayText: {
    fontSize: 14,
    color: AppColors.text,
  },
  quickAmountContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
  },
  quickAmountButtonSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
  },
  quickAmountTextSelected: {
    color: AppColors.background,
  },
  modalScrollContent: {
    paddingBottom: 12,
  },
});
