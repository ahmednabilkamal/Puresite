import { Fonts } from "@/constants/fonts";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { ThemePreference } from "@/store/theme-store";

export interface ThemeSheetRef {
  open: () => void;
  close: () => void;
}

interface ThemeSheetProps {
  currentPreference: ThemePreference;
  onSelectTheme: (preference: ThemePreference) => void;
}

const OPTIONS: { value: ThemePreference; icon: string }[] = [
  { value: "light", icon: "sunny-outline" },
  { value: "dark", icon: "moon-outline" },
  { value: "system", icon: "phone-portrait-outline" },
];

export const ThemeSheet = forwardRef<ThemeSheetRef, ThemeSheetProps>(
  ({ currentPreference, onSelectTheme }, ref) => {
    const colors = useThemeColors();
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { height: SCREEN_HEIGHT } = useWindowDimensions();
    const isRTL = i18n.language === "ar";

    const sheetHeight = useSharedValue(0);
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const backdropOpacity = useSharedValue(0);
    const [visible, setVisible] = useState(false);

    const open = useCallback(() => {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
      setVisible(true);
    }, [translateY, backdropOpacity, SCREEN_HEIGHT]);

    useEffect(() => {
      if (visible) {
        const timer = setTimeout(() => {
          translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 90,
          });
          backdropOpacity.value = withTiming(1);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        translateY.value = SCREEN_HEIGHT;
        backdropOpacity.value = 0;
      }
    }, [visible, translateY, backdropOpacity, SCREEN_HEIGHT]);

    const close = useCallback(() => {
      setVisible(false);
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }, [translateY, backdropOpacity, SCREEN_HEIGHT]);

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    const onLayout = (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      if (height > 0) {
        if (sheetHeight.value === 0) {
          sheetHeight.value = height;
          if (!visible) translateY.value = height;
        } else if (Math.abs(sheetHeight.value - height) > 1) {
          sheetHeight.value = height;
          if (!visible) translateY.value = height;
        }
      }
    };

    const handleSelect = useCallback(
      (preference: ThemePreference) => {
        close();
        onSelectTheme(preference);
      },
      [close, onSelectTheme]
    );

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: backdropOpacity.value,
    }));

    const sheetStyles = StyleSheet.create({
      backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
      },
      sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 20,
        backgroundColor: colors.surface,
      },
      handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        alignSelf: "center",
        marginTop: 12,
        marginBottom: 20,
      },
      title: {
        fontSize: 18,
        fontFamily: Fonts.CairoBold,
        color: colors.text.primary,
        marginBottom: 16,
        textAlign: isRTL ? "right" : "left",
      },
      option: {
        flexDirection: isRTL ? "row-reverse" : "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 4,
      },
      optionText: {
        fontSize: 16,
        fontFamily: Fonts.CairoMedium,
        color: colors.text.primary,
        marginLeft: isRTL ? 0 : 12,
        marginRight: isRTL ? 12 : 0,
      },
      check: {
        marginLeft: isRTL ? 0 : "auto",
        marginRight: isRTL ? "auto" : 0,
      },
    });

    return (
      <Modal
        transparent
        visible={visible}
        onRequestClose={close}
        animationType="none"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close}>
          <Animated.View style={[sheetStyles.backdrop, backdropStyle]} />
        </Pressable>
        <Animated.View
          style={[sheetStyles.sheet, animatedStyle]}
          onLayout={onLayout}
        >
          <Pressable onPress={() => {}}>
            <View style={sheetStyles.handle} />
          </Pressable>
          <Text style={sheetStyles.title}>{t("theme_appearance")}</Text>
          {OPTIONS.map((opt) => {
            const isSelected = currentPreference === opt.value;
            const label =
              opt.value === "light"
                ? t("theme_light")
                : opt.value === "dark"
                  ? t("theme_dark")
                  : t("theme_system");
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  sheetStyles.option,
                  isSelected && { backgroundColor: colors.primary + "20" },
                ]}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={22}
                  color={isSelected ? colors.primary : colors.text.secondary}
                />
                <Text style={sheetStyles.optionText}>{label}</Text>
                {isSelected && (
                  <View style={sheetStyles.check}>
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </Modal>
    );
  }
);

ThemeSheet.displayName = "ThemeSheet";
