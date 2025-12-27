import { Button } from "@/components/ui/button";
import { ExchangeRateCard } from "@/components/ui/exchange-rate-card";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { SelectionModal } from "@/components/ui/selection-modal";
import { SelectorInput } from "@/components/ui/selector-input";
import { AppColors } from "@/constants/theme";
import { useGiftCardsList } from "@/hooks/api/use-giftcards";
import { GiftCardForSell, GiftCardRange } from "@/services/api/giftcards";
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
  const [selectedGiftCard, setSelectedGiftCard] =
    useState<GiftCardForSell | null>(null);
  const [selectedRange, setSelectedRange] = useState<GiftCardRange | null>(
    null
  );
  const [cardCode, setCardCode] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [notes, setNotes] = useState("");
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [isGiftCardModalVisible, setIsGiftCardModalVisible] = useState(false);
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
        // Auto-select first available range if any
        const firstCurrency = giftCard.physical?.[0] || giftCard.ecode?.[0];
        if (firstCurrency?.ranges?.[0]) {
          setSelectedRange(firstCurrency.ranges[0]);
        }
      }
    } else if (params.brandName && giftCardsListData) {
      // Fallback: find by brand name
      const giftCard = giftCardsListData.find(
        (gc) => gc.name === params.brandName
      );
      if (giftCard) {
        setSelectedGiftCard(giftCard);
        const firstCurrency = giftCard.physical?.[0] || giftCard.ecode?.[0];
        if (firstCurrency?.ranges?.[0]) {
          setSelectedRange(firstCurrency.ranges[0]);
        }
      }
    }
  }, [params.giftCardId, params.brandName, giftCardsListData]);

  // Calculate sell transaction summary using selected range rate
  const calculateSellSummary = () => {
    if (!amount.trim() || !selectedRange) return null;
    const value = parseFloat(amount) || 0;
    const rate = selectedRange.rate || 0;

    if (rate === 0 || value === 0) return null;

    const total = value * rate;
    return { value, rate, total };
  };

  // Get all available ranges from selected giftcard
  const availableRanges = useMemo(() => {
    if (!selectedGiftCard) return [];
    const ranges: Array<{
      range: GiftCardRange;
      currency: string;
      type: "physical" | "ecode";
    }> = [];

    selectedGiftCard.physical?.forEach((currency) => {
      currency.ranges?.forEach((range) => {
        ranges.push({
          range,
          currency: currency.currency_code,
          type: "physical",
        });
      });
    });

    selectedGiftCard.ecode?.forEach((currency) => {
      currency.ranges?.forEach((range) => {
        ranges.push({ range, currency: currency.currency_code, type: "ecode" });
      });
    });

    return ranges;
  }, [selectedGiftCard]);

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

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setCardImage(result.assets[0].uri);
    } catch (error: any) {
      showErrorToast({
        message: error?.message || "Failed to upload image",
      });
    }
  };

  const handleContinue = () => {
    if (!selectedRange || !amount.trim() || (!cardCode.trim() && !cardImage)) {
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
        cardImage: cardImage || "",
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
          value={selectedGiftCard?.name || ""}
          placeholder="Select gift card"
          onPress={() => {}}
          showIcon={false}
          icon={
            selectedGiftCard?.image_url ? (
              <Image
                source={{ uri: selectedGiftCard.image_url }}
                style={styles.brandLogo}
                contentFit="contain"
              />
            ) : selectedGiftCard?.name ? (
              <Text style={styles.brandIconText}>
                {selectedGiftCard.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <View style={styles.brandIconContainer} />
            )
          }
        />

        {/* Range Selector */}
        <SelectorInput
          label="Rate Range"
          value={
            selectedRange
              ? `${selectedRange.min}-${selectedRange.max} ${
                  availableRanges.find(
                    (r) => r.range.range_id === selectedRange.range_id
                  )?.currency || ""
                } (₦${selectedRange.rate.toLocaleString("en-NG")})`
              : ""
          }
          placeholder="Select rate range"
          onPress={() => {
            if (selectedGiftCard) {
              setIsRangeModalVisible(true);
            }
          }}
          borderColor={AppColors.border}
        />

        {/* Amount Input */}
        <Input
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder={
            selectedRange
              ? `Enter amount (${selectedRange.min}-${selectedRange.max})`
              : "Enter amount"
          }
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Gift Card Code Input */}
        <Input
          label="Enter Gift Card Code"
          value={cardCode}
          onChangeText={setCardCode}
          placeholder="Enter gift card code"
          style={styles.input}
        />

        {/* Or Separator */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>Or</Text>
          <View style={styles.orLine} />
        </View>

        {/* Upload Card Image */}
        <Button
          title="Upload Card Image"
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
        />

        {cardImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: cardImage }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setCardImage(null)}
            >
              <Ionicons name="close-circle" size={24} color={AppColors.error} />
            </TouchableOpacity>
          </View>
        )}

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

        {/* PIN Input */}
        <Input
          label="PIN (Optional)"
          value={pin}
          onChangeText={setPin}
          placeholder="Enter PIN if available"
          secureTextEntry
          style={styles.input}
        />

        {/* Notes Input */}
        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes or comments"
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
          setSelectedRange(null);
          // Auto-select first available range
          const firstCurrency = giftcard.physical?.[0] || giftcard.ecode?.[0];
          if (firstCurrency?.ranges?.[0]) {
            setSelectedRange(firstCurrency.ranges[0]);
          }
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

      {/* Range Selection Modal */}
      <SelectionModal
        visible={isRangeModalVisible}
        title="Select Rate Range"
        searchQuery=""
        onSearchChange={() => {}}
        items={availableRanges}
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
                    {item.range.min}-{item.range.max} {item.currency} (
                    {item.type})
                  </Text>
                  <Text style={styles.currencyName}>
                    Rate: ₦{item.range.rate.toLocaleString("en-NG")} per unit
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
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  removeImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: AppColors.background + "CC",
    borderRadius: 10,
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
