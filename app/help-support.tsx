import { Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { showErrorToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  gradientColors: [string, string, ...string[]];
  onPress: () => void;
}

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Support contact information
  const WHATSAPP_NUMBER = "+2341234567890";
  const SUPPORT_EMAIL = "support@solextrade.co";
  const CUSTOMER_SUPPORT_PHONE = "+2341234567890";

  const handleWhatsApp = async () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        showErrorToast({
          message: "WhatsApp is not installed on your device",
        });
      }
    } catch (error) {
      showErrorToast({
        message: "Unable to open WhatsApp",
      });
    }
  };

  const handleEmail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=Support Request`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        showErrorToast({
          message: "Unable to open email client",
        });
      }
    } catch (error) {
      showErrorToast({
        message: "Unable to open email",
      });
    }
  };

  const handlePhoneCall = async () => {
    const url = `tel:${CUSTOMER_SUPPORT_PHONE}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        showErrorToast({
          message: "Unable to make phone call",
        });
      }
    } catch (error) {
      showErrorToast({
        message: "Unable to make phone call",
      });
    }
  };

  const handleLiveChat = () => {
    router.push("/chat");
  };

  const supportOptions: SupportOption[] = [
    {
      id: "whatsapp",
      title: "WhatsApp Support",
      description: "Chat with us instantly",
      icon: "logo-whatsapp",
      iconColor: "#FFFFFF",
      gradientColors: ["#25D366", "#128C7E", "#075E54"],
      onPress: handleWhatsApp,
    },
    {
      id: "email",
      title: "Email Support",
      description: SUPPORT_EMAIL,
      icon: "mail",
      iconColor: "#FFFFFF",
      gradientColors: [AppColors.primary, "#FF9500", "#FF6B00"],
      onPress: handleEmail,
    },
    {
      id: "phone",
      title: "Customer Support",
      description: CUSTOMER_SUPPORT_PHONE,
      icon: "call",
      iconColor: "#FFFFFF",
      gradientColors: ["#007AFF", "#0051D5", "#00419C"],
      onPress: handlePhoneCall,
    },
    {
      id: "Live Chat",
      title: "Live Chat",
      description: "Chat with us instantly",
      icon: "chatbox-ellipses",
      iconColor: "#FFFFFF",
      gradientColors: ["#007AFF", "#0051D5", "#00419C"],
      onPress: handleLiveChat,
    },
  ];

  const faqItems = [
    {
      question: "How do I deposit funds?",
      answer:
        "You can deposit funds through bank transfer, cryptocurrency, or using our payment gateway. Go to Wallet > Deposit to get started.",
    },
    {
      question: "How long do transactions take?",
      answer:
        "Most transactions are processed within 5-10 minutes. Cryptocurrency transactions may take longer depending on network congestion.",
    },
    {
      question: "Is my account secure?",
      answer:
        "Yes, we use industry-standard encryption and security measures to protect your account and transactions.",
    },
    {
      question: "How do I withdraw funds?",
      answer:
        "Go to Wallet > Withdraw, select your preferred method, enter the amount and recipient details, then confirm the transaction.",
    },
    {
      question: "What currencies do you support?",
      answer:
        "We support multiple cryptocurrencies including Bitcoin, Ethereum, USDT, and various fiat currencies including NGN, USD, and more.",
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <ScreenTitle title="Help & Support" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[AppColors.primary + "30", AppColors.primary + "10"]}
            style={styles.heroIconContainer}
          >
            <Ionicons name="headset" size={48} color={AppColors.primary} />
          </LinearGradient>
          <Text style={styles.heroTitle}>We're Here to Help</Text>
          <Text style={styles.heroDescription}>
            Get in touch with our support team through any of the channels below
          </Text>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.supportOptionsContainer}>
            {supportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={option.onPress}
                activeOpacity={0.8}
                style={styles.supportOptionWrapper}
              >
                <LinearGradient
                  colors={option.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.supportOption}
                >
                  <View style={styles.supportIconContainer}>
                    <Ionicons
                      name={option.icon}
                      size={32}
                      color={option.iconColor}
                    />
                  </View>
                  <View style={styles.supportContent}>
                    <Text style={styles.supportTitle}>{option.title}</Text>
                    <Text style={styles.supportDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#FFFFFF"
                    style={styles.chevron}
                  />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[AppColors.primary + "30", AppColors.primary + "10"]}
              style={styles.sectionIconContainer}
            >
              <Ionicons
                name="help-circle"
                size={18}
                color={AppColors.primary}
              />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>
          <View style={styles.faqContainer}>
            {faqItems.map((faq, index) => (
              <Card key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={[
                    styles.faqHeader,
                    expandedFaq === index && styles.faqHeaderActive,
                  ]}
                  onPress={() => toggleFaq(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestionContainer}>
                    <View
                      style={[
                        styles.faqIconContainer,
                        expandedFaq === index && styles.faqIconContainerActive,
                      ]}
                    >
                      <Text style={styles.faqIconText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                  </View>
                  <Ionicons
                    name={expandedFaq === index ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={
                      expandedFaq === index
                        ? AppColors.primary
                        : AppColors.textSecondary
                    }
                  />
                </TouchableOpacity>
                {expandedFaq === index && (
                  <View style={styles.faqAnswerContainer}>
                    <View style={styles.faqAnswerIndicator} />
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        </View>

        {/* Additional Help Card */}
        <LinearGradient
          colors={[AppColors.primary + "20", AppColors.orange + "10"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.helpCard}
        >
          <View style={styles.helpCardContent}>
            <View style={styles.helpIconContainer}>
              <Ionicons name="time" size={32} color={AppColors.orange} />
            </View>
            <Text style={styles.helpTitle}>24/7 Support Available</Text>
            <Text style={styles.helpDescription}>
              Our support team is available round the clock to assist you with
              any questions or concerns. Don't hesitate to reach out!
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  faqIconText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.text,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 12,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  heroDescription: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  supportOptionsContainer: {
    gap: 10,
    paddingTop: 10,
  },
  supportOptionWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  supportOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
  },
  supportIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  supportDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  chevron: {
    marginLeft: 6,
  },
  faqContainer: {
    gap: 8,
  },
  faqCard: {
    padding: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: AppColors.border + "40",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: AppColors.surface,
  },
  faqHeaderActive: {
    backgroundColor: AppColors.primary + "10",
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primary + "30",
  },
  faqQuestionContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  faqIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  faqIconContainerActive: {
    backgroundColor: AppColors.primary + "20",
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.text,
    flex: 1,
  },
  faqAnswerContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: AppColors.surface,
    position: "relative",
  },
  faqAnswerIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: AppColors.primary,
    borderRadius: 2,
  },
  faqAnswer: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
    paddingLeft: 4,
  },
  helpCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.orange + "40",
  },
  helpCardContent: {
    alignItems: "center",
  },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.orange + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: AppColors.orange + "40",
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  helpDescription: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
