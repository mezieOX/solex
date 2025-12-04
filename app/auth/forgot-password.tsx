import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

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

          <Button
            title="Continue"
            onPress={() => router.push("/auth/email-verification")}
            style={styles.button}
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
