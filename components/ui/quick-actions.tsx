import { SectionHeader } from "@/components/ui/section-header";
import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, View, ViewStyle } from "react-native";
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
  headerSectionStyle?: ViewStyle;
  numColumns?: number;
}

export function QuickActions({
  title,
  actions,
  style,
  headerSectionStyle,
  numColumns = 4,
}: QuickActionsProps) {
  return (
    <View style={[styles.container, style]}>
      {title ? (
        <SectionHeader
          title={title}
          actionText="See All"
          onActionPress={() => router.push("/services")}
          style={headerSectionStyle}
        />
      ) : null}
      <FlatList
        data={actions}
        numColumns={numColumns}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item }) => (
          <QuickActionCard
            title={item.title}
            icon={item.icon}
            iconColor={item.iconColor}
            iconBackgroundColor={item.iconBackgroundColor}
            customIcon={item.customIcon}
            onPress={item.onPress}
          />
        )}
        scrollEnabled={false}
        contentContainerStyle={styles.actionsContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  actionsContainer: {
    gap: 0,
  },
});
