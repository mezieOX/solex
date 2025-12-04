import { AppColors } from "@/constants/theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Animated, ImageBackground, StyleSheet } from "react-native";

const SplashScreen = () => {
  const router = useRouter();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const textDelay = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 1000);

    const navigationTimeout = setTimeout(() => {
      router.replace("/onboarding");
    }, 3000);

    return () => {
      clearTimeout(textDelay);
      clearTimeout(navigationTimeout);
    };
  }, [fadeAnim, router]);

  return (
    <ImageBackground
      source={require("@/assets/images/splash-bg.png")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <Image
        source={require("@/assets/images/app-logo.png")}
        style={styles.logo}
        contentFit="contain"
      />
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        Solex Trade
      </Animated.Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: "500",
    color: AppColors.text,
    marginTop: 16,
  },
});

export default SplashScreen;
