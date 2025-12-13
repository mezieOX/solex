import { Button } from "@/components/ui/button";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface WalletSelectBottomSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  onSelectWallet: (walletType: "crypto" | "fiat") => void;
  mode?: "deposit" | "withdrawal";
}

const getWalletOptions = (mode: "deposit" | "withdrawal" = "deposit"): WalletOption[] => [
  {
    id: "fiat",
    name: mode === "deposit" ? "Fiat Deposit" : "Fiat Withdrawal",
    description: mode === "deposit" ? "Fiat Deposit" : "Fiat Withdrawal",
    icon: "wallet",
  },
  {
    id: "crypto",
    name: mode === "deposit" ? "Crypto Deposit" : "Crypto Withdrawal",
    description: mode === "deposit" ? "Crypto Deposit" : "Crypto Withdrawal",
    icon: "swap-horizontal",
  },
];

export const WalletSelectBottomSheet: React.FC<
  WalletSelectBottomSheetProps
> = ({ bottomSheetModalRef, onSelectWallet, mode = "deposit" }) => {
  const walletOptions = useMemo(() => getWalletOptions(mode), [mode]);
  const snapPoints = useMemo(() => ["35%", "45%"], []);

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

  const handleClose = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  const handleSelectWallet = (walletType: "crypto" | "fiat") => {
    onSelectWallet(walletType);
    handleClose();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      enableOverDrag={false}
      handleComponent={null}
      index={1}
      backdropComponent={BackDrop}
      snapPoints={snapPoints}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <BottomSheetView style={styles.bottomSheetView}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={32} color={AppColors.text} />
          </TouchableOpacity>
          {/* <Text style={styles.title}>Select wallet to deposit money</Text> */}
        </View>

        <View style={styles.contentContainer}>
          {walletOptions.map((option) => (
            <View key={option.id} style={styles.sectionContainer}>
              <Button
                title={option.description}
                onPress={() =>
                  handleSelectWallet(option.id as "crypto" | "fiat")
                }
                style={styles.walletButton}
              />
            </View>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  headerContainer: {
    marginBottom: 24,
    position: "absolute",
    right: 20,
    top: 0,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
    textAlign: "center",
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  sectionContainer: {
    gap: 12,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.textSecondary,
    textTransform: "uppercase",
  },
  walletButton: {
    width: "100%",
  },
});
