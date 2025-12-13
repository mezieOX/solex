import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { useLogin } from "@/hooks/api/use-auth";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { formatValidationError, loginSchema } from "@/utils/validation";
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
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleLogin = async () => {
    try {
      // Validate form using Yup
      const formData = {
        email: email.trim(),
        password,
      };

      await loginSchema.validate(formData, { abortEarly: false });

      // Clear any previous errors
      setErrors({});

      // Submit login
      const result = await login.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      if (result.access_token) {
        showSuccessToast({
          message: "Login successful!",
        });
        // Navigate to home screen
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      // Handle Yup validation errors
      if (error.name === "ValidationError") {
        const formattedErrors = formatValidationError(error);
        setErrors(formattedErrors);
        // Show first validation error as toast
        const firstError = Object.values(formattedErrors)[0];
        if (firstError) {
          showErrorToast({
            message: firstError,
          });
        }
        return;
      }

      // Handle API errors
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      showErrorToast({
        message: errorMessage,
      });
    }
  };

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
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
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
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            error={errors.password}
            leftIcon={
              <Ionicons
                name="lock-closed"
                size={20}
                color={AppColors.textSecondary}
              />
            }
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={AppColors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          <View
            style={[
              styles.signupContainer,
              {
                marginBottom: 65,
              },
            ]}
          >
            <Text style={styles.signupText}>Forget your password? </Text>
            <TouchableOpacity
              onPress={() => router.push("/auth/forgot-password")}
            >
              <Text style={styles.linkText}>Click here</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Login"
            onPress={handleLogin}
            style={styles.loginButton}
            loading={login.isPending}
            disabled={login.isPending}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/signup")}>
              <Text style={styles.linkText}>Signup</Text>
            </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "center",
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
