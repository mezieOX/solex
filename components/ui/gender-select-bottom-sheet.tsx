import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GenderOption {
  id: string;
  label: string;
}

interface GenderSelectBottomSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  onSelectGender: (gender: string) => void;
  selectedGender?: string;
}

const genderOptions: GenderOption[] = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
];

export const GenderSelectBottomSheet: React.FC<
  GenderSelectBottomSheetProps
> = ({ bottomSheetModalRef, onSelectGender, selectedGender }) => {
  const snapPoints = useMemo(() => ["40%"], []);

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

  const handleClose = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  const handleSelectGender = (gender: string) => {
    onSelectGender(gender);
    handleClose();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      enableOverDrag={false}
      handleComponent={null}
      index={0}
      backdropComponent={BackDrop}
      snapPoints={snapPoints}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <BottomSheetView style={styles.bottomSheetView}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Select Gender</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color={AppColors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {genderOptions.map((option) => {
            const isSelected = selectedGender === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.genderItem,
                  isSelected && styles.genderItemSelected,
                ]}
                onPress={() => handleSelectGender(option.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.genderLabel,
                    isSelected && styles.genderLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={AppColors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    gap: 12,
  },
  genderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  genderItemSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + "10",
  },
  genderLabel: {
    fontSize: 16,
    color: AppColors.text,
    fontWeight: "500",
  },
  genderLabelSelected: {
    color: AppColors.primary,
  },
});

