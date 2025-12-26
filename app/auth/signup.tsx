import { Button } from "@/components/ui/button";
// import { DateInput } from "@/components/ui/date-input";
import { GenderInput } from "@/components/ui/gender-input";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { AppColors } from "@/constants/theme";
import { useSignup } from "@/hooks/api/use-auth";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { formatValidationError, signupSchema } from "@/utils/validation";
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

export default function SignUpScreen() {
  const router = useRouter();
  const signup = useSignup();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    dateOfBirth?: string;
    gender?: string;
  }>({});

  const handleSignup = async () => {
    try {
      // Validate form using Yup
      const formData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        dateOfBirth,
        gender,
      };

      await signupSchema.validate(formData, { abortEarly: false });

      // Clear any previous errors
      setErrors({});

      // Submit form
      const result = await signup.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth
          ? formData.dateOfBirth.toISOString().split("T")[0]
          : undefined,
        gender: formData.gender || undefined,
      });

      if (result.status === "success") {
        showSuccessToast({
          message: result.message || "Account created successfully!",
        });
        // Navigate to email verification with email
        router.push({
          pathname: "/auth/email-verification",
          params: { email: formData.email },
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
        "Signup failed. Please try again.";
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

        <Text style={styles.title}>Sign Up New Account</Text>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder="Enter your full name"
            error={errors.name}
            autoCapitalize="words"
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <PhoneInput
            label="Phone Number"
            value={phone}
            onChangeText={(text) => {
              // PhoneInput component already removes spaces in handlePhoneChange
              // text parameter here is already without spaces
              setPhone(text);
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            placeholder="000 000 0000"
            error={errors.phone}
            defaultCountry="ng"
          />

          {/* <DateInput
            label="Date of Birth"
            value={dateOfBirth}
            onChange={(date) => {
              setDateOfBirth(date);
              if (errors.dateOfBirth)
                setErrors({ ...errors, dateOfBirth: undefined });
            }}
            placeholder="Select your date of birth"
            error={errors.dateOfBirth}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          /> */}

          <GenderInput
            label="Gender"
            value={gender}
            onChange={(selectedGender) => {
              setGender(selectedGender);
              if (errors.gender) setErrors({ ...errors, gender: undefined });
            }}
            placeholder="Select your gender"
            error={errors.gender}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            error={errors.password}
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

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword)
                setErrors({ ...errors, confirmPassword: undefined });
            }}
            placeholder="Confirm your password"
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={AppColors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          <Button
            title="Continue"
            onPress={handleSignup}
            style={styles.button}
            loading={signup.isPending}
            disabled={signup.isPending}
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
    marginBottom: 60,
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
