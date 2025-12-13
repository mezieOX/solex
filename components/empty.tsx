import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

export default function Empty({
  title,
  description,
  style,
}: {
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require("@/assets/images/empty.png")}
        style={styles.image}
        contentFit="contain"
      />
      <Text style={styles.text}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 10,
    alignItems: "center",
  },
  image: {
    width: 600,
    height: 100,
  },
  text: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 10,
    marginTop: 20,
  },
  description: {
    color: Colors.dark.text,
  },
});
