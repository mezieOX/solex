import { AppColors } from "@/constants/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

interface CryptoWallet {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change: string;
  changeColor: string;
  icon: any;
  color: string;
}

const cryptoWallets: CryptoWallet[] = [
  {
    id: "1",
    name: "Bitcoin",
    symbol: "BTC",
    price: "$45,230.50",
    change: "+2.45%",
    changeColor: AppColors.green,
    icon: require("@/assets/images/bitcoin.png"),
    color: AppColors.orange,
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    price: "$2,456.80",
    change: "+1.23%",
    changeColor: AppColors.green,
    icon: require("@/assets/images/eth.png"),
    color: AppColors.blue,
  },
  {
    id: "3",
    name: "Tether",
    symbol: "USDT",
    price: "$1.00",
    change: "0.00%",
    changeColor: AppColors.textSecondary,
    icon: require("@/assets/images/usdt.png"),
    color: AppColors.green,
  },
  {
    id: "4",
    name: "Binance Wallet",
    symbol: "BNB",
    price: "$1743.23",
    change: "-1.28%",
    changeColor: AppColors.red,
    icon: require("@/assets/images/bitcoin.png"),
    color: AppColors.orange,
  },
  {
    id: "5",
    name: "Notcoin",
    symbol: "NOT",
    price: "$16.25",
    change: "+3.00%",
    changeColor: AppColors.green,
    icon: require("@/assets/images/bitcoin.png"),
    color: AppColors.orange,
  },
];

export default function CryptoDepositScreen() {
  const router = useRouter();
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet>(
    cryptoWallets[0]
  );
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%", "90%"], []);

  const BackDrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        disappearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleOpenSheet = () => {
    bottomSheetRef.current?.present();
  };

  const handleSelectWallet = (wallet: CryptoWallet) => {
    setSelectedWallet(wallet);
    bottomSheetRef.current?.dismiss();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crypto Deposit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Choose Wallet Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Wallet</Text>
            <TouchableOpacity onPress={handleOpenSheet}>
              <Ionicons
                name="chevron-down"
                size={24}
                color={AppColors.text}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.walletCard}
            onPress={handleOpenSheet}
            activeOpacity={0.8}
          >
            <View style={[styles.walletIcon, { backgroundColor: selectedWallet.color }]}>
              <Image
                source={selectedWallet.icon}
                style={styles.walletIconImage}
                contentFit="contain"
              />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>{selectedWallet.name}</Text>
              <Text style={styles.walletSymbol}>{selectedWallet.symbol}</Text>
            </View>
            <View style={styles.walletPrice}>
              <Text style={styles.walletPriceValue}>{selectedWallet.price}</Text>
              <Text
                style={[
                  styles.walletPriceChange,
                  { color: selectedWallet.changeColor },
                ]}
              >
                {selectedWallet.change}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Button
          title="Continue"
          onPress={() => router.push("/btc-deposit")}
          style={styles.button}
        />
      </ScrollView>

      {/* Bottom Sheet for Wallet Selection */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enableOverDrag={false}
        handleComponent={null}
        index={1}
        backdropComponent={BackDrop}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetView}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Choose Wallet</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()}>
              <Ionicons name="close" size={24} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.walletList}
          >
            {cryptoWallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={[
                  styles.walletListItem,
                  selectedWallet.id === wallet.id && styles.walletListItemSelected,
                ]}
                onPress={() => handleSelectWallet(wallet)}
                activeOpacity={0.8}
              >
                <View style={[styles.walletIcon, { backgroundColor: wallet.color }]}>
                  <Image
                    source={wallet.icon}
                    style={styles.walletIconImage}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.walletInfo}>
                  <Text style={styles.walletName}>{wallet.name}</Text>
                  <Text style={styles.walletSymbol}>{wallet.symbol}</Text>
                </View>
                <View style={styles.walletPrice}>
                  <Text style={styles.walletPriceValue}>{wallet.price}</Text>
                  <Text
                    style={[
                      styles.walletPriceChange,
                      { color: wallet.changeColor },
                    ]}
                  >
                    {wallet.change}
                  </Text>
                </View>
                {selectedWallet.id === wallet.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={AppColors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
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
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  walletIconImage: {
    width: 32,
    height: 32,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  walletSymbol: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  walletPrice: {
    alignItems: "flex-end",
  },
  walletPriceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  walletPriceChange: {
    fontSize: 12,
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
  walletList: {
    flex: 1,
  },
  walletListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  walletListItemSelected: {
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
});

