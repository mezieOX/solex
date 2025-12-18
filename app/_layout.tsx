import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import messaging from "@react-native-firebase/messaging";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

import { toastConfig } from "@/components/ui/toast-config";
import { showInfoToast } from "@/utils/toast";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFirebaseToken } from "@/hooks/use-firebase-token";
import { QueryProvider } from "@/hooks/use-query-client";

// Import background message handler (must be imported to register it)
import "@/utils/firebase-background-message";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { fcmToken, isLoading: isTokenLoading } = useFirebaseToken();
  const [isRemoteMessage, setIsRemoteMessage] = useState<string>("");

  useEffect(() => {
    // Hide the splash screen immediately
    SplashScreen.hideAsync();

    // Configure navigation bar to be black and opaque
    const configureNavigationBar = async () => {
      await NavigationBar.setBackgroundColorAsync("#000000");
      await NavigationBar.setButtonStyleAsync("light");
    };
    configureNavigationBar();
  }, []);

  // Setup push notification handlers
  useEffect(() => {
    // Check if app was opened from a notification (when app was closed)
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "📬 App opened from notification (app was closed):",
            remoteMessage
          );
          setIsRemoteMessage("true");

          // Navigate to notifications screen or handle based on notification data
          // router.replace("/notifications");
        }
      })
      .catch((error) => {
        console.error("Error getting initial notification:", error);
      });

    // Handle notification when app is opened from background
    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        console.log(
          "📬 Notification opened app (app was in background):",
          remoteMessage
        );
        setIsRemoteMessage("true");

        // Navigate to notifications screen or handle based on notification data
        // router.replace("/notifications");
      }
    );

    // Handle foreground messages (when app is open)
    const unsubscribeOnMessage = messaging().onMessage(
      async (remoteMessage) => {
        console.log("📬 Foreground notification received:", remoteMessage);

        if (remoteMessage?.notification) {
          // Show toast for foreground notifications
          showInfoToast({
            title: remoteMessage.notification.title || "New Notification",
            message:
              remoteMessage.notification.body ||
              "You have a new notification",
          });
        }

        // TODO: Refresh notifications list when API is ready
        // You can call your notifications refresh function here
      }
    );

    return () => {
      unsubscribeOnNotificationOpened();
      unsubscribeOnMessage();
    };
  }, [router]);

  return (
    <QueryProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="splash" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="loading" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/signup" />
              <Stack.Screen name="auth/email-verification" />
              <Stack.Screen name="auth/forgot-password" />
              <Stack.Screen name="auth/create-password" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="exchange-crypto" />
              <Stack.Screen name="exchange-giftcard" />
              <Stack.Screen name="enable-quick-access" />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
      <Toast config={toastConfig} />
    </QueryProvider>
  );
}
