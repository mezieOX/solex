import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AppColors } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const cryptocurrencies = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', price: '$45,230.50', change: '+2.45%', icon: require('@/assets/images/bitcoin.png'), color: AppColors.orange, selected: true },
  { id: 2, name: 'Ethereum', symbol: 'ETH', price: '$2,456.80', change: '+1.23%', icon: require('@/assets/images/eth.png'), color: AppColors.blue, selected: false },
  { id: 3, name: 'Tether', symbol: 'USDT', price: '$1.00', change: '0.00%', icon: require('@/assets/images/usdt.png'), color: AppColors.green, selected: false },
];

export default function ExchangeCryptoScreen() {
  const router = useRouter();
  const [selectedCrypto, setSelectedCrypto] = useState(cryptocurrencies[0]);
  const [amount, setAmount] = useState('0.00');
  const [walletAddress, setWalletAddress] = useState('');

  const exchangeRate = 'S45,000,000';
  const receiveAmount = 'S225,000.00';
  const networkFee = '0.0001 BTC';
  const serviceFee = '1.5%';
  const totalFee = 'S4,875.00';
  const totalReceive = 'S220,125.00';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={AppColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exchange Crypto</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Select Cryptocurrency */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Cryptocurrency</Text>
            <View style={styles.cryptoList}>
              {cryptocurrencies.map((crypto) => (
                <TouchableOpacity
                  key={crypto.id}
                  style={[
                    styles.cryptoCard,
                    selectedCrypto.id === crypto.id && styles.cryptoCardSelected,
                  ]}
                  onPress={() => setSelectedCrypto(crypto)}
                >
                  <View style={[styles.cryptoIcon, { backgroundColor: crypto.color }]}>
                    <Image
                      source={crypto.icon}
                      style={styles.cryptoIconImage}
                      contentFit="contain"
                    />
                  </View>
                  <View style={styles.cryptoInfo}>
                    <Text style={styles.cryptoName}>{crypto.name}</Text>
                    <Text style={styles.cryptoPrice}>{crypto.price}</Text>
                    <Text style={[styles.cryptoChange, { color: crypto.change.startsWith('+') ? AppColors.green : AppColors.textSecondary }]}>
                      {crypto.change}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Current Exchange Rate */}
          <Card style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <Ionicons name="refresh" size={20} color={AppColors.primary} />
              <Text style={styles.rateTitle}>Current Exchange Rate</Text>
            </View>
            <Text style={styles.rateValue}>1 BTC = {exchangeRate}</Text>
            <Text style={styles.rateUpdate}>Last updated: 2 mins ago</Text>
          </Card>

          {/* Amount to Exchange */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Amount to Exchange</Text>
              <TouchableOpacity style={styles.switchButton}>
                <Ionicons name="swap-vertical" size={20} color={AppColors.primary} />
                <Text style={styles.switchText}>Switch</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.amountInput}>
              <Text style={styles.amountValue}>{amount}</Text>
              <Text style={styles.amountCurrency}>{selectedCrypto.symbol}</Text>
            </View>
            <Card style={styles.receiveCard}>
              <Text style={styles.receiveLabel}>You will receive</Text>
              <Text style={styles.receiveAmount}>{receiveAmount}</Text>
            </Card>
          </View>

          {/* Wallet Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wallet Address</Text>
            <View style={styles.walletInputContainer}>
              <Input
                value={walletAddress}
                onChangeText={setWalletAddress}
                placeholder="Enter your wallet address"
                style={styles.walletInput}
              />
              <TouchableOpacity style={styles.qrButton}>
                <Ionicons name="qr-code" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.qrHint}>Or scan QR code to auto-fill address</Text>
          </View>

          {/* Fees */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fees</Text>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Network Fee:</Text>
              <Text style={styles.feeValue}>{networkFee}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Service Fee:</Text>
              <Text style={styles.feeValue}>{serviceFee}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Total Fee:</Text>
              <Text style={[styles.feeValue, { color: AppColors.primary }]}>{totalFee}</Text>
            </View>
          </View>

          {/* Total Amount to Receive */}
          <Card style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Amount to Receive</Text>
            <Text style={styles.totalAmount}>{totalReceive}</Text>
          </Card>

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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 12,
  },
  cryptoList: {
    gap: 12,
  },
  cryptoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cryptoCardSelected: {
    borderColor: AppColors.primary,
  },
  cryptoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cryptoIconImage: {
    width: 32,
    height: 32,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  cryptoPrice: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  cryptoChange: {
    fontSize: 12,
    marginTop: 2,
  },
  rateCard: {
    backgroundColor: AppColors.surfaceLight,
    marginBottom: 24,
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 4,
  },
  rateUpdate: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '600',
    color: AppColors.text,
  },
  amountCurrency: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchText: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '600',
  },
  receiveCard: {
    backgroundColor: AppColors.blueDark,
  },
  receiveLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  receiveAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  walletInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  walletInput: {
    flex: 1,
  },
  qrButton: {
    width: 56,
    height: 56,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrHint: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 8,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
  },
  totalCard: {
    backgroundColor: AppColors.blueDark,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  button: {
    marginTop: 20,
  },
});

