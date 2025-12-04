import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/theme';
import { Button } from '@/components/ui/button';

export default function EnableQuickAccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="finger-print" size={64} color={AppColors.orange} />
          </View>
        </View>

        <Text style={styles.title}>Enable Quick Access</Text>
        <Text style={styles.subtitle}>
          Enable Face ID or Touch for fast and more secure access to your account
        </Text>

        <View style={styles.buttons}>
          <Button
            title="Enable Now"
            onPress={() => router.push('/(tabs)')}
            style={styles.enableButton}
          />
          <Button
            title="Maybe Later"
            onPress={() => router.push('/(tabs)')}
            variant="outline"
            style={styles.laterButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.orange,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  enableButton: {
    marginBottom: 0,
  },
  laterButton: {
    marginBottom: 0,
  },
});

