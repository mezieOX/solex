import { Button } from "@/components/ui/button";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { AppColors } from "@/constants/theme";
import { getBoolean, setBoolean, StorageKeys } from "@/utils/local-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";

const AUTO_SCROLL_INTERVAL = 6000; // 4 seconds

const onboardingData = [
  {
    title: "You're in Control",
    subtitle: "Powering Fast, Smart & Secure Giftcard and Crypto Exchange",
  },
  {
    title: "Intelligent Trading",
    subtitle: "Exchange Giftcards & Crypto Seamlessly Anytime, Anywhere",
  },
  {
    title: "Innovation Meets Security",
    subtitle: "Smart, Fast & Secure Giftcard and Crypto Exchange",
  },
  {
    title: "Unlock Your Edge",
    subtitle:
      "Elevate Your Trading Experience, Effortless Digital Asset Trading",
  },
];

const { width } = Dimensions.get("window");
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Additional animation values
  const backgroundScale = useRef(new Animated.Value(1)).current;
  const titleScale = useRef(new Animated.Value(1)).current;
  const subtitleScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const dotWidths = useRef(
    onboardingData.map(() => new Animated.Value(24))
  ).current;

  // Check if onboarding was already completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const onboardingCompleted = await getBoolean(
        StorageKeys.ONBOARDING_COMPLETED
      );
      if (onboardingCompleted) {
        // User has already seen onboarding, redirect to login
        router.replace("/auth/login");
      }
    };
    checkOnboardingStatus();
  }, [router]);

  // Initial mount animation
  useEffect(() => {
    // Animate background scale
    Animated.timing(backgroundScale, {
      toValue: 1.1,
      duration: 10000,
      useNativeDriver: true,
    }).start();

    // Animate content entrance
    titleScale.setValue(0.8);
    subtitleScale.setValue(0.8);
    buttonScale.setValue(0.9);

    Animated.parallel([
      Animated.spring(titleScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(subtitleScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate dots when currentIndex changes
  useEffect(() => {
    dotWidths.forEach((dotWidth, index) => {
      Animated.spring(dotWidth, {
        toValue: index === currentIndex ? 30 : 24,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }).start();
    });
  }, [currentIndex]);

  // Auto-scroll functionality
  useEffect(() => {
    autoScrollTimer.current = setInterval(() => {
      if (currentIndex < onboardingData.length - 1) {
        goToNext();
      } else {
        // Reset to first slide or navigate to login
        goToSlide(0);
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [currentIndex]);

  const animateTransition = (toIndex: number, direction: "next" | "prev") => {
    // Fade out and slide with scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === "next" ? -50 : 50,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(titleScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(toIndex);
      // Reset and fade in with scale bounce
      slideAnim.setValue(direction === "next" ? 50 : -50);
      titleScale.setValue(0.8);
      subtitleScale.setValue(0.8);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: 50,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const goToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      animateTransition(currentIndex + 1, "next");
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      animateTransition(currentIndex - 1, "prev");
    }
  };

  const goToSlide = (index: number) => {
    if (index !== currentIndex && index >= 0 && index < onboardingData.length) {
      const direction = index > currentIndex ? "next" : "prev";
      animateTransition(index, direction);
    }
  };

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond if horizontal movement is significant
        return (
          Math.abs(gestureState.dx) > 10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderGrant: () => {
        // Pause auto-scroll when user starts swiping
        if (autoScrollTimer.current) {
          clearInterval(autoScrollTimer.current);
          autoScrollTimer.current = null;
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;
        const SWIPE_THRESHOLD = 50;
        const VELOCITY_THRESHOLD = 0.5;

        // Check if swipe is significant enough
        if (
          Math.abs(dx) > SWIPE_THRESHOLD ||
          Math.abs(vx) > VELOCITY_THRESHOLD
        ) {
          if (dx > 0 || vx > 0) {
            // Swipe right - go to previous
            goToPrev();
          } else {
            // Swipe left - go to next
            goToNext();
          }
        }

        // Restart auto-scroll after a delay
        setTimeout(() => {
          if (!autoScrollTimer.current) {
            autoScrollTimer.current = setInterval(() => {
              if (currentIndex < onboardingData.length - 1) {
                goToNext();
              } else {
                goToSlide(0);
              }
            }, AUTO_SCROLL_INTERVAL);
          }
        }, 2000);
      },
      onPanResponderTerminate: () => {
        // Restart auto-scroll if gesture is terminated
        if (!autoScrollTimer.current) {
          autoScrollTimer.current = setInterval(() => {
            if (currentIndex < onboardingData.length - 1) {
              goToNext();
            } else {
              goToSlide(0);
            }
          }, AUTO_SCROLL_INTERVAL);
        }
      },
    })
  ).current;

  const handleNext = async () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentIndex < onboardingData.length - 1) {
      goToNext();
    } else {
      // Mark onboarding as completed
      await setBoolean(StorageKeys.ONBOARDING_COMPLETED, true);
      router.replace("/auth/login");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.swipeContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.backgroundImageContainer,
            {
              transform: [{ scale: backgroundScale }],
            },
          ]}
        >
          <Image
            source={require("@/assets/images/onboarding-3d-background.png")}
            style={styles.backgroundImage}
            contentFit="fill"
          />
        </Animated.View>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.animatedContent,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.title,
                {
                  transform: [{ scale: titleScale }],
                },
              ]}
            >
              {onboardingData[currentIndex].title}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.subtitle,
                {
                  transform: [{ scale: subtitleScale }],
                },
              ]}
            >
              {onboardingData[currentIndex].subtitle}
            </Animated.Text>
          </Animated.View>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.activeDot,
                  {
                    width: dotWidths[index],
                  },
                ]}
              />
            ))}
          </View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <Button
              title={
                currentIndex === onboardingData.length - 1
                  ? "Get Started"
                  : "Next"
              }
              onPress={handleNext}
              style={styles.button}
            />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  swipeContainer: {
    flex: 1,
    width: "100%",
  },
  backgroundImageContainer: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    height: "60%",
    width: "100%",
    overflow: "hidden",
  },
  backgroundImage: {
    width: width * 1,
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  animatedContent: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 6,
    alignItems: "center",
  },
  dot: {
    height: 3,
    backgroundColor: "gray",
    borderRadius: 2,
  },
  activeDot: {
    backgroundColor: AppColors.primary,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 12,
    marginBottom: 24,
  },
  button: {
    width: "100%",
  },
});
