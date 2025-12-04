import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import { AppColors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EmailVerificationScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const email = "sundaybles...@gmail.com";

  const handleOTPComplete = (otp: string) => {
    setCode(otp);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Email Verification</Text>
        <Text style={styles.subtitle}>
          Please enter the code we sent to your email{" "}
          <Text style={styles.emailText}>{email}</Text> for verification
        </Text>

        <View style={styles.iconContainer}>
          <Image
            source={require("@/assets/images/message.png")}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        <OTPInput length={6} onComplete={handleOTPComplete} value={code} />

        <TouchableOpacity style={styles.resendContainer}>
          <Text style={styles.resendText}>
            I don't receive code?{" "}
            <Text style={styles.resendLink}>Resend Code</Text>
          </Text>
        </TouchableOpacity>

        <Button
          title="Continue"
          onPress={() => router.push("/auth/create-password")}
          style={styles.button}
        />
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  emailText: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 32,
  },
  icon: {
    width: 85,
    height: 85,
  },
  resendContainer: {
    marginTop: 15,
    alignItems: "center",
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  resendLink: {
    color: AppColors.text,
    fontWeight: "600",
  },
  button: {
    marginTop: 20,
  },
});
