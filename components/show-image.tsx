import { Image } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

export default function ShowImage({ source }: { source: string }) {
  console.log(source);
  const imagesUrls =
    source === "MTN NIGERIA" || source === "MTN DATA BUNDLE"
      ? require("@/assets/images/mtn.png")
      : source === "GLO NIGERIA" || source === "GLO DATA BUNDLE"
      ? require("@/assets/images/glo.png")
      : source === "AIRTEL NIGERIA" || source === "AIRTEL DATA BUNDLE"
      ? require("@/assets/images/airtel.png")
      : source === "9MOBILE NIGERIA" || source === "9MOBILE DATA BUNDLE"
      ? require("@/assets/images/9mobile.png")
      : source === "STARTIMES"
      ? require("@/assets/images/startimes.png")
      : source === "DSTV" || source === "DSTV BOX OFFICE"
      ? require("@/assets/images/dstv.png")
      : source === "GOTV" || source === "GOTV DATA BUNDLE"
      ? require("@/assets/images/gotv.png")
      : source === "HiTV" || source === "HiTV DATA BUNDLE"
      ? require("@/assets/images/hitv.jpg")
      : source === "MyTV" || source === "MyTV DATA BUNDLE"
      ? require("@/assets/images/mytv.png")
      : source === "DAARSAT Communications"
      ? require("@/assets/images/daarsat.png")
      : source === "DAARSAT Communications"
      ? require("@/assets/images/daarsat.png")
      : source === "DAARSAT Communications"
      ? require("@/assets/images/daarsat.png")
      : source === "DAARSAT Communications"
      ? require("@/assets/images/daarsat.png")
      : source === "DAARSAT Communications"
      ? require("@/assets/images/daarsat.png")
      : null;
  return <Image source={imagesUrls} style={styles.image} contentFit="cover" />;
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});
