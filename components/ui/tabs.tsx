import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface TabOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ options, activeTab, onTabChange }: TabsProps) {
  return (
    <View style={styles.tabContainer}>
      {options.map((option) => {
        const isActive = activeTab === option.id;
        const isDisabled = option.disabled;
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.tab,
              isActive && styles.activeTab,
              isDisabled && styles.disabledTab,
            ]}
            onPress={() => {
              if (!isDisabled) {
                onTabChange(option.id);
              }
            }}
            activeOpacity={isDisabled ? 1 : 0.8}
            disabled={isDisabled}
          >
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={16}
                color={
                  isDisabled
                    ? AppColors.textSecondary + "80"
                    : isActive
                    ? AppColors.primary
                    : AppColors.textSecondary
                }
                style={styles.tabIcon}
              />
            )}
            <Text
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
                isDisabled && styles.disabledTabText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: AppColors.surface,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: AppColors.primary,
  },
  tabIcon: {
    marginRight: 0,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  activeTabText: {
    color: "#fff",
  },
  disabledTab: {
    opacity: 0.5,
  },
  disabledTabText: {
    opacity: 0.5,
  },
});
