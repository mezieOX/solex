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
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  gradientCard: {
    backgroundColor: AppColors.surfaceLight,
  },
  backgroundImage: {
    borderRadius: 16,
    marginVertical: 8,
    overflow: "hidden",
  },
  backgroundImageStyle: {
    borderRadius: 16,
  },
  cardWithBackground: {
    backgroundColor: "transparent",
  },
});
