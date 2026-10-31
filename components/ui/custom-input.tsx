import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

interface CustomInputProps extends TextInputProps {
  label: string;
  containerStyle?: any;
  error?: string;
  leftComponent?: React.ReactNode;
  forceLTR?: boolean;
  rightComponent?: React.ReactNode;
}

export const CustomInput = ({
  label,
  containerStyle,
  secureTextEntry,
  error,
  leftComponent,
  rightComponent,
  forceLTR = false,
  ...props
}: CustomInputProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar" && !forceLTR;
  const isLabelRTL = i18n.language === "ar"; // Label should always respect language direction
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      <ThemedText
        style={[styles.label, { textAlign: isLabelRTL ? "right" : "left" }]}
      >
        {label}
      </ThemedText>
      <View
        style={[
          styles.inputWrapper,
          { flexDirection: forceLTR ? "row" : (isRTL ? "row-reverse" : "row") },
        ]}
      >
        {leftComponent && <View style={styles.leftComponent}>{leftComponent}</View>}
        <TextInput
          style={[
            styles.input,
            { textAlign: forceLTR ? "left" : (isRTL ? "right" : "left") },
            secureTextEntry && {
              paddingRight: isRTL ? 15 : 45,
              paddingLeft: isRTL ? 45 : 15,
            },
            error && styles.inputError,
            leftComponent && {
              flex: 1,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            },
          ]}
          placeholderTextColor={Colors.inputPlaceholder}
          secureTextEntry={isSecure}
          {...props}
        />
        {rightComponent && <View style={styles.rightComponent}>{rightComponent}</View>}
        {secureTextEntry && (
          <Pressable
            onPress={togglePasswordVisibility}
            style={[styles.iconContainer, isRTL ? { left: 10 } : { right: 10 }]}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Colors.text.light}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <ThemedText
          style={[styles.errorText, { textAlign: isLabelRTL ? "right" : "left" }]}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.placeholder,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "stretch",
    borderRadius: 8,
    overflow: "hidden",
  },
  leftComponent: {
    marginRight: 0,
  },
  rightComponent: {
    marginLeft: 0,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 12,
    color: Colors.placeholder,
    height: 50,
    fontFamily: Fonts.AlmaraiRegular,
    flex: 1,
    width: "100%",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.AlmaraiRegular,
  },
  iconContainer: {
    position: "absolute",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
});
