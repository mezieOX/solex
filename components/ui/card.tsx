import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'gradient';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.card, variant === 'gradient' && styles.gradientCard, style]}>
      {children}
    </View>
  );
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
});

