import { AppColors } from "@/constants/theme";
import QRCode from "react-native-qrcode-svg";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface QRCodeComponentProps {
  value: string;
  size?: number;
  showLogo?: boolean;
  logoSize?: number;
  containerStyle?: ViewStyle;
  label?: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

export function QRCodeComponent({
  value,
  size = 200,
  showLogo = true,
  logoSize,
  containerStyle,
  label,
  backgroundColor = "#FFFFFF",
  foregroundColor = "#000000",
}: QRCodeComponentProps) {
  const calculatedLogoSize = logoSize || Math.max(size * 0.2, 40);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.qrCodeContainer,
          {
            width: size + 32,
            height: size + 32,
            backgroundColor,
            borderRadius: 12,
            padding: 16,
          },
          containerStyle,
        ]}
      >
        <QRCode
          value={value}
          size={size}
          color={foregroundColor}
          backgroundColor={backgroundColor}
          logo={showLogo ? require("@/assets/images/app-logo.png") : undefined}
          logoSize={showLogo ? calculatedLogoSize : undefined}
          logoBackgroundColor={backgroundColor}
          logoMargin={showLogo ? 4 : undefined}
          logoBorderRadius={showLogo ? calculatedLogoSize / 2 : undefined}
          quietZone={8}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginBottom: 8,
    textAlign: "center",
  },
  qrCodeContainer: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

