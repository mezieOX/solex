import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

        <Text style={styles.title}>Log in to Account</Text>

        <View style={styles.form}>
          <Input
            label="Enter Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={
              <Ionicons
                name="mail-outline"
                size={20}
                color={AppColors.textSecondary}
              />
            }
          />

          <Input
            label="Enter Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            leftIcon={
              <Ionicons
                name="lock-closed"
                size={20}
                color={AppColors.textSecondary}
              />
            }
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={AppColors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/auth/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>
              Forget your password?{" "}
              <Text style={styles.linkText}>Click here</Text>
            </Text>
          </TouchableOpacity>

          <Button
            title="Login"
            onPress={() => router.push("/(tabs)")}
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Don't have an account?{" "}
              <Text
                style={styles.linkText}
                onPress={() => router.push("/auth/signup")}
              >
                Signup
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
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  appName: {
    fontSize: 24,
    fontWeight: "600",
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
  forgotPassword: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: AppColors.text,
  },
  linkText: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  loginButton: {
    marginBottom: 24,
  },
  signupContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  signupText: {
    fontSize: 14,
    color: AppColors.text,
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
  },
  socialButton: {
    width: 60,
    height: 60,
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
