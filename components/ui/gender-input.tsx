import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GenderSelectBottomSheet } from "./gender-select-bottom-sheet";

interface GenderInputProps {
  label?: string;
  value?: string;
  onChange?: (gender: string) => void;
  error?: string;
  placeholder?: string;
}

const genderLabels: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export function GenderInput({
  label,
  value,
  onChange,
  error,
  placeholder = "Select gender",
}: GenderInputProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const handleSelectGender = (gender: string) => {
    if (onChange) {
      onChange(gender);
    }
  };

  const displayValue = value ? genderLabels[value] || value : placeholder;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
        ]}
        onPress={handleOpenBottomSheet}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.inputText,
            !value && styles.placeholderText,
          ]}
        >
          {displayValue}
        </Text>
        <Ionicons
          name="chevron-down-outline"
          size={20}
          color={AppColors.textSecondary}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <GenderSelectBottomSheet
        bottomSheetModalRef={bottomSheetRef}
        onSelectGender={handleSelectGender}
        selectedGender={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "500",
    fontSize: 14,
    color: AppColors.text,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputContainerError: {
    borderColor: AppColors.error,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.text,
    paddingVertical: 16,
  },
  placeholderText: {
    color: AppColors.textMuted,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    marginTop: 4,
  },
});

