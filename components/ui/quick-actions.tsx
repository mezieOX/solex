import { SkeletonAvatar, SkeletonText } from "@/components/skeleton";
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
  iconSize?: number;
  iconBackgroundColor?: string;
  customIcon?: React.ReactNode;
  onPress?: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  style?: any;
  headerSectionStyle?: ViewStyle;
  numColumns?: number;
  isLoading?: boolean;
  iconBackgroundColor?: string;
  iconContainerStyle?: ViewStyle;
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
  actions,
  style,
  numColumns = 4,
  isLoading,
  iconContainerStyle,
}: QuickActionsProps) {
  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <QuickActionSkeleton numColumns={numColumns} />
      ) : (
        <FlatList
          data={actions}
          numColumns={numColumns}
          scrollEnabled={false}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          renderItem={({ item }) => (
            <QuickActionCard
              title={item.title}
              icon={item.icon}
              iconColor={item.iconColor}
              iconSize={item.iconSize}
              iconContainerStyle={iconContainerStyle}
              iconBackgroundColor={item.iconBackgroundColor}
              customIcon={item.customIcon}
              onPress={item.onPress}
            />
          )}
          {...({ contentContainerStyle: styles.actionsContainer } as any)}
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
