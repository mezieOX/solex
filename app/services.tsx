import {
  ActivityIcon,
  BulbChargingIcon,
  DataIcon,
  ElementsIcon,
  Group47196Icon,
  Icon4,
  InternetIcon,
  MobilepayIcon,
  SquareTopUpIcon,
  TvIcon,
} from "@/components/ui/icons";
import { QuickActions } from "@/components/ui/quick-actions";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function ServicesScreen() {
  const allServices = [
    {
      title: "Top Up",
      customIcon: <SquareTopUpIcon size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Transfer",
      customIcon: <ElementsIcon size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Pay Bills",
      customIcon: <MobilepayIcon size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Trade",
      customIcon: <ActivityIcon size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Data",
      customIcon: <DataIcon size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Internet",
      customIcon: <InternetIcon size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "CableTV",
      customIcon: <TvIcon size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Education",
      customIcon: <Group47196Icon size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Electricity",
      customIcon: <BulbChargingIcon size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Flight",
      customIcon: <Ionicons name="airplane" size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Insurance",
      customIcon: <Icon4 size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Giftcard",
      customIcon: <Ionicons name="gift" size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Airtime",
      customIcon: <Ionicons name="call" size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
    {
      title: "Gift Friends",
      customIcon: <Ionicons name="heart" size={28} color="#fff" />,
      iconBackgroundColor: AppColors.redAccent,
      onPress: () => {},
    },
  ];

  // Split services into rows of 4
  const serviceRows = [];
  for (let i = 0; i < allServices.length; i += 4) {
    serviceRows.push(allServices.slice(i, i + 4));
  }

  return (
    <View style={styles.container}>
      <ScreenTitle title="Services" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuickActions actions={allServices} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 0,
  },
});
