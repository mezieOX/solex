import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/theme';
import { Card } from '@/components/ui/card';

const cryptoData = [
  { name: 'Bitcoin', symbol: 'BTC', price: '$45,230.50', change: '+2.45%', icon: '🟠', color: AppColors.orange },
  { name: 'Ethereum', symbol: 'ETH', price: '$2,456.80', change: '+1.23%', icon: '🔵', color: AppColors.blue },
  { name: 'Tether', symbol: 'USDT', price: '$1.00', change: '0.00%', icon: '🟢', color: AppColors.green },
];

const transactions = [
  { id: 1, title: 'Data Subscription', amount: '-$450.00', type: 'debit' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={AppColors.text} />
            </View>
            <Text style={styles.greeting}>Hi, Sunday</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={AppColors.text} />
          </TouchableOpacity>
        </View>

        {/* Balance Cards */}
        <View style={styles.balanceContainer}>
          <Card style={[styles.balanceCard, { backgroundColor: AppColors.red }]}>
            <Text style={styles.balanceLabel}>Crypto Balance</Text>
            <Text style={styles.balanceAmount}>$250.00</Text>
          </Card>

          <Card style={[styles.balanceCard, styles.fiatCard, { backgroundColor: AppColors.primary }]}>
            <View style={styles.fiatHeader}>
              <Text style={styles.balanceLabel}>Fiat Account</Text>
              <View style={styles.currencyTag}>
                <Text style={styles.currencyText}>NGN</Text>
              </View>
            </View>
            <Text style={styles.balanceAmount}>₦250,000.00</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Deposit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transaction</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Sell All</Text>
            </TouchableOpacity>
          </View>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <Text style={styles.transactionTitle}>{transaction.title}</Text>
              <Text style={[styles.transactionAmount, { color: AppColors.red }]}>
                {transaction.amount}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Action</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/exchange-crypto')}
            >
              <Ionicons name="swap-horizontal" size={32} color={AppColors.red} />
              <Text style={styles.quickActionText}>Crypto Exchange</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/exchange-giftcard')}
            >
              <Ionicons name="gift" size={32} color={AppColors.red} />
              <Text style={styles.quickActionText}>Gift Card Exchange</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="receipt" size={32} color={AppColors.red} />
              <Text style={styles.quickActionText}>Pay Bills</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Market */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Market</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Price</Text>
            </TouchableOpacity>
          </View>
          {cryptoData.map((crypto, index) => (
            <View key={index} style={styles.marketItem}>
              <View style={[styles.cryptoIcon, { backgroundColor: crypto.color }]}>
                <Text style={styles.cryptoIconText}>{crypto.icon}</Text>
              </View>
              <View style={styles.cryptoInfo}>
                <Text style={styles.cryptoName}>{crypto.name}</Text>
                <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
              </View>
              <View style={styles.cryptoPrice}>
                <Text style={styles.priceText}>{crypto.price}</Text>
                <Text style={[styles.changeText, { color: crypto.change.startsWith('+') ? AppColors.green : AppColors.textSecondary }]}>
                  {crypto.change}
                </Text>
              </View>
            </View>
          ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
  },
  balanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  balanceCard: {
    marginBottom: 16,
    padding: 20,
  },
  fiatCard: {
    marginTop: -40,
    paddingTop: 40,
  },
  fiatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: AppColors.text,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.text,
    marginTop: 8,
  },
  currencyTag: {
    backgroundColor: AppColors.red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
  },
  sectionLink: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  transactionTitle: {
    fontSize: 16,
    color: AppColors.text,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: AppColors.text,
    textAlign: 'center',
  },
  marketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cryptoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cryptoIconText: {
    fontSize: 24,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  cryptoSymbol: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  cryptoPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  changeText: {
    fontSize: 14,
    marginTop: 4,
  },
});
