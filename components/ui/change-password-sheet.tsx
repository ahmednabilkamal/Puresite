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
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { CustomButton } from "./custom-button";
import { CustomInput } from "./custom-input";

export interface ChangePasswordSheetRef {
  open: () => void;
  close: () => void;
}

export const ChangePasswordSheet = forwardRef<ChangePasswordSheetRef>(
  (_, ref) => {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { height: SCREEN_HEIGHT } = useWindowDimensions();
    const isRTL = i18n.language === "ar";

    const sheetHeight = useSharedValue(0);
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const backdropOpacity = useSharedValue(0);
    const [visible, setVisible] = useState(false);

    const open = useCallback(() => {
      console.log("ChangePasswordSheet: open() called");
      // Set initial position off-screen
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
      setVisible(true);
    }, [translateY, backdropOpacity, SCREEN_HEIGHT]);

    // Animate when visible changes
    useEffect(() => {
      if (visible) {
        // Use setTimeout to ensure Modal is fully mounted
        const timer = setTimeout(() => {
          translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 90,
          });
          backdropOpacity.value = withTiming(1);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Reset position when hidden
        translateY.value = SCREEN_HEIGHT;
        backdropOpacity.value = 0;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

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
          // Only set initial position if sheet is not visible
          if (!visible) {
            translateY.value = height;
          }
        } else if (Math.abs(sheetHeight.value - height) > 1) {
          // Content height updated
          sheetHeight.value = height;
          // Only update position if sheet is not visible
          if (!visible) {
            translateY.value = height;
          }
        }
      }
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
      };
    });

    const backdropStyle = useAnimatedStyle(() => {
      return {
        opacity: backdropOpacity.value,
      };
    });

    return (
      <Modal
        transparent
        visible={visible}
        onRequestClose={close}
        animationType="none"
      >
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.flex} onPress={close} />
        </Animated.View>
        <Animated.View
          onLayout={onLayout}
          style={[
            styles.container,
            { paddingBottom: Math.max(insets.bottom, 20) + 10 },
            { maxHeight: SCREEN_HEIGHT * 0.9 },
            animatedStyle,
          ]}
        >
          <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.flex}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <View
                  style={[
                    styles.header,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text
                    style={[
                      styles.title,
                      { textAlign: isRTL ? "right" : "left", width: "100%" },
                    ]}
                  >
                    {t("edit_password")}
                  </Text>
                </View>

                <View style={styles.content}>
                  <CustomInput
                    label={t("new_password")}
                    placeholder={t("enter_password")}
                    containerStyle={styles.input}
                    secureTextEntry
                  />

                  <CustomInput
                    label={t("confirm_password")}
                    placeholder={t("confirm_password_placeholder")}
                    containerStyle={styles.input}
                    secureTextEntry
                  />

                  <View style={styles.buttonWrapper}>
                    <CustomButton
                      title={t("update")}
                      onPress={close}
                      style={styles.updateButton}
                    />
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    );
  }
);

ChangePasswordSheet.displayName = "ChangePasswordSheet";

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
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
    // height: "60%",
  },
  flex: {
    flex: 1,
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
    textAlign: "right",
    width: "100%",
  },
  content: {
    gap: 15,
    marginTop: 10,
  },
  input: {
    marginBottom: 0,
  },
  buttonWrapper: {
    marginTop: 10,
    paddingBottom: 5,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 12,
  },
});
