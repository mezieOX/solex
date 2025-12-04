import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and App Name */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/app-logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.appName}>Solex Trade</Text>
        </View>

        <Text style={styles.title}>Sign Up New Account</Text>

        <View style={styles.form}>
          <Input
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Legal first name"
          />

          <Input
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Legal last name"
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <Button
            title="Continue"
            onPress={() => router.push("/auth/email-verification")}
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text
                style={styles.linkText}
                onPress={() => router.push("/auth/login")}
              >
                Login
              </Text>
            </Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require("@/assets/images/apple.png")}
                style={styles.socialButtonImage}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require("@/assets/images/google.png")}
                style={styles.socialButtonImage}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: 30,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 35,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: "500",
    color: AppColors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 45,
  },
  form: {
    width: "100%",
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  loginText: {
    paddingTop: 25,
    fontSize: 16,
    color: AppColors.text,
  },
  linkText: {
    color: AppColors.primary,
    fontWeight: "500",
    marginHorizontal: 9,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
    borderStyle: "dashed",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  socialButtonImage: {
    width: 30,
    height: 30,
  },
});
