/**
 * Toast Notification Utility
 * Helper functions for showing toast messages
 */

import Toast from "react-native-toast-message";

export interface ToastOptions {
  title?: string;
  message: string;
  duration?: number;
  position?: "top" | "bottom";
}

/**
 * Show success toast
 */
export const showSuccessToast = (options: ToastOptions) => {
  Toast.show({
    type: "success",
    text1: options.title || "Success",
    text2: options.message,
    position: options.position || "top",
    visibilityTime: options.duration || 3000,
  });
};

/**
 * Show error toast
 */
export const showErrorToast = (options: ToastOptions) => {
  Toast.show({
    type: "error",
    text1: options.title || "Error",
    text2: options.message,
    position: options.position || "top",
    visibilityTime: options.duration || 4000,
  });
};

/**
 * Show info toast
 */
export const showInfoToast = (options: ToastOptions) => {
  Toast.show({
    type: "info",
    text1: options.title || "Info",
    text2: options.message,
    position: options.position || "top",
    visibilityTime: options.duration || 3000,
  });
};

/**
 * Show warning toast
 */
export const showWarningToast = (options: ToastOptions) => {
  Toast.show({
    type: "warning",
    text1: options.title || "Warning",
    text2: options.message,
    position: options.position || "top",
    visibilityTime: options.duration || 3000,
  });
};
