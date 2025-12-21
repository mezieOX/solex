import Empty from "@/components/empty";
import Error from "@/components/error";
import { SkeletonTitle } from "@/components/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import {
  useBuyGiftCard,
  useGiftCardProducts,
  useSellGiftCard,
} from "@/hooks/api/use-giftcards";
import { GiftCardProduct } from "@/services/api/giftcards";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<GiftCardProduct | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [isBuyModalVisible, setIsBuyModalVisible] = useState(false);

  // Sell form state
  const [brandName, setBrandName] = useState("");
  const [cardCurrency, setCardCurrency] = useState("NGN");
  const [cardCode, setCardCode] = useState("");
  const [faceValue, setFaceValue] = useState("");
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);

  const { data: productsData, isLoading, error } = useGiftCardProducts("US");
  const buyGiftCard = useBuyGiftCard();
  const sellGiftCard = useSellGiftCard();

  // Filter products based on search
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

      if (result) {
        showSuccessToast({ message: "Gift card purchased successfully" });
        setIsBuyModalVisible(false);
        setSelectedProduct(null);
        setQuantity("1");
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to purchase gift card. Please try again.";
      showErrorToast({ message: errorMessage });
    }
  };

  const handleSellGiftCard = async () => {
    if (!brandName.trim() || !cardCode.trim() || !faceValue.trim()) {
      showErrorToast({ message: "Please fill in all required fields" });
      return;
    }

    try {
      const result = await sellGiftCard.mutateAsync({
        brand_name: brandName.trim(),
        card_currency: cardCurrency,
        code: cardCode.trim(),
        face_value: faceValue.trim(),
      });

      if (result) {
        showSuccessToast({
          message: "Gift card submitted for review",
        });
        setIsSellModalVisible(false);
        setBrandName("");
        setCardCode("");
        setFaceValue("");
        setCardCurrency("NGN");
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to submit gift card. Please try again.";
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

  const currencies = ["NGN", "USD"];

  const handleSelectCurrency = (currency: string) => {
    setCardCurrency(currency);
    setIsCurrencyModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Gift Cards" />

      {/* Tabs */}
      <View style={styles.tabContainer}>
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
      </View>

      {activeTab === "buy" ? (
        <>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search gift cards..."
              style={styles.searchInput}
              placeholderTextColor={AppColors.textSecondary}
              leftIcon={
                <Ionicons
                  name="search"
                  size={20}
                  color={AppColors.textSecondary}
                />
              }
            />
          </View>

          {/* Products List */}
          {isLoading ? (
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {[1, 2, 3].map((categoryIndex) => (
                <View key={categoryIndex} style={styles.categorySection}>
                  <SkeletonTitle
                    width="40%"
                    height={18}
                    style={styles.categoryTitleSkeleton}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.productsList}
                  >
                    {[1, 2, 3, 4].map((productIndex) => (
                      <View
                        key={productIndex}
                        style={[styles.productCard, styles.skeletonProductCard]}
                      ></View>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </ScrollView>
          ) : error ? (
            <Error message="Failed to load gift cards" onRetry={() => {}} />
          ) : (
            <FlatList
              data={Object.entries(productsByCategory)}
              keyExtractor={([category]) => category}
              renderItem={({ item: [category, products] }) => (
                <View style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  <FlatList
                    data={products}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(product) => product.id.toString()}
                    renderItem={({ item: product }) => (
                      <TouchableOpacity
                        style={styles.productCard}
                        onPress={() => handleBuyProduct(product)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: product.logo }}
                          style={styles.productLogo}
                          contentFit="contain"
                        />
                        <Text style={styles.productName} numberOfLines={2}>
                          {product.name}
                        </Text>
                        <Text style={styles.productBrand}>
                          {product.brand.name}
                        </Text>
                        {product.denomination_type === "FIXED" ? (
                          <Text style={styles.productPrice}>
                            {formatAmount(
                              product.min_recipient_amount,
                              product.recipient_currency
                            )}
                          </Text>
                        ) : (
                          <Text style={styles.productPrice}>
                            {formatAmount(
                              product.min_recipient_amount,
                              product.recipient_currency
                            )}{" "}
                            -{" "}
                            {formatAmount(
                              product.max_recipient_amount,
                              product.recipient_currency
                            )}
                          </Text>
                        )}
                        {product.discount_percentage > 0 && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                              {product.discount_percentage}% OFF
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.productsList}
                  />
                </View>
              )}
              ListEmptyComponent={() => (
                <Empty
                  title="No gift cards found"
                  description="Try adjusting your search"
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        <ScrollView
          contentContainerStyle={styles.sellContainer}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.sellCard}>
            <Text style={styles.sellTitle}>Sell Your Gift Card</Text>
            <Text style={styles.sellDescription}>
              Submit your gift card for review. We'll process it shortly.
            </Text>

            <Input
              label="Brand Name"
              value={brandName}
              onChangeText={setBrandName}
              placeholder="e.g., Amazon, Apple"
              style={styles.input}
            />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Currency</Text>
              <TouchableOpacity
                style={styles.currencySelector}
                onPress={() => setIsCurrencyModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.currencySelectorText,
                    !cardCurrency && styles.currencySelectorPlaceholder,
                  ]}
                >
                  {cardCurrency || "Select currency"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={AppColors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Input
              label="Card Code"
              value={cardCode}
              onChangeText={setCardCode}
              placeholder="Enter gift card code"
              style={styles.input}
            />

            <Input
              label="Face Value"
              value={faceValue}
              onChangeText={setFaceValue}
              placeholder="Enter card value"
              keyboardType="numeric"
              style={styles.input}
            />

            <Button
              title="Submit for Review"
              onPress={handleSellGiftCard}
              loading={sellGiftCard.isPending}
              disabled={sellGiftCard.isPending}
              style={styles.submitButton}
            />
          </Card>
        </ScrollView>
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
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <>
                <View style={styles.productInfo}>
                  <Image
                    source={{ uri: selectedProduct.logo }}
                    style={styles.modalProductLogo}
                    contentFit="contain"
                  />
                  <Text style={styles.modalProductName}>
                    {selectedProduct.name}
                  </Text>
                  <Text style={styles.modalProductBrand}>
                    {selectedProduct.brand.name}
                  </Text>
                </View>

                <Input
                  label="Quantity"
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="1"
                  keyboardType="numeric"
                  style={styles.input}
                />

                <View style={styles.priceBreakdown}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Unit Price:</Text>
                    <Text style={styles.priceValue}>
                      {formatAmount(
                        selectedProduct.denomination_type === "FIXED"
                          ? selectedProduct.min_recipient_amount
                          : selectedProduct.min_recipient_amount,
                        selectedProduct.recipient_currency
                      )}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Total Cost:</Text>
                    <Text style={styles.priceValue}>
                      ₦{calculateTotalCost().toLocaleString("en-NG")}
                    </Text>
                  </View>
                </View>

                <Button
                  title="Purchase"
                  onPress={handleConfirmBuy}
                  loading={buyGiftCard.isPending}
                  disabled={buyGiftCard.isPending}
                  style={styles.purchaseButton}
                />
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={isCurrencyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity
                onPress={() => setIsCurrencyModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.currencyList}
              showsVerticalScrollIndicator={false}
            >
              {currencies.map((currency) => {
                const isSelected = cardCurrency === currency;
                return (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.currencyItem,
                      isSelected && styles.currencyItemSelected,
                    ]}
                    onPress={() => handleSelectCurrency(currency)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.currencyItemText,
                        isSelected && styles.currencyItemTextSelected,
                      ]}
                    >
                      {currency}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={AppColors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: AppColors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  activeTabText: {
    color: AppColors.background,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    paddingBottom: 40,
  },
  categoryTitleSkeleton: {
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  skeletonProductCard: {
    marginRight: 12,
    height: 200,
  },
  skeletonLogo: {
    marginBottom: 8,
  },
  skeletonProductName: {
    marginBottom: 4,
  },
  skeletonProductBrand: {
    marginBottom: 8,
  },
  skeletonProductPrice: {
    marginTop: 0,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  productsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  productCard: {
    width: 160,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
  },
  productLogo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
  },
  discountBadge: {
    backgroundColor: AppColors.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  sellContainer: {
    padding: 20,
  },
  sellCard: {
    marginBottom: 20,
  },
  sellTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 8,
  },
  sellDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 24,
  },
  input: {
    marginBottom: 0,
  },
  submitButton: {
    marginTop: 24,
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
    padding: 20,
    maxHeight: "90%",
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
  productInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalProductLogo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  modalProductBrand: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  priceBreakdown: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  purchaseButton: {
    marginTop: 0,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 8,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  currencySelectorText: {
    fontSize: 16,
    color: AppColors.text,
  },
  currencySelectorPlaceholder: {
    color: AppColors.textSecondary,
  },
  currencyList: {
    maxHeight: 400,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface,
  },
  currencyItemSelected: {
    backgroundColor: AppColors.surface,
  },
  currencyItemText: {
    fontSize: 16,
    color: AppColors.text,
  },
  currencyItemTextSelected: {
    fontWeight: "600",
    color: AppColors.primary,
  },
});
