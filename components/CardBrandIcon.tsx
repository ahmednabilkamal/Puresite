import React from "react";
import { Image, ImageStyle, StyleSheet } from "react-native";

const CARD_ICONS: Record<string, number> = {
  visa: require("@/assets/icons/cards/visa.png"),
  mastercard: require("@/assets/icons/cards/mastercard.png"),
  mada: require("@/assets/icons/cards/mada.png"),
  amex: require("@/assets/icons/cards/visa.png"), // fallback: no amex.png
  "american-express": require("@/assets/icons/cards/visa.png"),
};

export function getCardBrandKey(brand: string | undefined): string {
  if (!brand) return "visa";
  const b = brand.toLowerCase().replace(/\s+/g, "-");
  return b in CARD_ICONS ? b : "visa";
}

type CardBrandIconProps = {
  brand?: string;
  width?: number;
  height?: number;
  style?: ImageStyle;
};

export default function CardBrandIcon({ brand, width = 36, height = 24, style }: CardBrandIconProps) {
  const key = getCardBrandKey(brand);
  const source = CARD_ICONS[key] ?? CARD_ICONS.visa;
  return (
    <Image
      source={source}
      style={[styles.icon, { width, height }, style]}
      resizeMode="contain"
      accessibilityLabel={brand || "card"}
    />
  );
}

const styles = StyleSheet.create({
  icon: {},
});
