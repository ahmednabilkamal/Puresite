import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
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
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { CustomButton } from "./custom-button";
import { CustomDropdown } from "./custom-dropdown";
import { CustomInput } from "./custom-input";

export interface FilterBottomSheetRef {
  open: () => void;
  close: () => void;
}

export const FilterBottomSheet = forwardRef<FilterBottomSheetRef>((_, ref) => {
  const { t, i18n } = useTranslation();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const isRTL = i18n.language === "ar";

  const sheetHeight = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => {
    setVisible(true);
    // Use withDelay or just wait for the next frame to ensure mount
    backdropOpacity.value = withTiming(1);
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });
  }, [translateY, backdropOpacity]);

  const close = useCallback(() => {
    backdropOpacity.value = withTiming(0);
    translateY.value = withSpring(
      sheetHeight.value || SCREEN_HEIGHT,
      {
        damping: 20,
        stiffness: 90,
      },
      (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      }
    );
  }, [translateY, backdropOpacity, sheetHeight, SCREEN_HEIGHT]);

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, context.value.y + event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
        });
      }
    });

  const onLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0 && sheetHeight.value === 0) {
      sheetHeight.value = height;
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

  const opportunityTypes = useMemo(
    () => [
      { label: t("partnership"), value: "partnership" },
      { label: t("acquisition"), value: "acquisition" },
    ],
    [t]
  );

  const projectStatuses = useMemo(
    () => [
      { label: t("completed"), value: "completed" },
      { label: t("in_progress"), value: "in_progress" },
    ],
    [t]
  );

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={close}
      animationType="none"
    >
      <GestureHandlerRootView style={styles.flex}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.flex} onPress={close} />
        </Animated.View>
        <GestureDetector gesture={gesture}>
          <Animated.View
            onLayout={onLayout}
            style={[
              styles.container,
              { maxHeight: SCREEN_HEIGHT * 0.9 },
              animatedStyle,
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.flex}
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
                {t("filter")}
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.content}>
                <CustomInput
                  label={t("city")}
                  placeholder={t("enter_city_name")}
                  containerStyle={styles.input}
                />

                <CustomInput
                  label={t("investment_size")}
                  placeholder={t("select_investment_size")}
                  containerStyle={styles.input}
                />

                <CustomDropdown
                  label={t("opportunity_type")}
                  placeholder={t("select_opportunity_type")}
                  options={opportunityTypes}
                  onSelect={() => {}}
                  containerStyle={styles.dropdown}
                />

                <CustomDropdown
                  label={t("project_status")}
                  placeholder={t("select_project_status")}
                  options={projectStatuses}
                  onSelect={() => {}}
                  containerStyle={styles.dropdown}
                />

                <CustomButton
                  title={t("apply")}
                  onPress={close}
                  style={styles.applyButton}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  </Modal>
);
});

FilterBottomSheet.displayName = "FilterBottomSheet";

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
    // height: "95%",
  },
  flex: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.CairoRegular,
    color: Colors.placeholder,
  },
  content: {
    gap: 15,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  input: {
    marginBottom: 0,
  },
  dropdown: {
    marginBottom: 0,
  },
  applyButton: {
    marginTop: 20,
    backgroundColor: "#67A3B1",
    height: 55,
    borderRadius: 12,
  },
});
