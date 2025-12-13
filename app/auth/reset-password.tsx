import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { useResetPassword } from "@/hooks/api/use-auth";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { formatValidationError, resetPasswordSchema } from "@/utils/validation";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const resetPassword = useResetPassword();
  const email = (params.email as string) || "";
  const code = (params.code as string) || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleResetPassword = async () => {
    // Validate email and code are present
    if (!email || !code) {
      showErrorToast({
        message: "Email or reset code is missing. Please try again.",
      });
      return;
    }

    try {
      // Validate form using Yup
      const formData = {
        email: email.trim(),
        code: code.trim(),
        password,
        confirmPassword,
      };

      await resetPasswordSchema.validate(formData, { abortEarly: false });

      // Clear any previous errors
      setErrors({});

      // Submit reset password request
      // API expects: { email, code, password }
      const result = await resetPassword.mutateAsync({
        email: formData.email,
        code: formData.code,
        password: formData.password,
      });

      if (result.status === "success") {
        showSuccessToast({
          message: result.message || "Password reset successfully!",
        });
        // Navigate to login screen
        router.replace("/auth/login");
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
        "Failed to reset password. Please try again.";
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
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.requirements}>
          The password must be 8 characters, including 1 uppercase letter, 1
          number and 1 special character.
        </Text>

        <View style={styles.form}>
          <Input
            label="Enter new password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            placeholder="Enter your new password"
            secureTextEntry={!showPassword}
            error={errors.password}
            leftIcon={
              <Image
                source={require("@/assets/images/lock-01.png")}
                style={styles.leftIcon}
                resizeMode="contain"
              />
            }
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={AppColors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          <Input
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword)
                setErrors({ ...errors, confirmPassword: undefined });
            }}
            placeholder="Confirm your new password"
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword}
            leftIcon={
              <Image
                source={require("@/assets/images/lock-01.png")}
                style={styles.leftIcon}
                resizeMode="contain"
              />
            }
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={AppColors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            style={styles.button}
            loading={resetPassword.isPending}
            disabled={resetPassword.isPending}
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
    paddingTop: 70,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  requirements: {
    fontSize: 14,
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  button: {
    marginTop: 60,
  },
  leftIcon: {
    width: 25,
    height: 25,
  },
});
