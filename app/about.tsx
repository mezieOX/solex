import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// Bullet Point Component with Icon
const BulletPoint = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bulletRow}>
    <Ionicons
      name="checkmark-circle"
      size={14}
      color={AppColors.primary}
      style={styles.bulletIcon}
    />
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

export default function AboutScreen() {
  const APP_VERSION = "1.0.0";
  const APP_NAME = "Solex Trade";

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <ScreenTitle title="About" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.introText}>
          Welcome to {APP_NAME}, a comprehensive trading platform designed to
          help individuals and businesses buy, sell, and exchange
          cryptocurrencies, gift cards, and fiat currencies seamlessly. By
          accessing or using our services, you agree to comply with and be bound
          by our Terms and Conditions.
        </Text>

        {/* Section 1 */}
        <Text style={styles.sectionTitle}>1. Platform Overview</Text>
        <Text style={styles.sectionText}>
          {APP_NAME} is a secure and user-friendly trading platform that enables
          you to:
        </Text>
        <View style={styles.bulletContainer}>
          <BulletPoint>
            Buy, sell, and exchange cryptocurrencies with competitive rates
          </BulletPoint>
          <BulletPoint>
            Trade gift cards for cash or other digital assets
          </BulletPoint>
          <BulletPoint>
            Manage fiat currency deposits and withdrawals
          </BulletPoint>
          <BulletPoint>
            Access real-time market rates and transaction history
          </BulletPoint>
        </View>

        {/* Section 2 */}
        <Text style={styles.sectionTitle}>2. Security & Privacy</Text>
        <View style={styles.bulletContainer}>
          <BulletPoint>
            Bank-level security encryption for all transactions
          </BulletPoint>
          <BulletPoint>
            Your personal information is protected and never shared with third
            parties without consent
          </BulletPoint>
          <BulletPoint>
            Two-factor authentication available for enhanced account security
          </BulletPoint>
          <BulletPoint>
            Regular security audits and compliance with industry standards
          </BulletPoint>
        </View>

        {/* Section 3 */}
        <Text style={styles.sectionTitle}>3. Key Features</Text>
        <View style={styles.bulletContainer}>
          <BulletPoint>
            Fast Transactions: Lightning-fast processing times for all trades
          </BulletPoint>
          <BulletPoint>
            Multi-Wallet Support: Manage multiple currencies in one platform
          </BulletPoint>
          <BulletPoint>
            24/7 Support: Round-the-clock customer service available
          </BulletPoint>
          <BulletPoint>
            Competitive Rates: Best-in-class exchange rates for all transactions
          </BulletPoint>
          <BulletPoint>
            User-Friendly Interface: Intuitive design for seamless trading
            experience
          </BulletPoint>
        </View>

        {/* Section 4 */}
        <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
        <Text style={styles.sectionText}>
          To maintain a secure and respectful trading environment, you agree to:
        </Text>
        <View style={styles.bulletContainer}>
          <BulletPoint>
            Provide accurate and complete information during registration
          </BulletPoint>
          <BulletPoint>
            Maintain the confidentiality of your login credentials
          </BulletPoint>
          <BulletPoint>
            Use the platform only for legitimate trading purposes
          </BulletPoint>
          <BulletPoint>
            Comply with all applicable laws and regulations
          </BulletPoint>
          <BulletPoint>
            Report any suspicious activity or security concerns immediately
          </BulletPoint>
        </View>

        {/* Section 5 */}
        <Text style={styles.sectionTitle}>5. Account Management</Text>
        <View style={styles.bulletContainer}>
          <BulletPoint>
            Account Creation: You must be at least 18 years old to create an
            account
          </BulletPoint>
          <BulletPoint>
            Account Verification: Complete identity verification for enhanced
            security and higher transaction limits
          </BulletPoint>
          <BulletPoint>
            Account Security: You are responsible for all activities under your
            account
          </BulletPoint>
          <BulletPoint>
            Account Suspension: We reserve the right to suspend accounts that
            violate our terms or engage in fraudulent activities
          </BulletPoint>
        </View>

        {/* Section 6 */}
        <Text style={styles.sectionTitle}>6. Transactions & Payments</Text>
        <View style={styles.bulletContainer}>
          <BulletPoint>
            Transaction Processing: All transactions are processed securely and
            efficiently
          </BulletPoint>
          <BulletPoint>
            Payment Methods: Multiple payment options available including bank
            transfer, cryptocurrency, and gift cards
          </BulletPoint>
          <BulletPoint>
            Transaction Fees: Transparent fee structure with no hidden charges
          </BulletPoint>
          <BulletPoint>
            Refund Policy: Refunds processed according to our terms and
            conditions
          </BulletPoint>
        </View>

        {/* Section 7 */}
        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <View style={styles.bulletContainer}>
          <BulletPoint>
            The platform is provided "as is" without warranties of any kind
          </BulletPoint>
          <BulletPoint>
            We are not liable for any loss, damages, or disruptions caused by
            technical issues beyond our control
          </BulletPoint>
          <BulletPoint>
            Users are responsible for the accuracy and reliability of
            information they provide
          </BulletPoint>
          <BulletPoint>
            Market risks: Cryptocurrency trading involves inherent market risks
          </BulletPoint>
        </View>

        {/* Section 8 */}
        <Text style={styles.sectionTitle}>8. Terms & Privacy</Text>
        <Text style={styles.sectionText}>
          By using {APP_NAME}, you agree to our Terms of Service and Privacy
          Policy. We are committed to protecting your data and ensuring a safe
          trading environment. Your personal information will not be shared with
          third parties without your consent, except as required by law.
        </Text>

        {/* Section 9 */}
        <Text style={styles.sectionTitle}>9. Contact Information</Text>
        <Text style={styles.sectionText}>
          For any questions, concerns, or support regarding {APP_NAME}, please
          contact us through our Help & Support section in the app. Our customer
          support team is available 24/7 to assist you.
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using {APP_NAME}, you acknowledge that you have read, understood,
            and agreed to these terms and conditions.
          </Text>
          <Text style={styles.versionText}>
            Version {APP_VERSION} • © {new Date().getFullYear()} {APP_NAME}
          </Text>
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
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  introText: {
    fontSize: 12,
    color: AppColors.text,
    lineHeight: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 12,
    color: AppColors.text,
    lineHeight: 18,
    marginBottom: 8,
  },
  bulletContainer: {
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border + "30",
  },
  footerText: {
    fontSize: 12,
    color: AppColors.text,
    lineHeight: 18,
    marginBottom: 10,
    fontStyle: "italic",
  },
  versionText: {
    paddingBottom: 40,
    paddingTop: 12,
    fontSize: 11,
    color: AppColors.textSecondary,
    textAlign: "center",
  },
});
