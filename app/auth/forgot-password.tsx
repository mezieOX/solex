import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useForgotPassword } from "@/hooks/api/use-auth";
import { accountApi } from "@/services/api/account";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  forgotPasswordSchema,
  formatValidationError,
} from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotPassword = useForgotPassword();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});
  // PhoneInput component removes spaces automatically, so phone state is without spaces
  // Display will show spaces (autoFormat), but stored value is without spaces
  // Update phone mutation
  const updatePhoneMutation = useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      accountApi.updatePhone(phone.trim(), code),
  });

  const handleForgotPassword = async () => {
    try {
      // Handle phone update flow
      if (params.type === "phone") {
        const phoneValue = phone.trim();
        const code = (params.code as string) || "";

        if (!phoneValue || phoneValue.length < 10) {
          setErrors({ phone: "Please enter a valid phone number" });
          showErrorToast({
            message: "Please enter a valid phone number",
          });
          return;
        }

        if (!code) {
          showErrorToast({
            message: "Verification code is required",
          });
          return;
        }

        // Clear any previous errors
        setErrors({});

        // Call update phone API with phone and code
        const result = await updatePhoneMutation.mutateAsync({
          phone: phoneValue,
          code,
        });

        if (result.status === "success") {
          showSuccessToast({
            message: result.message || "Phone number updated successfully.",
          });
          // Navigate back to profile
          router.replace("/profile");
        }
        return;
      }

      // Handle password reset flow (existing logic)
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
        (params.type === "phone"
          ? "Failed to send verification code. Please try again."
          : "Failed to send reset code. Please try again.");
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
        <ScreenTitle
          containerStyle={styles.screenTitle}
          title={
            params.type === "phone" ? "Change Phone Number" : "Password Reset"
          }
        />
        <Text style={styles.subtitle}>
          {params.type === "phone"
            ? "Please enter your new phone number here."
            : "Please enter your registered email address to reset your password."}
        </Text>

        <View style={styles.form}>
          {params.type === "phone" ? (
            <PhoneInput
              label="Enter Phone Number"
              onChangeText={(text) => {
                // PhoneInput component already removes spaces in handlePhoneChange
                // text parameter here is already without spaces
                setPhone(text);
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              placeholder="000 000 0000"
              error={errors.phone}
              defaultCountry="NG"
            />
          ) : (
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
          )}

          <Button
            title="Continue"
            onPress={handleForgotPassword}
            style={styles.button}
            loading={
              params.type === "phone"
                ? updatePhoneMutation.isPending
                : forgotPassword.isPending
            }
            disabled={
              params.type === "phone"
                ? updatePhoneMutation.isPending ||
                  !phone.trim() ||
                  phone.trim().length < 10 ||
                  !params.code
                : forgotPassword.isPending || !email.trim()
            }
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
    paddingHorizontal: 20,
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
  screenTitle: {
    paddingHorizontal: 0,
  },
});
