import { AppColors } from "@/constants/theme";
import { getBoolean, StorageKeys } from "@/utils/local-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Animated, ImageBackground, StyleSheet, View } from "react-native";

const SplashScreen = () => {
  const router = useRouter();

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background fade in
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Logo animation sequence: scale + fade
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle rotation animation (back and forth)
    const rotationAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    rotationAnimation.start();

    // Text animation with delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate underline expansion
      setTimeout(() => {
        Animated.spring(underlineWidth, {
          toValue: 60,
          tension: 50,
          friction: 7,
          useNativeDriver: false,
        }).start();
      }, 300);
    }, 400);

    // Subtle pulse effect for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    const checkOnboardingAndNavigate = async () => {
      const onboardingCompleted = await getBoolean(
        StorageKeys.ONBOARDING_COMPLETED
      );

      // Navigate after splash screen delay
      setTimeout(() => {
        // Fade out before navigation
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onboardingCompleted) {
            router.replace("/auth/login");
          } else {
            router.replace("/onboarding");
          }
        });
      }, 2500);
    };

    checkOnboardingAndNavigate();

    return () => {
      pulseAnimation.stop();
      rotationAnimation.stop();
    };
  }, [router]);

  const logoRotationInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["-5deg", "5deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View
        style={[
          styles.backgroundContainer,
          {
            opacity: backgroundOpacity,
          },
        ]}
      >
        <ImageBackground
          source={require("@/assets/images/splash-bg.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              "rgba(0, 0, 0, 0.7)",
              "rgba(0, 0, 0, 0.5)",
              "rgba(0, 0, 0, 0.7)",
            ]}
            style={styles.gradientOverlay}
          />
        </ImageBackground>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: Animated.multiply(logoScale, pulseScale) },
                { rotate: logoRotationInterpolate },
              ],
            },
          ]}
        >
          <View style={styles.logoGlow}>
            <Image
              source={require("@/assets/images/app-logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Animated.Text style={styles.text}>Solex Trade</Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoGlow: {
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  logo: {
    width: 90,
    height: 90,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  text: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.text,
    letterSpacing: 1.2,
    textAlign: "center",
  },
});

export default SplashScreen;
