import { SectionHeader } from "@/components/ui/section-header";
import React from "react";
import { StyleSheet, View } from "react-native";
import { QuickActionCard } from "./quick-action-card";

interface QuickAction {
  title: string;
  icon?: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  iconColor?: string;
  iconBackgroundColor?: string;
  customIcon?: React.ReactNode;
  onPress?: () => void;
}

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
  style?: any;
}

export function QuickActions({
  title = "Quick Action",
  actions,
  style,
}: QuickActionsProps) {
  return (
    <View style={[styles.container, style]}>
      <SectionHeader title={title} />
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <QuickActionCard
            key={index}
            title={action.title}
            icon={action.icon}
            iconColor={action.iconColor}
            iconBackgroundColor={action.iconBackgroundColor}
            customIcon={action.customIcon}
            onPress={action.onPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
});
