import { Colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ThemedText } from "../themed-text";

interface PhoneCountryCodeProps {
  code: string;
  flag?: string;
}

export const PhoneCountryCode = ({ code, flag = "🇸🇦" }: PhoneCountryCodeProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.flag}>{flag}</Text>
      <ThemedText style={styles.code}>+{code}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 1,
    borderRightColor: Colors.white,
    height: 50,
  },
  flag: {
    fontSize: 20,
    marginRight: 6,
  },
  code: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.primary,
  },
});
