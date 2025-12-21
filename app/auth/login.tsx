import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { useLogin } from "@/hooks/api/use-auth";
import {
  authenticateWithBiometric,
  getBiometricCredentials,
  getBiometricType,
  isBiometricAvailable,
  isBiometricEnabled,
} from "@/utils/biometric";
import { setSecureItem } from "@/utils/secure-storage";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { formatValidationError, loginSchema } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
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
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState("Biometric");

  // Check biometric availability and status
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await isBiometricAvailable();
      const enabled = await isBiometricEnabled();
      const type = await getBiometricType();
      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
      setBiometricType(type);
    };
    checkBiometric();
  }, []);

  // Load saved email only once when screen first opens (before user types anything)
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("saved_email");
        // Only set email if email field is currently empty (initial load only)
        if (savedEmail) {
          setEmail((currentEmail) => {
            // Only set if email is empty (user hasn't typed anything yet)
            return currentEmail || savedEmail;
          });
        }
      } catch (error) {
        // Error loading saved email
      }
    };

    loadSavedEmail();
  }, []); // Empty array ensures this runs only once on mount, not when email changes

  const handleBiometricLogin = async () => {
    try {
      // Authenticate with biometric
      const authenticated = await authenticateWithBiometric();
      if (!authenticated) {
        showErrorToast({
          message: "Biometric authentication failed",
        });
        return;
      }

      // Get saved credentials
      const credentials = await getBiometricCredentials();
      if (!credentials.email || !credentials.password) {
        showErrorToast({
          message: "No saved credentials found. Please login manually first.",
        });
        return;
      }

      // Login with saved credentials
      const result = await login.mutateAsync({
        email: credentials.email,
        password: credentials.password,
      });

      if (result.access_token) {
        showSuccessToast({
          message: "Login successful!",
        });
        await AsyncStorage.setItem("saved_email", credentials.email);
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Biometric login failed. Please try again.";
      showErrorToast({
        message: errorMessage,
      });
    }
  };

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
        email: formData.email || email,
        password: formData.password,
      });

      if (result.access_token) {
        showSuccessToast({
          message: "Login successful!",
        });
        await AsyncStorage.setItem("saved_email", formData.email);
        // Temporarily store password for biometric setup using secure storage
        await setSecureItem("temp_password", formData.password);
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

          {/* Biometric Login Button */}
          {biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={login.isPending}
            >
              <Ionicons
                name={
                  biometricType === "Face ID" ||
                  biometricType === "Face Recognition"
                    ? "scan-outline"
                    : "finger-print-outline"
                }
                size={32}
                color={AppColors.primary}
              />
              <Text style={styles.biometricText}>
                Login with {biometricType}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/signup")}>
              <Text style={styles.linkText}>Signup</Text>
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
  dividerLine: {},
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
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginTop: 16,
    gap: 12,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
});
