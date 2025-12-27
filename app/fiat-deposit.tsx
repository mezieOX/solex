import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PaymentMethod {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  image?: ImageSourcePropType;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "bank-transfer",
    name: "Bank Transfer",
    icon: "business",
    iconColor: "#FFFFFF",
    iconBg: AppColors.red,
  },
  // {
  //   id: "debit-card",
  //   name: "Debit Card",
  //   icon: "card",
  //   iconColor: "#FFFFFF",
  //   iconBg: AppColors.red,
  // },
  // {
  //   id: "paystack",
  //   name: "Paystack",
  //   icon: "ellipse",
  //   iconColor: "#FFFFFF",
  //   iconBg: AppColors.orange,
  // },
  {
    id: "flutterwave",
    name: "Flutterwave",
    icon: "ellipse",
    iconColor: "#FFFFFF",
    iconBg: AppColors.orange,
    image: require("@/assets/images/flutterwave.jpeg"),
  },
];

export default function FiatDepositScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    paymentMethods[0]
  );
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%"], []);

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

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    bottomSheetRef.current?.dismiss();
  };

  const handleContinue = () => {
    if (selectedMethod.id === "bank-transfer") {
      router.push("/bank-transfer");
    } else if (selectedMethod.id === "flutterwave") {
      if (!amount || parseFloat(amount) <= 0) {
        // Show error if amount is not entered
        return;
      }
      router.push({
        pathname: "/flutterwave-payment",
        params: { amount },
      });
    } else {
      // Handle other payment methods
      router.push("/deposit-success");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fiat Deposit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Amount Input */}

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Payment Method</Text>
            <TouchableOpacity onPress={handleOpenSheet}>
              <Ionicons name="chevron-down" size={18} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={handleOpenSheet}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.methodIcon,
                { backgroundColor: selectedMethod.iconBg },
              ]}
            >
              {selectedMethod.image ? (
                <Image
                  source={selectedMethod.image}
                  style={{ width: "100%", height: "100%", borderRadius: 100 }}
                  contentFit="contain"
                />
              ) : (
                <Ionicons
                  name={selectedMethod.icon}
                  size={18}
                  color={selectedMethod.iconColor}
                />
              )}
            </View>
            <Text style={styles.methodName}>{selectedMethod.name}</Text>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={AppColors.primary}
            />
          </TouchableOpacity>
          {selectedMethod.id === "flutterwave" ? (
            <View
              style={[
                styles.section,
                {
                  marginTop: 30,
                },
              ]}
            >
              <Text style={styles.label}>Amount</Text>
              <Input
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
                style={styles.amountInput}
              />
            </View>
          ) : null}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.button}
          disabled={
            selectedMethod.id === "flutterwave" &&
            (!amount || parseFloat(amount) <= 0)
          }
        />
      </ScrollView>

      {/* Bottom Sheet for Payment Method Selection */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enableOverDrag={false}
        handleComponent={null}
        index={0}
        backdropComponent={BackDrop}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetView}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Choose Payment Method</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()}>
              <Ionicons name="close" size={18} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.methodList}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodListItem,
                  selectedMethod.id === method.id &&
                    styles.methodListItemSelected,
                ]}
                onPress={() => handleSelectMethod(method)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.methodIcon,
                    { backgroundColor: method.iconBg },
                  ]}
                >
                  {method.image ? (
                    <Image
                      source={method.image}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 100,
                      }}
                      contentFit="contain"
                    />
                  ) : (
                    <Ionicons
                      name={method.icon}
                      size={18}
                      color={method.iconColor}
                    />
                  )}
                </View>
                <Text style={styles.methodName}>{method.name}</Text>
                {selectedMethod.id === method.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={AppColors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Continue"
            onPress={() => {
              bottomSheetRef.current?.dismiss();
              handleContinue();
            }}
            style={styles.bottomSheetButton}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
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
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  methodName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
  },
  button: {
    marginTop: 12,
  },
  bottomSheetBackground: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bottomSheetView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  methodList: {
    flex: 1,
    gap: 12,
  },
  methodListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  methodListItemSelected: {
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  bottomSheetButton: {
    marginTop: 20,
    marginBottom: 80,
  },
});
