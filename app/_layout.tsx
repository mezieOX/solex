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

import { NotificationPermissionModal } from "@/components/notification-permission-modal";
import { toastConfig } from "@/components/ui/toast-config";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFirebaseToken } from "@/hooks/use-firebase-token";
import { QueryProvider } from "@/hooks/use-query-client";
import { getBoolean, setBoolean, StorageKeys } from "@/utils/local-storage";
import { showInfoToast } from "@/utils/toast";

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
  const [showNotificationModal, setShowNotificationModal] = useState(false);

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

  // Check notification permission on app start
  useEffect(() => {
    const checkNotificationPermission = async () => {
      try {
        // Check if user has already dismissed the modal
        const hasDismissed = await getBoolean(
          StorageKeys.NOTIFICATION_PERMISSION_DISMISSED
        );

        if (hasDismissed) {
          return; // Don't show modal if user dismissed it before
        }

        // Check if we have a token - if we do, notifications are enabled
        // If no token and not loading, show the modal
        if (!fcmToken && !isTokenLoading) {
          // Small delay to ensure app is fully loaded
          setTimeout(() => {
            setShowNotificationModal(true);
          }, 1500);
        }
      } catch (error) {
        // Error checking notification permission
      }
    };

    // Only check after token loading is complete
    if (!isTokenLoading) {
      checkNotificationPermission();
    }
  }, [isTokenLoading, fcmToken]);

  const handleNotificationModalClose = async () => {
    setShowNotificationModal(false);
    // Mark as dismissed so we don't show it again
    await setBoolean(StorageKeys.NOTIFICATION_PERMISSION_DISMISSED, true);
  };

  const handleNotificationEnabled = async () => {
    setShowNotificationModal(false);
    // Don't mark as dismissed if user enabled it
    // This way if they disable it later, we can show the modal again
  };

  // Setup push notification handlers
  useEffect(() => {
    // Check if app was opened from a notification (when app was closed)
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          setIsRemoteMessage("true");

          // Navigate to notifications screen or handle based on notification data
          // router.replace("/notifications");
        }
      })
      .catch((error) => {
        // Error getting initial notification
      });

    // Handle notification when app is opened from background
    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        setIsRemoteMessage("true");

        // Navigate to notifications screen or handle based on notification data
        // router.replace("/notifications");
      }
    );

    // Handle foreground messages (when app is open)
    const unsubscribeOnMessage = messaging().onMessage(
      async (remoteMessage) => {
        if (remoteMessage?.notification) {
          // Show toast for foreground notifications
          showInfoToast({
            title: remoteMessage.notification.title || "New Notification",
            message:
              remoteMessage.notification.body || "You have a new notification",
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
      <NotificationPermissionModal
        visible={showNotificationModal}
        onClose={handleNotificationModalClose}
        onEnable={handleNotificationEnabled}
      />
    </QueryProvider>
  );
}
