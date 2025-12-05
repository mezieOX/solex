import { Button } from "@/components/ui/button";
import { AppColors } from "@/constants/theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function EnableQuickAccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image
            source={require("@/assets/images/fingerprint.png")}
            style={styles.icon}
            contentFit="contain"
          />
        </View>

        <Text style={styles.title}>Enable Quick Access</Text>
        <Text style={styles.subtitle}>
          Enable Face ID or Touch for fast and more secure access to your
          account
        </Text>

        <View style={styles.buttons}>
          <Button
            title="Enable Now"
            onPress={() => router.push("/(tabs)")}
            style={styles.enableButton}
          />
          <Button
            title="Maybe Later"
            onPress={() => router.push("/(tabs)")}
            variant="outline"
            style={styles.laterButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  icon: {
    width: 160,
    height: 160,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
  },
  buttons: {
    marginTop: 120,
    width: "100%",
    gap: 16,
  },
  enableButton: {
    marginBottom: 0,
  },
  laterButton: {
    marginBottom: 0,
  },
});
