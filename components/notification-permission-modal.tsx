import { Button } from "@/components/ui/button";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import messaging from "@react-native-firebase/messaging";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NotificationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onEnable: () => void;
}

export function NotificationPermissionModal({
  visible,
  onClose,
  onEnable,
}: NotificationPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnable = async () => {
    try {
      setIsRequesting(true);
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        onEnable();
      } else {
        // Permission denied, just close
        onClose();
      }
    } catch (error) {
      onClose();
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={AppColors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="notifications"
                size={48}
                color={AppColors.primary}
              />
            </View>
          </View>

          <Text style={styles.title}>Enable Notifications</Text>
          <Text style={styles.description}>
            Stay updated with important alerts, transaction notifications, and
            account updates. You can manage these settings anytime.
          </Text>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={AppColors.primary}
              />
              <Text style={styles.benefitText}>
                Real-time transaction alerts
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={AppColors.primary}
              />
              <Text style={styles.benefitText}>
                Security and account updates
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={AppColors.primary}
              />
              <Text style={styles.benefitText}>
                Promotional offers and news
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Enable Notifications"
              onPress={handleEnable}
              loading={isRequesting}
              disabled={isRequesting}
              style={styles.enableButton}
            />
            <Button
              title="Maybe Later"
              onPress={onClose}
              variant="outline"
              style={styles.laterButton}
              disabled={isRequesting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 4,
    marginBottom: 8,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  benefitsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: AppColors.text,
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  enableButton: {
    marginBottom: 0,
  },
  laterButton: {
    marginTop: 0,
  },
});
