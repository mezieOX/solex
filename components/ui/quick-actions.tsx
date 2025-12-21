import { SkeletonAvatar, SkeletonText } from "@/components/skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { router } from "expo-router";
import React from "react";
import {
  DimensionValue,
  FlatList,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
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
  isLoading?: boolean;
}

function QuickActionSkeleton({ numColumns }: { numColumns: number }) {
  // Generate skeleton items based on numColumns (typically 4 or 8 items)
  const skeletonCount = numColumns * 1;
  const skeletonItems = Array.from({ length: skeletonCount }, (_, i) => i);
  const cardWidth: DimensionValue = `${100 / numColumns}%`;

  return (
    <View style={styles.skeletonContainer}>
      {skeletonItems.map((item) => (
        <View
          key={item}
          style={[
            styles.skeletonCard,
            { width: cardWidth, maxWidth: cardWidth },
          ]}
        >
          <SkeletonAvatar size={48} type="circle" />
          <SkeletonText width="80%" height={14} style={styles.skeletonText} />
        </View>
      ))}
    </View>
  );
}

export function QuickActions({
  title,
  actions,
  style,
  headerSectionStyle,
  numColumns = 4,
  isLoading,
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
      {isLoading ? (
        <QuickActionSkeleton numColumns={numColumns} />
      ) : (
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
      )}
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
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  skeletonCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  skeletonText: {
    marginTop: 10,
  },
});
