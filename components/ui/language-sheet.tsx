import { Colors } from "@/constants/colors";
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

export interface LanguageSheetRef {
  open: () => void;
  close: () => void;
}

interface LanguageSheetProps {
  onSelectLanguage: (lang: "ar" | "en") => void;
}

export const LanguageSheet = forwardRef<LanguageSheetRef, LanguageSheetProps>(
  ({ onSelectLanguage }, ref) => {
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
      (lang: "ar" | "en") => {
        close();
        onSelectLanguage(lang);
      },
      [close, onSelectLanguage]
    );

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: backdropOpacity.value,
    }));

    return (
      <Modal
        transparent
        visible={visible}
        onRequestClose={close}
        animationType="none"
      >
        <Animated.View style={[sheetStyles.backdrop, backdropStyle]}>
          <Pressable style={sheetStyles.flex} onPress={close} />
        </Animated.View>
        <Animated.View
          onLayout={onLayout}
          style={[
            sheetStyles.container,
            { paddingBottom: Math.max(insets.bottom, 20) + 10 },
            { maxHeight: SCREEN_HEIGHT * 0.9 },
            animatedStyle,
          ]}
        >
          <View
            style={[
              sheetStyles.header,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <Text
              style={[
                sheetStyles.title,
                { textAlign: isRTL ? "right" : "left", width: "100%" },
              ]}
            >
              {t("language_and_preferences")}
            </Text>
          </View>

          <View style={sheetStyles.content}>
            <TouchableOpacity
              style={[
                sheetStyles.optionRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={() => handleSelect("ar")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  sheetStyles.optionText,
                  { textAlign: isRTL ? "right" : "left", flex: 1 },
                ]}
              >
                العربية
              </Text>
              {i18n.language === "ar" && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={Colors.primary}
                  style={isRTL ? { marginRight: 8 } : { marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                sheetStyles.optionRow,
                sheetStyles.optionRowLast,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={() => handleSelect("en")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  sheetStyles.optionText,
                  { textAlign: isRTL ? "right" : "left", flex: 1 },
                ]}
              >
                English
              </Text>
              {i18n.language === "en" && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={Colors.primary}
                  style={isRTL ? { marginRight: 8 } : { marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    );
  }
);

LanguageSheet.displayName = "LanguageSheet";

const sheetStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  flex: {
    flex: 1,
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 1001,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.CairoRegular,
    color: Colors.placeholder,
    width: "100%",
  },
  content: {
    gap: 0,
    marginTop: 10,
    paddingBottom: 10,
  },
  optionRow: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    fontFamily: Fonts.CairoMedium,
    color: Colors.text.primary,
  },
});
