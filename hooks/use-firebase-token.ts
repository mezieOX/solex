import messaging from "@react-native-firebase/messaging";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

// Global FCM token storage
let globalFcmToken: string | null = null;

export const getGlobalFcmToken = () => globalFcmToken;
export const setGlobalFcmToken = (token: string | null) => {
  globalFcmToken = token;
};

interface FirebaseTokenHook {
  fcmToken: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to get and manage Firebase Cloud Messaging (FCM) token
 * Currently only logs the token - API integration will be added later
 */
export function useFirebaseToken(): FirebaseTokenHook {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const requestUserPermission = async (): Promise<boolean> => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("✅ Push notification permission granted");
        return true;
      } else {
        console.log("❌ Push notification permission denied");
        return false;
      }
    } catch (err) {
      console.error("Error requesting permission:", err);
      return false;
    }
  };

  useEffect(() => {
    const checkAndGetToken = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const permissionGranted = await requestUserPermission();

        if (permissionGranted) {
          try {
            const token = await messaging().getToken();

            if (token) {
              setFcmToken(token);
              setGlobalFcmToken(token);

              // Log the token (API integration will be added later)
              console.log("📱 FCM Token:", token);
              console.log("📱 Platform:", Platform.OS);
              console.log("📱 Token stored globally:", getGlobalFcmToken());

              // TODO: Send token to API when ready
              // await sendFirebaseTokenToAPI(token);
            } else {
              console.warn("⚠️ No FCM token available");
            }
          } catch (tokenError: any) {
            const errorMsg = tokenError?.message || "Failed to get FCM token";
            console.error("Error getting FCM token:", errorMsg);
            setError(new Error(errorMsg));
          }
        } else {
          console.warn("⚠️ Push notification permission not granted");
          setError(new Error("Push notification permission denied"));
        }
      } catch (err: any) {
        const errorMsg = err?.message || "Failed to initialize FCM";
        console.error("Error initializing FCM:", errorMsg);
        setError(new Error(errorMsg));
      } finally {
        setIsLoading(false);
      }
    };

    checkAndGetToken();

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh((newToken) => {
      console.log("🔄 FCM Token refreshed:", newToken);
      setFcmToken(newToken);
      setGlobalFcmToken(newToken);

      // TODO: Update token in API when ready
      // await updateFirebaseTokenInAPI(newToken);
    });

    return () => {
      unsubscribeTokenRefresh();
    };
  }, []);

  return {
    fcmToken,
    isLoading,
    error,
  };
}
