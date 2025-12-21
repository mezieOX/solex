import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

// Chat Configuration
// Using Tawk.to Direct Chat Link (better for WebView)
const TAWKTO_PROPERTY_ID = "693e325c0981ca197f7a958a";
const TAWKTO_WIDGET_KEY = "1jcdf9el0";
const TAWKTO_CHAT_URL = `https://tawk.to/chat/${TAWKTO_PROPERTY_ID}/${TAWKTO_WIDGET_KEY}`;

export default function ChatScreen() {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = React.useRef<WebView>(null);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Error State or No Property ID Configured */}
      {(hasError || !TAWKTO_PROPERTY_ID) && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="chatbox-ellipses-outline"
            size={64}
            color={AppColors.primary}
            style={styles.errorIcon}
          />
          <Text style={styles.errorTitle}>
            {!TAWKTO_PROPERTY_ID
              ? "Chat Not Configured"
              : "Unable to Load Chat"}
          </Text>
          <Text style={styles.errorMessage}>
            {!TAWKTO_PROPERTY_ID
              ? "Please configure your Tawk.to Property ID to enable live chat support.\n\n1. Sign up at https://www.tawk.to (free)\n2. Get your Property ID from dashboard\n3. Set EXPO_PUBLIC_TAWKTO_PROPERTY_ID in your .env file:\n   EXPO_PUBLIC_TAWKTO_PROPERTY_ID=your_property_id"
              : `Unable to load chat widget.\n\nPlease verify:\n1. Your Property ID: ${TAWKTO_PROPERTY_ID}\n2. Your Widget Key is correct\n3. Check React Native console for errors\n\nTo get your Widget Key:\n- Go to Tawk.to Dashboard\n- Administration > Chat Widget > Installation\n- Copy the Widget Key from the embed code`}
          </Text>
          {TAWKTO_PROPERTY_ID && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setHasError(false);
                setLoading(true);
                webViewRef.current?.reload();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* WebView for Chat */}
      {!hasError && TAWKTO_PROPERTY_ID && (
        <View style={styles.webviewContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: TAWKTO_CHAT_URL }}
            style={styles.webview}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false);
            }}
            onMessage={(event) => {
              // Handle WebView messages if needed
            }}
            onNavigationStateChange={(navState) => {
              // Handle navigation state changes if needed
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            mixedContentMode="always"
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={["*"]}
            allowsBackForwardNavigationGestures={false}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
            // Handle errors
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              setHasError(true);
              setLoading(false);
            }}
            // Handle HTTP errors
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              setHasError(true);
              setLoading(false);
            }}
          />
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: AppColors.background,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.background,
  },
  webviewContainer: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: "#FFFFFF",
  },
  webview: {
    marginTop: Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 40,
    flex: 1,
    width: width,
    maxHeight: height - 10,
    backgroundColor: "#FFFFFF",
  },
});
