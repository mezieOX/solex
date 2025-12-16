import messaging from "@react-native-firebase/messaging";

/**
 * Background message handler for Firebase Cloud Messaging
 * This must be registered at the root level, outside of React components
 *
 * This handler is called when a notification is received while the app is in the background
 * or completely closed.
 */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("📬 Background notification received:", remoteMessage);

  // TODO: Handle background notification
  // You can update local storage, show local notification, etc.

  return Promise.resolve();
});
