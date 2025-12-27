import { Button } from "@/components/ui/button";
import { ExchangeRateCard } from "@/components/ui/exchange-rate-card";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { SelectionModal } from "@/components/ui/selection-modal";
import { SelectorInput } from "@/components/ui/selector-input";
import { Tabs } from "@/components/ui/tabs";
import { AppColors } from "@/constants/theme";
import { useGiftCardsList } from "@/hooks/api/use-giftcards";
import {
  GiftCardCurrency,
  GiftCardForSell,
  GiftCardRange,
} from "@/services/api/giftcards";
import { showErrorToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SellGiftCardScreen() {
  const params = useLocalSearchParams();

  // Form state
  const [cardType, setCardType] = useState<"physical" | "ecode">("physical");
  const [selectedGiftCard, setSelectedGiftCard] =
    useState<GiftCardForSell | null>(null);
  const [selectedCurrency, setSelectedCurrency] =
    useState<GiftCardCurrency | null>(null);
  const [isCurrencyManuallySelected, setIsCurrencyManuallySelected] =
    useState(false);
  const [selectedRange, setSelectedRange] = useState<GiftCardRange | null>(
    null
  );
  const [cardCode, setCardCode] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [notes, setNotes] = useState("");
  const [cardImages, setCardImages] = useState<string[]>([]);
  const [isGiftCardModalVisible, setIsGiftCardModalVisible] = useState(false);
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isRangeModalVisible, setIsRangeModalVisible] = useState(false);
  const [giftCardSearchQuery, setGiftCardSearchQuery] = useState("");

  const { data: giftCardsListData } = useGiftCardsList();

  // Pre-fill giftcard from params if provided
  useEffect(() => {
    if (params.giftCardId && giftCardsListData) {
      const giftCard = giftCardsListData.find(
        (gc) => gc.id.toString() === params.giftCardId
      );
      if (giftCard) {
        setSelectedGiftCard(giftCard);
        // Auto-select first available currency and range from current cardType
        const cardTypeData =
          cardType === "physical" ? giftCard.physical : giftCard.ecode;
        const firstCurrency = cardTypeData?.find(
          (currency) => currency.ranges && currency.ranges.length > 0
        );
        // Don't auto-select currency - let user select manually
        setSelectedCurrency(null);
        setIsCurrencyManuallySelected(false);
        setSelectedRange(null);
      }
    } else if (params.brandName && giftCardsListData) {
      // Fallback: find by brand name
      const giftCard = giftCardsListData.find(
        (gc) => gc.name === params.brandName
      );
      if (giftCard) {
        setSelectedGiftCard(giftCard);
        // Don't auto-select currency - let user select manually
        setSelectedCurrency(null);
        setIsCurrencyManuallySelected(false);
        setSelectedRange(null);
      }
    }
  }, [params.giftCardId, params.brandName, giftCardsListData, cardType]);

  // Check if gift card has data for each card type
  const hasPhysical = useMemo(() => {
    if (!selectedGiftCard) return false;
    return (
      selectedGiftCard.physical &&
      selectedGiftCard.physical.length > 0 &&
      selectedGiftCard.physical.some(
        (currency) => currency.ranges && currency.ranges.length > 0
      )
    );
  }, [selectedGiftCard]);

  const hasEcode = useMemo(() => {
    if (!selectedGiftCard) return false;
    return (
      selectedGiftCard.ecode &&
      selectedGiftCard.ecode.length > 0 &&
      selectedGiftCard.ecode.some(
        (currency) => currency.ranges && currency.ranges.length > 0
      )
    );
  }, [selectedGiftCard]);

  // Update selected range when cardType changes
  useEffect(() => {
    if (!selectedGiftCard) {
      setSelectedRange(null);
      return;
    }

    // Check if current cardType is available, if not switch to available one
    if (cardType === "physical" && !hasPhysical) {
      if (hasEcode) {
        setCardType("ecode");
        return;
      }
      setSelectedRange(null);
      return;
    }

    if (cardType === "ecode" && !hasEcode) {
      if (hasPhysical) {
        setCardType("physical");
        return;
      }
      setSelectedRange(null);
      return;
    }

    // Don't auto-select currency when cardType changes - let user select manually
    setSelectedCurrency(null);
    setIsCurrencyManuallySelected(false);
    setSelectedRange(null);
  }, [cardType, selectedGiftCard, hasPhysical, hasEcode]);

  // Update selected range when currency changes (only if manually selected)
  useEffect(() => {
    if (!selectedCurrency || !isCurrencyManuallySelected) {
      setSelectedRange(null);
      return;
    }

    // Auto-select first range from selected currency
    if (selectedCurrency.ranges?.[0]) {
      setSelectedRange(selectedCurrency.ranges[0]);
    } else {
      setSelectedRange(null);
    }
  }, [selectedCurrency, isCurrencyManuallySelected]);

  // Calculate sell transaction summary using selected range rate
  const calculateSellSummary = () => {
    if (!amount.trim() || !selectedRange) return null;
    const value = parseFloat(amount) || 0;
    const rate = selectedRange.rate || 0;

    if (rate === 0 || value === 0) return null;

    const total = value * rate;
    return { value, rate, total };
  };

  // Get available currencies from selected giftcard filtered by cardType
  const availableCurrencies = useMemo(() => {
    if (!selectedGiftCard) return [];
    const cardTypeData =
      cardType === "physical"
        ? selectedGiftCard.physical
        : selectedGiftCard.ecode;
    return (
      cardTypeData?.filter(
        (currency) => currency.ranges && currency.ranges.length > 0
      ) || []
    );
  }, [selectedGiftCard, cardType]);

  // Get available ranges from selected giftcard filtered by cardType and currency
  const availableRanges = useMemo(() => {
    if (!selectedGiftCard || !selectedCurrency) return [];
    const ranges: Array<{
      range: GiftCardRange;
      currency: string;
      type: "physical" | "ecode";
    }> = [];

    // Only include ranges from the selected currency
    selectedCurrency.ranges?.forEach((range) => {
      ranges.push({
        range,
        currency: selectedCurrency.currency_code,
        type: cardType,
      });
    });

    return ranges;
  }, [selectedGiftCard, cardType, selectedCurrency]);

  // Filter giftcards based on search
  const filteredGiftCards = useMemo(() => {
    if (!giftCardsListData || !Array.isArray(giftCardsListData)) return [];
    if (!giftCardSearchQuery.trim()) return giftCardsListData;
    const query = giftCardSearchQuery.toLowerCase().trim();
    return giftCardsListData.filter((giftcard) =>
      giftcard.name.toLowerCase().includes(query)
    );
  }, [giftCardsListData, giftCardSearchQuery]);

  // Handle image upload
  const handleImageUpload = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showErrorToast({
          message: "Permission to access photos is required",
        });
        return;
      }

      // Check if we've reached the max limit
      const remainingSlots = 5 - cardImages.length;
      if (remainingSlots <= 0) {
        showErrorToast({
          message: "Maximum of 5 images allowed",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: remainingSlots,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      // Add new images to existing ones, up to max 5
      const newImages = result.assets
        .slice(0, remainingSlots)
        .map((asset) => asset.uri);
      setCardImages((prev) => [...prev, ...newImages]);
    } catch (error: any) {
      showErrorToast({
        message: error?.message || "Failed to upload image",
      });
    }
  };

  // Remove a specific image
  const handleRemoveImage = (index: number) => {
    setCardImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (
      !selectedRange ||
      !amount.trim() ||
      (!cardCode.trim() && cardImages.length === 0)
    ) {
      showErrorToast({ message: "Please fill in all required fields" });
      return;
    }

    // Validate amount is within range
    const amountNum = parseFloat(amount);
    if (amountNum < selectedRange.min || amountNum > selectedRange.max) {
      showErrorToast({
        message: `Amount must be between ${selectedRange.min} and ${selectedRange.max}`,
      });
      return;
    }

    // Get currency from selected range
    const rangeInfo = availableRanges.find(
      (r) => r.range.range_id === selectedRange.range_id
    );
    const currency = rangeInfo?.currency || "USD";

    // Calculate total
    const total = amountNum * selectedRange.rate;

    // Navigate to confirmation screen with all data
    router.push({
      pathname: "/confirm-sell-giftcard",
      params: {
        giftCardId: selectedGiftCard?.id.toString(),
        brandName: selectedGiftCard?.name,
        rangeId: selectedRange.range_id.toString(),
        amount: amount.trim(),
        rate: selectedRange.rate.toString(),
        currency: currency,
        total: total.toString(),
        cardCode: cardCode.trim() || "",
        pin: pin.trim() || "",
        notes: notes.trim() || "",
        cardImages: JSON.stringify(cardImages),
      },
    });
  };

  const formatAmount = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Sell Gift Card" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gift Card Selector */}
        <SelectorInput
          label="Gift Card"
          value={selectedGiftCard?.name || (params.brandName as string) || ""}
          placeholder="Select gift card"
          onPress={() => {
            setIsGiftCardModalVisible(true);
          }}
          showIcon={false}
          icon={
            params.brandLogo ? (
              <Image
                source={{ uri: params.brandLogo as string }}
                style={styles.brandLogo}
                contentFit="contain"
              />
            ) : selectedGiftCard?.image_url ? (
              <Image
                source={{ uri: selectedGiftCard.image_url }}
                style={styles.brandLogo}
                contentFit="contain"
              />
            ) : selectedGiftCard?.name || params.brandName ? (
              <Text style={styles.brandIconText}>
                {(selectedGiftCard?.name || (params.brandName as string))
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            ) : (
              <View style={styles.brandIconContainer} />
            )
          }
        />
        <Tabs
          options={[
            {
              id: "physical",
              label: "Physical",
              disabled: !hasPhysical,
            },
            {
              id: "ecode",
              label: "E-code",
              disabled: !hasEcode,
            },
          ]}
          activeTab={cardType}
          onTabChange={(tabId) => {
            const newCardType = tabId as "physical" | "ecode";
            // Check if the tab is disabled
            if (
              (newCardType === "physical" && !hasPhysical) ||
              (newCardType === "ecode" && !hasEcode)
            ) {
              showErrorToast({
                message: `No ${
                  newCardType === "physical" ? "physical" : "e-code"
                } gift cards available for this brand`,
              });
              return;
            }
            setCardType(newCardType);
          }}
        />

        {/* Currency Selector */}
        {selectedGiftCard && (
          <SelectorInput
            label="Select Currency"
            value={
              isCurrencyManuallySelected && selectedCurrency
                ? selectedCurrency.currency_code
                : ""
            }
            placeholder="No curency selected"
            onPress={() => {
              if (selectedGiftCard && availableCurrencies.length > 0) {
                setIsCurrencyModalVisible(true);
              }
            }}
            borderColor={AppColors.border}
            icon={
              isCurrencyManuallySelected && selectedCurrency?.currency_icon ? (
                <Image
                  source={{ uri: selectedCurrency.currency_icon }}
                  style={styles.currencyIcon}
                  contentFit="contain"
                />
              ) : null
            }
          />
        )}

        {/* Range Selector */}
        {isCurrencyManuallySelected && selectedCurrency && (
          <SelectorInput
            label="Select Face Value"
            value={
              selectedRange
                ? `${selectedRange.min} - ${selectedRange.max} ${
                    selectedCurrency?.currency_code || ""
                  } (₦${selectedRange.rate.toLocaleString("en-NG")})`
                : ""
            }
            placeholder="Enter face value"
            onPress={() => {
              if (selectedGiftCard && selectedCurrency) {
                setIsRangeModalVisible(true);
              } else {
                showErrorToast({
                  message: "Please select a currency first",
                });
              }
            }}
            borderColor={AppColors.border}
          />
        )}

        {/* Amount Input */}
        <Input
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder={
            selectedRange
              ? `Enter amount (${selectedRange.min} - ${selectedRange.max})`
              : "Enter amount"
          }
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Upload Card Image */}
        <Button
          title={`Upload Card Image${
            cardImages.length > 0 ? ` (${cardImages.length}/5)` : ""
          }`}
          onPress={handleImageUpload}
          variant="outline"
          leftIcon={
            <Ionicons
              name="camera-outline"
              size={18}
              color={AppColors.primary}
            />
          }
          style={styles.uploadButton}
          disabled={cardImages.length >= 5}
        />

        {/* Images Grid */}
        {cardImages.length > 0 && (
          <View style={styles.imagesGridContainer}>
            {cardImages.map((imageUri, index) => (
              <View key={index} style={styles.imageCard}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.imageCardPreview}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={AppColors.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Gift Card Code Input */}
        {/* <Input
          label="Gift Card Code (Optional)"
          value={cardCode}
          onChangeText={setCardCode}
          placeholder="Enter gift card code"
          style={styles.input}
        /> */}

        {/* Current Exchange Rate Section */}
        {amount && selectedRange && calculateSellSummary() && (
          <ExchangeRateCard
            giftCardValue={formatAmount(
              parseFloat(amount) || 0,
              availableRanges.find(
                (r) => r.range.range_id === selectedRange.range_id
              )?.currency || "USD"
            )}
            localCurrency={`₦${
              calculateSellSummary()?.total.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"
            }`}
            ratePerUnit={`₦${selectedRange.rate.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />
        )}

        {/* Notes Input */}
        <Input
          label="Comment (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional comment e.g You can type your code heres"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.submitButton}
        />
      </ScrollView>

      {/* Gift Card Selection Modal */}
      <SelectionModal
        visible={isGiftCardModalVisible}
        title="Select Gift Card"
        searchQuery={giftCardSearchQuery}
        onSearchChange={setGiftCardSearchQuery}
        items={filteredGiftCards}
        getItemKey={(giftcard) => giftcard.id.toString()}
        getIsSelected={(giftcard) => selectedGiftCard?.id === giftcard.id}
        onSelect={(giftcard) => {
          setSelectedGiftCard(giftcard);
          // Don't auto-select currency - let user select manually
          setSelectedCurrency(null);
          setIsCurrencyManuallySelected(false);
          setSelectedRange(null);
          setGiftCardSearchQuery("");
        }}
        onClose={() => {
          setIsGiftCardModalVisible(false);
          setGiftCardSearchQuery("");
        }}
        emptyText="No gift cards found"
        searchPlaceholder="Search gift card..."
        renderItem={(giftcard, isSelected) => (
          <View
            style={[
              styles.currencyItem,
              isSelected && styles.currencyItemSelected,
            ]}
          >
            <View style={styles.currencyItemContent}>
              <View style={styles.currencyItemLeft}>
                <View style={styles.brandIconContainer}>
                  <Image
                    source={{ uri: giftcard.image_url }}
                    style={styles.brandLogoSmall}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.currencyInfo}>
                  <Text
                    style={[
                      styles.currencyCode,
                      isSelected && styles.currencyCodeSelected,
                    ]}
                  >
                    {giftcard.name}
                  </Text>
                </View>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={AppColors.primary}
                />
              )}
            </View>
          </View>
        )}
      />

      {/* Currency Selection Modal */}
      <SelectionModal
        visible={isCurrencyModalVisible}
        title="Select Currency"
        searchQuery=""
        onSearchChange={() => {}}
        items={availableCurrencies}
        getItemKey={(currency) => currency.currency_code}
        getIsSelected={(currency) =>
          selectedCurrency?.currency_code === currency.currency_code
        }
        onSelect={(currency) => {
          setSelectedCurrency(currency);
          setIsCurrencyManuallySelected(true);
          // Auto-select first range from selected currency
          if (currency.ranges?.[0]) {
            setSelectedRange(currency.ranges[0]);
          } else {
            setSelectedRange(null);
          }
          setIsCurrencyModalVisible(false);
        }}
        onClose={() => {
          setIsCurrencyModalVisible(false);
        }}
        emptyText="No currencies available"
        searchPlaceholder=""
        renderItem={(currency, isSelected) => (
          <View
            style={[
              styles.currencyItem,
              isSelected && styles.currencyItemSelected,
            ]}
          >
            <View style={styles.currencyItemContent}>
              <View style={styles.currencyItemLeft}>
                {currency.currency_icon && (
                  <View style={styles.brandIconContainer}>
                    <Image
                      source={{ uri: currency.currency_icon }}
                      style={styles.brandLogoSmall}
                      contentFit="contain"
                    />
                  </View>
                )}
                <View style={styles.currencyInfo}>
                  <Text
                    style={[
                      styles.currencyCode,
                      isSelected && styles.currencyCodeSelected,
                    ]}
                  >
                    {currency.currency_code}
                  </Text>
                </View>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={AppColors.primary}
                />
              )}
            </View>
          </View>
        )}
      />

      {/* Range Selection Modal */}
      <SelectionModal
        visible={isRangeModalVisible}
        title="Select Face Value"
        searchQuery=""
        onSearchChange={() => {}}
        items={availableRanges}
        enableSearch={false}
        getItemKey={(item) => item.range.range_id.toString()}
        getIsSelected={(item) =>
          selectedRange?.range_id === item.range.range_id
        }
        onSelect={(item) => {
          setSelectedRange(item.range);
          setIsRangeModalVisible(false);
        }}
        onClose={() => {
          setIsRangeModalVisible(false);
        }}
        emptyText="No ranges available"
        searchPlaceholder=""
        renderItem={(item, isSelected) => (
          <View
            style={[
              styles.currencyItem,
              isSelected && styles.currencyItemSelected,
            ]}
          >
            <View style={styles.currencyItemContent}>
              <View style={styles.currencyItemLeft}>
                <View style={styles.currencyInfo}>
                  <Text
                    style={[
                      styles.currencyCode,
                      isSelected && styles.currencyCodeSelected,
                    ]}
                  >
                    {item.range.min}-{item.range.max} {item.currency}
                  </Text>
                  <Text style={styles.currencyName}>
                    Rate: {item.currency}{" "}
                    {item.range.rate.toLocaleString("en-NG")}
                  </Text>
                </View>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={AppColors.primary}
                />
              )}
            </View>
          </View>
        )}
      />
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
  input: {
    marginBottom: 0,
  },
  submitButton: {
    marginTop: 12,
  },
  brandIconText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  brandIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.border,
    overflow: "hidden",
  },
  brandLogo: {
    width: "100%",
    height: "100%",
  },
  brandLogoSmall: {
    width: 24,
    height: 24,
    borderRadius: 800,
  },
  currencyIcon: {
    width: 24,
    height: 24,
    borderRadius: 800,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
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
    marginBottom: 12,
    borderColor: AppColors.border,
  },
  imagesGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginHorizontal: -4,
  },
  imageCard: {
    position: "relative",
    width: "31%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: AppColors.surface,
    margin: 4,
  },
  imageCardPreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: AppColors.background + "CC",
    borderRadius: 12,
    padding: 2,
  },
  currencyItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 2,
  },
  currencyCodeSelected: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  currencyName: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
});
