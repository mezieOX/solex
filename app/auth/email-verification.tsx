import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import {
  useForgotPassword,
  useResendVerificationCode,
  useVerifyEmail,
} from "@/hooks/api/use-auth";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { emailVerificationSchema } from "@/utils/validation";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EmailVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const verifyEmail = useVerifyEmail();
  const resendCode = useResendVerificationCode();
  const resendResetCode = useForgotPassword(); // For password reset flow
  const [code, setCode] = useState("");
  const email = (params.email as string) || "your email";
  const type = (params.type as string) || "verification"; // "verification" or "reset-password"
  const [resendTimer, setResendTimer] = useState(0); // Timer in seconds
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mask email for display
  const displayEmail =
    email && email !== "your email"
      ? email.length > 20
        ? `${email.substring(0, 10)}...${email.substring(email.indexOf("@"))}`
        : email
      : "your email";

  const handleOTPComplete = (otp: string) => {
    setCode(otp);
  };

  // Timer countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [resendTimer]);

  const handleVerify = async () => {
    // Validate using Yup
    try {
      const formData = {
        email: email as string,
        code,
      };

      // Validate email format
      if (!email || email === "your email") {
        showErrorToast({
          message: "Email address is missing",
        });
        return;
      }

      // Validate form data
      await emailVerificationSchema.validate(formData, { abortEarly: false });

      // Handle reset-password type differently - just pass code to reset screen
      if (type === "reset-password") {
        // For password reset, navigate directly to reset password screen with email and code
        // The reset password API will validate the code
        router.push({
          pathname: "/auth/reset-password",
          params: { email: formData.email, code: formData.code },
        });
        return;
      }

      // For email verification, call the verify API
      const result = await verifyEmail.mutateAsync({
        email: formData.email,
        code: formData.code,
      });

      if (result.status === "success") {
        showSuccessToast({
          message: result.message || "Email verified successfully!",
        });
        // Navigate to create password
        router.replace("/auth/login");
      }
    } catch (error: any) {
      // Handle Yup validation errors
      if (error.name === "ValidationError") {
        const firstError = error.errors?.[0] || error.message;
        showErrorToast({
          message: firstError,
        });
        return;
      }

      // Handle API errors
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Verification failed. Please try again.";
      showErrorToast({
        message: errorMessage,
      });
    }
  };

  const handleResendCode = async () => {
    if (!email || email === "your email") {
      showErrorToast({
        message: "Email address is missing",
      });
      return;
    }

    // Check if timer is still running
    if (resendTimer > 0) {
      return;
    }

    try {
      // Use different API based on type
      const result =
        type === "reset-password"
          ? await resendResetCode.mutateAsync(email as string)
          : await resendCode.mutateAsync(email as string);

      if (result.status === "success") {
        showSuccessToast({
          message: result.message || "Code sent.",
        });
        setCode(""); // Clear the OTP input
        // Start 60 second timer
        setResendTimer(60);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Failed to resend code. Please try again.";
      showErrorToast({
        message: errorMessage,
      });
    }
  };

  // Format timer display (MM:SS)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle
          title={
            type === "reset-password"
              ? "Password Reset Code"
              : "Email Verification"
          }
        />
        <Text style={styles.subtitle}>
          Please enter the code we sent to your email{" "}
          <Text style={styles.emailText}>{displayEmail}</Text>{" "}
          {type === "reset-password"
            ? "to reset your password"
            : "for verification"}
        </Text>

        <View style={styles.iconContainer}>
          <View style={styles.emailIconContainer}>
            <Image
              contentFit="contain"
              source={require("@/assets/images/email.png")}
              style={styles.emailIcon}
            />
          </View>
        </View>

        <OTPInput length={6} onComplete={handleOTPComplete} value={code} />

        <TouchableOpacity
          style={[
            styles.resendContainer,
            ((type === "reset-password"
              ? resendResetCode.isPending
              : resendCode.isPending) ||
              resendTimer > 0) &&
              styles.resendDisabled,
          ]}
          onPress={handleResendCode}
          disabled={
            (type === "reset-password"
              ? resendResetCode.isPending
              : resendCode.isPending) || resendTimer > 0
          }
        >
          <Text style={styles.resendText}>
            I don't receive code?{" "}
            <Text
              style={[
                styles.resendLink,
                ((type === "reset-password"
                  ? resendResetCode.isPending
                  : resendCode.isPending) ||
                  resendTimer > 0) &&
                  styles.resendLinkDisabled,
              ]}
            >
              {type === "reset-password"
                ? resendResetCode.isPending
                : resendCode.isPending
                ? "Sending..."
                : resendTimer > 0
                ? `Resend in ${formatTimer(resendTimer)}`
                : "Resend Code"}
            </Text>
          </Text>
        </TouchableOpacity>

        <Button
          title="Continue"
          onPress={handleVerify}
          style={styles.button}
          loading={type !== "reset-password" && verifyEmail.isPending}
          disabled={
            (type !== "reset-password" && verifyEmail.isPending) ||
            code.length !== 6
          }
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
  emailIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  emailIcon: {
    width: 80,
    height: 80,
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
  resendDisabled: {
    opacity: 0.6,
  },
  resendLinkDisabled: {
    color: AppColors.textSecondary,
  },
  button: {
    marginTop: 20,
  },
});
