import { QuickActions } from "@/components/ui/quick-actions";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useServices } from "@/hooks/api/use-services";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function ServicesScreen() {
  const { services, isLoading } = useServices();

  return (
    <View style={styles.container}>
      <ScreenTitle title="Services" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuickActions actions={services} isLoading={isLoading} numColumns={4} />
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
