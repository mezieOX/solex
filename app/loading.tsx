import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppColors } from '@/constants/theme';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ActivityIndicator size="large" color={AppColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

