import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const giftCardBrands = [
  { id: 1, name: 'Amazon', selected: true },
  { id: 2, name: 'iTunes', selected: false },
  { id: 3, name: 'Google Play', selected: false },
  { id: 4, name: 'Steam', selected: false },
  { id: 5, name: 'eBay', selected: false },
  { id: 6, name: 'Walmart', selected: false },
  { id: 7, name: 'Target', selected: false },
  { id: 8, name: 'More', selected: false },
];

export default function ExchangeGiftCardScreen() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState(giftCardBrands[0]);
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState('');

  const exchangeRate = 'S950/$1';
  const cardAmount = '$100';
  const localCurrency = 'S95,000';
  const youReceive = 'S95,000';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={AppColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exchange Gift Card</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Select Gift Card Brand */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Gift Card Brand</Text>
            <View style={styles.brandGrid}>
              {giftCardBrands.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={[
                    styles.brandCard,
                    selectedBrand.id === brand.id && styles.brandCardSelected,
                  ]}
                  onPress={() => setSelectedBrand(brand)}
                >
                  {brand.name === 'More' ? (
                    <Ionicons name="add" size={32} color={AppColors.textSecondary} />
                  ) : (
                    <View style={styles.brandIcon}>
                      <Ionicons name="gift" size={18} color={AppColors.text} />
                    </View>
                  )}
                  <Text style={styles.brandName}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Select Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Amount</Text>
            <View style={styles.amountContainer}>
              <Input
                value={amount}
                onChangeText={setAmount}
                placeholder="Select amount"
                style={styles.amountInput}
              />
              <Ionicons name="chevron-down" size={18} color={AppColors.textSecondary} style={styles.dropdownIcon} />
            </View>
          </View>

          {/* Enter Gift Card Code */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enter Gift Card Code</Text>
            <Input
              value={code}
              onChangeText={setCode}
              placeholder="Enter gift card code"
              style={styles.codeInput}
            />
            <Text style={styles.orText}>OR</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Ionicons name="camera" size={18} color={AppColors.text} />
              <Text style={styles.uploadText}>Upload Card Image</Text>
            </TouchableOpacity>
          </View>

          {/* Current Exchange Rate */}
          <Card style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <Ionicons name="bar-chart" size={20} color={AppColors.primary} />
              <Text style={styles.rateTitle}>Current Exchange Rate</Text>
            </View>
            <View style={styles.rateContent}>
              <View style={styles.rateLeft}>
                <Text style={styles.rateAmount}>{cardAmount}</Text>
                <Text style={styles.rateLabel}>Gift Card Value</Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color={AppColors.primary} />
              <View style={styles.rateRight}>
                <Text style={styles.rateLocal}>{localCurrency}</Text>
                <Text style={styles.rateLabel}>Local Currency</Text>
              </View>
            </View>
            <View style={styles.rateFooter}>
              <Text style={styles.ratePerDollar}>Rate per $1</Text>
              <Text style={styles.rateValue}>{exchangeRate}</Text>
            </View>
          </Card>

          {/* Transaction Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gift Card Brand</Text>
              <Text style={styles.summaryValue}>{selectedBrand.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Card Amount</Text>
              <Text style={styles.summaryValue}>{cardAmount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Exchange Rate</Text>
              <Text style={styles.summaryValue}>{exchangeRate}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>You'll Receive</Text>
              <Text style={[styles.summaryValue, { color: AppColors.primary }]}>{youReceive}</Text>
            </View>
          </View>

          <Button
            title="Continue"
            onPress={() => {}}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 8,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 6,
  },
  brandCardSelected: {
    borderColor: AppColors.primary,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandName: {
    fontSize: 11,
    color: AppColors.text,
    textAlign: 'center',
  },
  amountContainer: {
    position: 'relative',
  },
  amountInput: {
    paddingRight: 32,
  },
  dropdownIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
  },
  codeInput: {
    marginBottom: 10,
  },
  orText: {
    textAlign: 'center',
    fontSize: 12,
    color: AppColors.textSecondary,
    marginVertical: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  uploadText: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: '500',
  },
  rateCard: {
    backgroundColor: AppColors.surfaceLight,
    marginBottom: 12,
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  rateTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.text,
  },
  rateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rateLeft: {
    flex: 1,
  },
  rateRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rateAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 2,
  },
  rateLocal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 2,
  },
  rateLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  rateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  ratePerDollar: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  rateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  summaryLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.text,
  },
  button: {
    marginTop: 12,
  },
});

