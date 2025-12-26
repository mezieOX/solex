import { SkeletonAvatar, SkeletonText } from "@/components/skeleton";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { authKeys, useUser } from "@/hooks/api/use-auth";
import { accountApi } from "@/services/api/account";
import { showErrorToast, showInfoToast, showSuccessToast } from "@/utils/toast";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ClipboardLib from "expo-clipboard";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileField {
  label: string;
  value: string;
  showCopy?: boolean;
  showEdit?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  valueColor?: string;
}

export default function ProfileScreen() {
  const { data: user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profile_image_url || user?.avatar || null
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync profile image with user profile_image_url when user data changes
  useEffect(() => {
    if (user?.profile_image_url) {
      setProfileImage(user.profile_image_url);
    } else if (user?.avatar) {
      setProfileImage(user.avatar);
    }
  }, [user?.profile_image_url, user?.avatar]);

  // Update phone mutation
  const updatePhoneMutation = useMutation({
    mutationFn: (phone: string) => accountApi.updatePhone("+2349071195594"),
    onSuccess: (result) => {
      if (result.status === "success") {
        showSuccessToast({
          message: result.message || "Verification code sent to your email.",
        });
        // Navigate to email verification screen
        router.push({
          pathname: "/auth/email-verification",
          params: {
            phone: user?.phone,
            email: user?.email,
            type: "phone",
          },
        });
      }
    },
    onError: (error: any) => {
      showErrorToast({
        message:
          error?.message ||
          error?.data?.message ||
          "Failed to update phone number. Please try again.",
      });
    },
  });

  // Update profile image mutation
  const updateProfileImageMutation = useMutation({
    mutationFn: (imageUri: string) => accountApi.updateProfileImage(imageUri),
    onSuccess: (result) => {
      if (result.status === "success" && result.data?.profile_image_url) {
        // Update local state with the new image URL
        setProfileImage(result.data.profile_image_url);
        // Invalidate user query to refresh user data
        queryClient.invalidateQueries({ queryKey: authKeys.user() });
        showSuccessToast({
          message: result.message || "Profile image updated successfully",
        });
      }
    },
    onError: (error: any) => {
      showErrorToast({
        message:
          error?.message ||
          error?.data?.message ||
          "Failed to update profile image. Please try again.",
      });
      // Revert to previous image on error
      setProfileImage(user?.profile_image_url || user?.avatar || null);
    },
  });

  // Extract first name from full name
  const firstName = user?.name?.split(" ")[0] || "User";

  // Mask email if too long
  const formatEmail = (email: string) => {
    if (email.length > 20) {
      const [localPart, domain] = email.split("@");
      if (localPart.length > 10) {
        return `${localPart.substring(0, 10)}...@${domain}`;
      }
      return email;
    }
    return email;
  };

  // Format phone number
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "N/A";
    // Add spacing if not already formatted
    if (phone.startsWith("+")) {
      return phone.replace(/(\+234)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    }
    return phone;
  };

  const handleCopy = async (text: string, label: string) => {
    await ClipboardLib.setStringAsync(text);
    setCopiedField(label);
    showSuccessToast({
      message: `${label} copied to clipboard`,
    });
    // Reset the copied indicator after 2 seconds
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleChangeProfilePicture = async () => {
    try {
      // Ask for media library permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showErrorToast({
          message: "Permission to access photos is required to change avatar.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const uri = result.assets[0].uri;
      // Optimistically update the UI
      setProfileImage(uri);

      // Upload to backend
      updateProfileImageMutation.mutate(uri);
    } catch (error: any) {
      showErrorToast({
        message:
          error?.message ||
          "Failed to change profile picture. Please try again.",
      });
    }
  };

  const handleAccountLevelPress = () => {
    showInfoToast({
      title: "Account Level",
      message: "Account level details coming soon",
    });
  };

  const profileFields: ProfileField[] = [
    ...(user?.has_account
      ? [
          {
            label: "Bank Name",
            showCopy: !!user?.va_bank_name,
            value: user?.va_bank_name || "N/A",
            onPress: () => {
              if (user?.va_bank_name) {
                handleCopy(user.va_bank_name, "Bank Name");
              } else {
                // Navigate to virtual account creation screen
                router.push("/virtual-account");
              }
            },
          },
          {
            label: "Account Name",
            showCopy: !!user?.va_account_name,
            value: user?.va_account_name || "N/A",
            onPress: () => {
              if (user?.va_account_name) {
                handleCopy(user.va_account_name, "Account Name");
              } else {
                // Navigate to virtual account creation screen
                router.push("/virtual-account");
              }
            },
          },
          {
            label: "Account Number",
            value: user?.va_account_number || "N/A",
            showCopy: !!user?.va_account_number,
            onPress: () => {
              if (user?.va_account_number) {
                handleCopy(user.va_account_number, "Account Number");
              } else {
                // Navigate to virtual account creation screen
                router.push("/virtual-account");
              }
            },
          },
        ]
      : []),
    ...(!user?.has_account
      ? [
          {
            label: "Create Virtual Account",
            value: "Create",
            showChevron: true,
            valueColor: AppColors.orange,
            onPress: () => {
              router.push("/virtual-account");
            },
          },
        ]
      : []),
    {
      label: "Account Level",
      value: "Lvl 2",
      showChevron: true,
      valueColor: AppColors.orange,
      onPress: handleAccountLevelPress,
    },
    {
      label: "Full Name",
      value: user?.name || "N/A",
    },
    {
      label: "Email",
      value: user?.email ? formatEmail(user.email) : "N/A",
    },
    {
      label: "Gender",
      value: user?.gender || "N/A",
    },
    {
      label: "Date of Birth",
      value: user?.date_of_birth || "N/A",
    },
    {
      label: "Mobile Number",
      value: formatPhoneNumber(user?.phone),
      showEdit: true,
      onPress: () => {
        if (!user?.phone) {
          showErrorToast({
            message: "Phone number is missing",
          });
          return;
        }
        // Call update phone API
        updatePhoneMutation.mutate(user.phone);
      },
    },
    // {
    //   label: "Referral Code",
    //   value: "125386945", // This would come from user data
    //   showCopy: true,
    //   onPress: () => handleCopy("125386945", "Referral Code"),
    // },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <ScreenTitle title="My Profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <>
            {/* Profile Picture Section Skeleton */}
            <View style={styles.profileSection}>
              <SkeletonAvatar
                size={100}
                type="circle"
                style={styles.skeletonAvatar}
              />
              <SkeletonText
                width="40%"
                height={20}
                style={styles.skeletonUserName}
              />
            </View>

            {/* Account Details Section Skeleton */}
            <View style={styles.detailsSection}>
              {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.detailRow,
                    index === 7 && styles.lastDetailRow,
                  ]}
                >
                  <SkeletonText
                    width="30%"
                    height={16}
                    style={styles.skeletonLabel}
                  />
                  <SkeletonText
                    width="50%"
                    height={16}
                    style={styles.skeletonValue}
                  />
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Profile Picture Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Image
                      source={require("@/assets/images/no-user-img.png")}
                      style={styles.profileImage}
                      contentFit="cover"
                    />
                  </View>
                )}
                <View style={styles.profileImageBorder} />
                <TouchableOpacity
                  style={styles.cameraIconContainer}
                  onPress={handleChangeProfilePicture}
                  activeOpacity={0.8}
                  disabled={updateProfileImageMutation.isPending}
                >
                  {updateProfileImageMutation.isPending ? (
                    <ActivityIndicator size="small" color={AppColors.text} />
                  ) : (
                    <Ionicons name="camera" size={20} color={AppColors.text} />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{firstName}</Text>
            </View>

            {/* Account Details Section */}
            <View style={styles.detailsSection}>
              {profileFields.map((field, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.detailRow,
                    index === profileFields.length - 1 && styles.lastDetailRow,
                  ]}
                  onPress={field.onPress}
                  activeOpacity={field.onPress ? 0.7 : 1}
                  disabled={!field.onPress}
                >
                  <Text style={styles.detailLabel}>{field.label}</Text>
                  <View style={styles.detailValueContainer}>
                    <Text
                      style={[
                        styles.detailValue,
                        field.valueColor
                          ? { color: field.valueColor }
                          : undefined,
                      ]}
                    >
                      {field.value}
                    </Text>
                    {field.showCopy && (
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() =>
                          field.value !== "N/A" &&
                          handleCopy(field.value, field.label)
                        }
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={
                            copiedField === field.label
                              ? "checkmark-circle"
                              : "copy-outline"
                          }
                          size={20}
                          color={
                            copiedField === field.label
                              ? AppColors.green
                              : AppColors.text
                          }
                        />
                      </TouchableOpacity>
                    )}
                    {field.showEdit && (
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={field.onPress}
                        activeOpacity={0.7}
                        disabled={
                          field.label === "Mobile Number" &&
                          updatePhoneMutation.isPending
                        }
                      >
                        {field.label === "Mobile Number" &&
                        updatePhoneMutation.isPending ? (
                          <ActivityIndicator
                            size="small"
                            color={AppColors.primary}
                          />
                        ) : (
                          <Feather
                            name="edit"
                            size={20}
                            color={AppColors.text}
                          />
                        )}
                      </TouchableOpacity>
                    )}
                    {field.showChevron && (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={AppColors.textSecondary}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageBorder: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: AppColors.orange,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: AppColors.orange,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: AppColors.text,
  },
  detailsSection: {
    borderRadius: 12,
    paddingBottom: 40,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border + "30",
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    flex: 1,
  },
  detailValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "flex-end",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    textAlign: "right",
  },
  iconButton: {
    padding: 4,
  },
  skeletonAvatar: {
    marginBottom: 12,
  },
  skeletonUserName: {
    marginTop: 0,
    alignSelf: "center",
  },
  skeletonLabel: {
    marginBottom: 0,
  },
  skeletonValue: {
    marginTop: 0,
  },
});
