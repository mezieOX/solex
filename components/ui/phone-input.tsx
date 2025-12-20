import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { FC, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { FlagType, getAllCountries } from "react-native-country-picker-modal";
import PhoneInputLib from "react-native-phone-input";

interface PhoneInputProps
  extends Omit<TextInputProps, "value" | "onChangeText"> {
  label?: string;
  error?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  onChangePhoneNumber?: (value: string) => void;
  containerStyle?: ViewStyle;
  defaultCountry?: string;
}

export const PhoneInput: FC<PhoneInputProps> = ({
  label,
  error,
  value,
  onChangeText,
  onChangePhoneNumber,
  containerStyle,
  defaultCountry = "ng",
  ...props
}) => {
  const phoneInput = useRef<PhoneInputLib>(null);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] =
    useState<string>(defaultCountry);

  // Set Nigeria as default if no value is provided
  React.useEffect(() => {
    if (phoneInput.current && !value) {
      phoneInput.current.selectCountry("ng");
      setSelectedCountryCode("ng");
    }
  }, []);

  // Get countries when modal opens
  React.useEffect(() => {
    if (isCountryPickerVisible) {
      const fetchCountries = async () => {
        try {
          // getAllCountries requires flagType parameter
          const allCountries = await getAllCountries(FlagType.EMOJI);
          console.log(
            "Fetched countries:",
            allCountries?.length,
            allCountries?.[0]
          );
          if (
            allCountries &&
            Array.isArray(allCountries) &&
            allCountries.length > 0
          ) {
            setCountries(allCountries);
            setFilteredCountries(allCountries);
          } else {
            console.warn("No countries fetched or empty array");
          }
        } catch (error) {
          console.error("Error getting countries:", error);
        }
      };
      fetchCountries();
    } else {
      // Clear countries when modal closes to save memory
      setCountries([]);
      setFilteredCountries([]);
      setSearchQuery("");
    }
  }, [isCountryPickerVisible]);

  // Filter countries based on search query
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter((country: any) => {
        const name =
          country.name?.common?.toLowerCase() ||
          country.name?.toLowerCase() ||
          "";
        const code =
          country.cca2?.toLowerCase() || country.iso2?.toLowerCase() || "";
        const dialCode = country.callingCode?.[0] || country.dialCode || "";
        const query = searchQuery.toLowerCase();
        return (
          name.includes(query) ||
          code.includes(query) ||
          dialCode.includes(query)
        );
      });
      setFilteredCountries(filtered);
    }
  }, [searchQuery, countries]);

  const handleFlagPress = () => {
    setIsCountryPickerVisible(true);
  };

  const handleCountrySelect = (countryCode: string) => {
    if (phoneInput.current) {
      try {
        phoneInput.current.selectCountry(countryCode);
        setSelectedCountryCode(countryCode);
        setIsCountryPickerVisible(false);
      } catch (error) {
        console.error("Error selecting country:", error);
      }
    }
  };

  const handlePhoneChange = (phone: string) => {
    setIsFocus(phone?.length > 3 ? true : false);

    // Remove all spaces and other formatting characters from phone number
    const phoneWithoutSpaces = phone?.replace(/[\s\-\(\)]/g, "") || "";

    if (onChangePhoneNumber) {
      onChangePhoneNumber(phoneWithoutSpaces);
    }

    if (onChangeText) {
      onChangeText(phoneWithoutSpaces);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <PhoneInputLib
        ref={phoneInput}
        style={[
          styles.input,
          {
            borderColor: isFocus
              ? AppColors.primary
              : error
              ? AppColors.error
              : AppColors.border,
          },
        ]}
        initialCountry={defaultCountry}
        key="1"
        onPressFlag={handleFlagPress}
        allowZeroAfterCountryCode={false}
        autoFormat
        textProps={{
          placeholder: "000 000 0000",
          placeholderTextColor: AppColors.textMuted,
          ...props,
        }}
        flagStyle={styles.flag}
        onChangePhoneNumber={handlePhoneChange}
        textStyle={[
          styles.phoneInputTextStyle,
          {
            color: AppColors.text,
          },
        ]}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Country Picker Modal */}
      <Modal
        visible={isCountryPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCountryPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsCountryPickerVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setIsCountryPickerVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={AppColors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search country..."
                placeholderTextColor={AppColors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearButton}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={AppColors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.countryList}
              contentContainerStyle={styles.countryListContent}
              showsVerticalScrollIndicator={true}
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country: any) => {
                  // react-native-country-picker-modal uses cca2 for country code
                  const countryCode =
                    country.cca2?.toLowerCase() ||
                    country.iso2?.toLowerCase() ||
                    "";
                  const countryName =
                    country.name?.common || country.name || "";
                  const dialCode =
                    country.callingCode?.[0] || country.dialCode || "";
                  // When using FlagType.EMOJI, the flag emoji is in the flag property
                  const flag = country.flag || "🏳️";
                  const isSelected =
                    selectedCountryCode?.toLowerCase() === countryCode;

                  if (!countryCode) {
                    return null;
                  }

                  return (
                    <TouchableOpacity
                      key={country.cca2 || country.iso2}
                      style={[
                        styles.countryItem,
                        isSelected && styles.countryItemSelected,
                      ]}
                      onPress={() => handleCountrySelect(countryCode)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.countryInfo}>
                        <Text style={styles.countryName}>{countryName}</Text>
                        <Text style={styles.countryDialCode}>
                          {dialCode ? `+${dialCode}` : ""}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={AppColors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "No countries found"
                      : "Loading countries..."}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  input: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    width: "100%",
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  flag: {
    borderRadius: 6,
  },
  phoneInputTextStyle: {
    fontSize: 14,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    marginTop: 4,
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
    height: "80%",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
  },
  closeButton: {
    padding: 4,
  },
  countryList: {
    flex: 1,
  },
  countryListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border + "30",
  },
  countryItemSelected: {
    backgroundColor: AppColors.primary + "10",
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countryName: {
    fontSize: 16,
    color: AppColors.text,
    fontWeight: "500",
  },
  countryDialCode: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginRight: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: AppColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginTop: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.text,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
});
