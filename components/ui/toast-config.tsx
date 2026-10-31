import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTranslation } from "react-i18next";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ToastConfigParams } from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const TOAST_HEIGHT = 72;
const TOAST_WIDTH = 340;
const BORDER_RADIUS = 16;
const ICON_SIZE = 28;

type ToastType = "success" | "error" | "info";

const typeConfig = {
  success: {
    icon: "checkmark-circle" as const,
    borderColor: "success",
  },
  error: {
    icon: "close-circle" as const,
    borderColor: "error",
  },
  info: {
    icon: "information-circle" as const,
    borderColor: "primary",
  },
};

function CustomToastView(
  params: ToastConfigParams<object> & { type: ToastType }
) {
  const colors = useThemeColors();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { text1, text2, onPress, type } = params;
  const config = typeConfig[type] ?? typeConfig.info;

  const iconColor =
    config.borderColor === "success"
      ? colors.success
      : config.borderColor === "error"
        ? colors.error
        : colors.primary;

  const direction = isRTL ? "row-reverse" : "row";
  const textAlign = isRTL ? "right" : "left";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.container,
        {
          flexDirection: direction,
          backgroundColor: colors.surface,
          borderColor: iconColor,
          ...(isRTL ? { borderRightWidth: 4, borderLeftWidth: 0 } : { borderLeftWidth: 4, borderRightWidth: 0 }),
          shadowColor: colors.text.primary,
          ...(Platform.OS === "ios"
            ? {
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
              }
            : { elevation: 8 }),
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: `${iconColor}18`,
            marginRight: isRTL ? 0 : 14,
            marginLeft: isRTL ? 14 : 0,
          },
        ]}
      >
        <Ionicons name={config.icon} size={ICON_SIZE} color={iconColor} />
      </View>
      <View style={[styles.content, { alignItems: textAlign === "right" ? "flex-end" : "flex-start" }]}>
        {text1 ? (
          <Text
            style={[styles.text1, { color: colors.text.primary, textAlign }]}
            numberOfLines={1}
          >
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text
            style={[styles.text2, { color: colors.text.secondary, textAlign }]}
            numberOfLines={2}
          >
            {text2}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    minHeight: TOAST_HEIGHT,
    maxWidth: TOAST_WIDTH,
    width: "90%",
    borderRadius: BORDER_RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignSelf: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },
  text1: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  text2: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
});

export const toastConfig = {
  success: (params: ToastConfigParams<object>) => (
    <CustomToastView {...params} type="success" />
  ),
  error: (params: ToastConfigParams<object>) => (
    <CustomToastView {...params} type="error" />
  ),
  info: (params: ToastConfigParams<object>) => (
    <CustomToastView {...params} type="info" />
  ),
};
