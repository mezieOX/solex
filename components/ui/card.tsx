import { AppColors } from "@/constants/theme";
import React from "react";
import {
  ImageBackground,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "gradient";
  backgroundImage?: any; // For require() image sources
}

export function Card({
  children,
  style,
  variant = "default",
  backgroundImage,
}: CardProps) {
  const cardContent = (
    <View
      style={[
        styles.card,
        variant === "gradient" && styles.gradientCard,
        backgroundImage && styles.cardWithBackground,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (backgroundImage) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={[styles.backgroundImage, style]}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="stretch"
      >
        {cardContent}
      </ImageBackground>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },
  gradientCard: {
    backgroundColor: AppColors.surfaceLight,
  },
  backgroundImage: {
    borderRadius: 10,
    marginVertical: 6,
    overflow: "hidden",
  },
  backgroundImageStyle: {
    borderRadius: 10,
  },
  cardWithBackground: {
    backgroundColor: "transparent",
  },
});
