import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface WalletSelectBottomSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  onSelectWallet: (walletType: "crypto" | "fiat") => void;
}

const walletOptions: WalletOption[] = [
  {
    id: "crypto",
    name: "Crypto Deposit",
    description: "Deposit Funds to your Crypto wallet",
    icon: "swap-horizontal",
  },
  {
    id: "fiat",
    name: "Fiat Deposit",
    description: "Deposit Funds to your Fiat wallet",
    icon: "wallet",
  },
];

export const WalletSelectBottomSheet: React.FC<
  WalletSelectBottomSheetProps
> = ({ bottomSheetModalRef, onSelectWallet }) => {
  const snapPoints = useMemo(() => ["50%", "60%"], []);

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
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={32} color={AppColors.text} />
          </Pressable>
          <Text style={styles.title}>Select wallet to deposit money</Text>
        </View>

        <View style={styles.contentContainer}>
          {walletOptions.map((option) => (
            <View key={option.id} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{option.name}</Text>
              <TouchableOpacity
                style={styles.walletButton}
                onPress={() =>
                  handleSelectWallet(option.id as "crypto" | "fiat")
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={AppColors.background}
                  style={styles.walletIcon}
                />
                <Text style={styles.walletButtonText}>
                  {option.description}
                </Text>
              </TouchableOpacity>
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
    paddingTop: 20,
  },
  headerContainer: {
    marginBottom: 24,
    position: "relative",
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
    gap: 24,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.textSecondary,
    textTransform: "uppercase",
  },
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  walletIcon: {
    marginRight: 4,
  },
  walletButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.background,
    flex: 1,
  },
});
