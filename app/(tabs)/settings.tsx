import { Button } from "@/components/ui/button";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useLogout, useUser } from "@/hooks/api/use-auth";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SettingsItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBackgroundColor?: string;
  onPress: () => void;
  showChevron?: boolean;
  rightText?: string;
}

interface SettingsSection {
  title?: string;
  items: SettingsItem[];
}

export default function SettingsScreen() {
  const router = useRouter();
  const { data: user } = useUser();
  const logoutMutation = useLogout();
  const logoutBottomSheetRef = useRef<BottomSheetModal>(null);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ["35%"], []);

  // Backdrop component
  const BackDrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logoutBottomSheetRef.current?.dismiss();
      showSuccessToast({
        message: "Logged out successfully",
      });
      // await AsyncStorage.removeItem("saved_email");
      // Small delay to show toast before navigation
      setTimeout(() => {
        router.replace("/auth/login");
      }, 500);
    } catch (error: any) {
      console.error("Logout error:", error);
      showErrorToast({
        message: error?.message || "Failed to logout. Please try again.",
      });
    }
  };

  const handleLogoutPress = () => {
    logoutBottomSheetRef.current?.present();
  };

  const settingsSections: SettingsSection[] = [
    {
      title: "Account",
      items: [
        {
          id: "profile",
          title: "Profile",
          icon: "person-outline",
          iconColor: AppColors.text,
          iconBackgroundColor: AppColors.primary,
          onPress: () => router.push("/profile"),
        },
        {
          id: "notifications",
          title: "Notifications",
          icon: "notifications-outline",
          iconColor: AppColors.text,
          iconBackgroundColor: AppColors.orange,
          onPress: () => router.push("/notifications"),
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          id: "quick-access",
          title: "Quick Access",
          icon: "finger-print-outline",
          iconColor: AppColors.text,
          iconBackgroundColor: AppColors.primary,
          onPress: () => router.push("/enable-quick-access"),
        },
        {
          id: "change-password",
          title: "Change Password",
          icon: "lock-closed-outline",
          iconColor: AppColors.text,
          iconBackgroundColor: AppColors.textSecondary,
          onPress: () => {
            router.push({
              pathname: "/auth/reset-password",
              params: { type: "in-app-change-password" },
            });
          },
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "currency",
          title: "Currency",
          icon: "cash-outline",
          iconColor: AppColors.text,
          iconBackgroundColor: AppColors.green,
          rightText: "NGN",
          onPress: () => {
            // Navigate to currency settings
          },
        },
        {
          id: "language",
          title: "Language",
          icon: "language-outline",
          iconColor: AppColors.text,
          iconBackgroundColor: AppColors.primary,
          rightText: "English",
          onPress: () => {
            // Navigate to language settings
          },
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          title: "Help & Support",
          icon: "help-circle-outline",
          iconColor: AppColors.text,
          iconBackgroundColor: AppColors.primary,
          onPress: () => router.push("/help-support"),
        },
        {
          id: "about",
          title: "About",
          icon: "information-circle-outline",
          iconColor: AppColors.text,
          iconBackgroundColor: AppColors.textSecondary,
          onPress: () => router.push("/about"),
        },
      ],
    },
    {
      items: [
        {
          id: "logout",
          title: "Logout",
          icon: "log-out-outline",
          iconColor: AppColors.red,
          iconBackgroundColor: AppColors.red + "20",
          onPress: handleLogoutPress,
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingsItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                item.iconBackgroundColor || AppColors.primary + "20",
            },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.iconColor || AppColors.text}
          />
        </View>
        <Text style={styles.settingsItemText}>{item.title}</Text>
      </View>
      <View style={styles.settingsItemRight}>
        {item.rightText && (
          <Text style={styles.rightText}>{item.rightText}</Text>
        )}
        {item.showChevron !== false && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={AppColors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <ScreenTitle title="Settings" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info Section */}
        {user && (
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={require("@/assets/images/no-user-img.png")}
                style={styles.avatarContainer}
                contentFit="cover"
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || "User"}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {section.title && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View
                  key={item.id}
                  style={[
                    styles.settingsItemWrapper,
                    itemIndex !== section.items.length - 1 && styles.itemBorder,
                  ]}
                >
                  {renderSettingsItem(item)}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Logout Confirmation Bottom Sheet */}
      <BottomSheetModal
        ref={logoutBottomSheetRef}
        enableOverDrag={false}
        enablePanDownToClose={true}
        handleComponent={null}
        index={0}
        backdropComponent={BackDrop}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Are you sure?</Text>
          <Text style={styles.bottomSheetMessage}>
            Are you sure you want to logout?
          </Text>

          <View style={styles.bottomSheetButtons}>
            <Button
              title="Log out"
              onPress={handleLogout}
              loading={logoutMutation.isPending}
              disabled={logoutMutation.isPending}
              style={styles.logoutButton}
              textStyle={styles.logoutButtonText}
            />

            <Button
              title="Cancel"
              onPress={() => logoutBottomSheetRef.current?.dismiss()}
              variant="outline"
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingsItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.text,
    flex: 1,
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rightText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  settingsItemWrapper: {
    width: "100%",
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border + "30",
  },
  bottomSheetBackground: {
    backgroundColor: AppColors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  bottomSheetMessage: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  bottomSheetButtons: {
    gap: 12,
  },
  logoutButton: {
    backgroundColor: AppColors.red,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: "#FFFFFF",
  },
  cancelButton: {
    borderRadius: 12,
  },
  cancelButtonText: {
    color: AppColors.primary,
  },
});
