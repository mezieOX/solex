import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/theme';
import { Button } from '@/components/ui/button';

export default function GiftCardScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gift Card Exchange</Text>
      <Button
        title="Exchange Gift Card"
        onPress={() => router.push('/exchange-giftcard')}
      />
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
    marginBottom: 20,
  },
});

