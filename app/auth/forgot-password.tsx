import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { useForgotPassword } from "@/hooks/api/use-auth";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  forgotPasswordSchema,
  formatValidationError,
} from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
  }>({});

  const handleForgotPassword = async () => {
    try {
      // Validate form using Yup
      const formData = {
        email: email.trim(),
      };

      await forgotPasswordSchema.validate(formData, { abortEarly: false });

      // Clear any previous errors
      setErrors({});

      // Submit forgot password request
      const result = await forgotPassword.mutateAsync(formData.email);

      if (result.status === "success") {
        showSuccessToast({
          message: result.message || "Password reset code sent to your email.",
        });
        // Navigate to email verification with email for password reset
        router.push({
          pathname: "/auth/email-verification",
          params: { email: formData.email, type: "reset-password" },
        });
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
        "Failed to send reset code. Please try again.";
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
        <Text style={styles.title}>Password Reset</Text>
        <Text style={styles.subtitle}>
          Please enter your registered email address to reset your password.
        </Text>

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

          <Button
            title="Continue"
            onPress={handleForgotPassword}
            style={styles.button}
            loading={forgotPassword.isPending}
            disabled={forgotPassword.isPending}
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
    marginBottom: 40,
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  button: {
    marginTop: 100,
  },
});
