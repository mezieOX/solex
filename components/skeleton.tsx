import { AppColors } from "@/constants/theme";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  DimensionValue,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface SkeletonProps {
  type?: "rectangle" | "square" | "circle";
  size?: number;
  height?: number;
  width?: DimensionValue;
  rows?: number;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export default function Skeleton({
  type = "rectangle",
  size,
  height = 20,
  width,
  rows = 1,
  loading = true,
  style,
  children,
}: SkeletonProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const fadeIn = Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      });

      const fadeOut = Animated.timing(fadeAnim, {
        toValue: 0.2,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      });

      const animation = Animated.loop(Animated.sequence([fadeIn, fadeOut]));

      animation.start();

      return () => {
        animation.stop();
      };
    }
  }, [loading, fadeAnim]);

  if (!loading && children) {
    return <>{children}</>;
  }

  if (!loading) {
    return null;
  }

  const containerStyle: (StyleProp<ViewStyle> | ViewStyle)[] = [
    styles.container,
    style,
  ];
  if (width) {
    containerStyle.push({ width });
  }

  const renderSkeleton = () => {
    if (type === "circle") {
      const circleSize = size || 48;
      return (
        <View
          style={[
            styles.skeletonBase,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: AppColors.surface,
            },
          ]}
        >
          <Animated.View
            style={[
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                backgroundColor: AppColors.surfaceLight,
                opacity: fadeAnim,
              },
            ]}
          />
        </View>
      );
    }

    if (type === "square") {
      const squareSize = size || 100;
      return (
        <View
          style={[
            styles.skeletonBase,
            {
              width: squareSize,
              height: squareSize,
              backgroundColor: AppColors.surface,
            },
          ]}
        >
          <Animated.View
            style={[
              {
                width: squareSize,
                height: squareSize,
                backgroundColor: AppColors.surfaceLight,
                opacity: fadeAnim,
              },
            ]}
          />
        </View>
      );
    }

    // Rectangle type
    const rectangles = [];
    for (let i = 0; i < rows; i++) {
      rectangles.push(
        <View
          key={i}
          style={[
            styles.skeletonBase,
            {
              width: width || "100%",
              height,
              backgroundColor: AppColors.surface,
              marginBottom: i < rows - 1 ? 8 : 0,
            },
          ]}
        >
          <Animated.View
            style={[
              {
                width: "100%",
                height,
                backgroundColor: AppColors.surfaceLight,
                opacity: fadeAnim,
              },
            ]}
          />
        </View>
      );
    }
    return <>{rectangles}</>;
  };

  return <View style={containerStyle}>{renderSkeleton()}</View>;
}

// Predefined skeleton components for common use cases
export function SkeletonText({
  width = "100%",
  style,
  rows = 1,
  height = 16,
}: {
  width?: DimensionValue;
  style?: StyleProp<ViewStyle>;
  rows?: number;
  height?: number;
}) {
  return (
    <Skeleton
      type="rectangle"
      width={width}
      height={height}
      rows={rows}
      style={style}
    />
  );
}

export function SkeletonTitle({
  width = "60%",
  style,
  height = 24,
}: {
  width?: DimensionValue;
  style?: StyleProp<ViewStyle>;
  height?: number;
}) {
  return (
    <Skeleton
      type="rectangle"
      width={width}
      height={height}
      rows={1}
      style={style}
    />
  );
}

export function SkeletonAvatar({
  size = 48,
  style,
  type = "rectangle",
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
  type?: "rectangle" | "circle" | "square";
}) {
  return <Skeleton type={type} width={size} height={size} style={style} />;
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      <SkeletonTitle width="70%" style={styles.cardTitle} />
      <SkeletonText width="100%" rows={2} style={styles.cardText} />
      <Skeleton
        type="rectangle"
        width="40%"
        height={16}
        style={styles.cardFooter}
      />
    </View>
  );
}

export function SkeletonListItem({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.listItem, style]}>
      <SkeletonAvatar size={48} style={styles.listItemAvatar} />
      <View style={styles.listItemContent}>
        <SkeletonTitle width="60%" style={styles.listItemTitle} />
        <SkeletonText width="80%" rows={1} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  skeletonBase: {
    overflow: "hidden",
  },
  spacing: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    marginBottom: 12,
  },
  cardText: {
    marginBottom: 8,
  },
  cardFooter: {
    marginTop: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemAvatar: {
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    marginBottom: 8,
  },
});
