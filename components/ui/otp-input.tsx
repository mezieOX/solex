import { AppColors } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  value?: string;
}

export function OTPInput({
  length = 6,
  onComplete,
  value: controlledValue,
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (controlledValue) {
      const newValues = controlledValue.split("").slice(0, length);
      while (newValues.length < length) {
        newValues.push("");
      }
      setValues(newValues);
    }
  }, [controlledValue, length]);

  const handleChange = (text: string, index: number) => {
    const newValues = [...values];
    newValues[index] = text.slice(-1);
    setValues(newValues);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = newValues.join("");
    if (code.length === length) {
      onComplete(code);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={styles.input}
          value={values[index]}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) =>
            handleKeyPress(nativeEvent.key, index)
          }
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          autoFocus={index === 0}
          cursorColor={AppColors.primary}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  input: {
    width: 50,
    height: 60,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: AppColors.text,
  },
});
