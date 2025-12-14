import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useResetPassword } from "@/hooks/api/use-auth";
import { accountApi } from "@/services/api/account";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  changePasswordSchema,
  formatValidationError,
  resetPasswordSchema,
} from "@/utils/validation";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
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
  const type = (params.type as string) || "";
  const isInAppChangePassword = type === "in-app-change-password";

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Change password mutation (in-app)
  const changePasswordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => accountApi.changePassword(currentPassword, newPassword),
  });

  const handleResetPassword = async () => {
    // Handle in-app password change
    if (isInAppChangePassword) {
      try {
        // Validate form
        if (!currentPassword) {
          setErrors({ currentPassword: "Current password is required" });
          showErrorToast({
            message: "Current password is required",
          });
          return;
        }

        // Validate only password fields for in-app change
        const formData = {
          password,
          confirmPassword,
        };

        await changePasswordSchema.validate(formData, { abortEarly: false });

        // Clear any previous errors
        setErrors({});

        // Submit change password request
        const result = await changePasswordMutation.mutateAsync({
          currentPassword,
          newPassword: password,
        });

        if (result.status === "success") {
          showSuccessToast({
            message: result.message || "Password changed successfully!",
          });
          // Navigate back to settings
          router.back();
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
          "Failed to change password. Please try again.";
        showErrorToast({
          message: errorMessage,
        });
      }
      return;
    }

    // Handle password reset flow (existing logic)
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
        <ScreenTitle
          containerStyle={styles.screenTitle}
          title={isInAppChangePassword ? "Change Password" : "Reset Password"}
        />

        <Text style={styles.requirements}>
          The password must be 8 characters, including 1 uppercase letter, 1
          number and 1 special character.
        </Text>

        <View style={styles.form}>
          {isInAppChangePassword && (
            <Input
              label="Enter your current password"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                if (errors.currentPassword)
                  setErrors({ ...errors, currentPassword: undefined });
              }}
              placeholder="Enter your current password here"
              secureTextEntry={!showCurrentPassword}
              error={errors.currentPassword}
              leftIcon={
                <Image
                  source={require("@/assets/images/lock-01.png")}
                  style={styles.leftIcon}
                  resizeMode="contain"
                />
              }
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather
                    name={showCurrentPassword ? "eye-off" : "eye"}
                    size={20}
                    color={AppColors.textSecondary}
                  />
                </TouchableOpacity>
              }
            />
          )}

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
            title={isInAppChangePassword ? "Change Password" : "Reset Password"}
            onPress={handleResetPassword}
            style={styles.button}
            loading={
              isInAppChangePassword
                ? changePasswordMutation.isPending
                : resetPassword.isPending
            }
            disabled={
              isInAppChangePassword
                ? changePasswordMutation.isPending ||
                  !currentPassword ||
                  !password ||
                  !confirmPassword
                : resetPassword.isPending || !password || !confirmPassword
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
  },
  screenTitle: {
    paddingHorizontal: 0,
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
