import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '@/constants/theme';

export default function WalletScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
  },
});

