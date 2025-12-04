import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppColors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreatePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create a password</Text>
        <Text style={styles.requirements}>
          The password must be 8 characters, including 1 uppercase letter, 1
          number and 1 special character.
        </Text>

        <View style={styles.form}>
          <Input
            label="Enter password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            leftIcon={
              <Image
                source={require("@/assets/images/lock-01.png")}
                style={styles.leftIcon}
                resizeMode="contain"
              />
            }
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={AppColors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          <Input
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry={!showConfirmPassword}
            leftIcon={
              <Image
                source={require("@/assets/images/lock-01.png")}
                style={styles.leftIcon}
                resizeMode="contain"
              />
            }
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={AppColors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          <Button
            title="Continue"
            onPress={() => router.push("/(tabs)")}
            style={styles.button}
          />
        </View>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  requirements: {
    fontSize: 14,
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  button: {
    marginTop: 60,
  },
  leftIcon: {
    width: 25,
    height: 25,
  },
});
