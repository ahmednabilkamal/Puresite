import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export interface Car {
  id: string;
  model: string;
  plateNumber: string;
  year?: string;
}

export interface CarSelectionSheetRef {
  open: () => void;
  close: () => void;
}

interface CarSelectionSheetProps {
  cars: Car[];
  selectedCarId?: string;
  onSelectCar: (car: Car) => void;
  onAddNewCar: () => void;
  onDeleteCar?: (carId: string) => void | Promise<void>;
}

export const CarSelectionSheet = forwardRef<
  CarSelectionSheetRef,
  CarSelectionSheetProps
>(({ cars, selectedCarId, onSelectCar, onAddNewCar, onDeleteCar }, ref) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const isRTL = i18n.language === "ar";

  const sheetHeight = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => {
    if (visible) return;
    setVisible(true);
    translateY.value = SCREEN_HEIGHT;
    backdropOpacity.value = 0;

    translateY.value = withSpring(0, {
      damping: 40,
      stiffness: 90,
    });
    backdropOpacity.value = withTiming(1, { duration: 200 });
  }, [translateY, backdropOpacity, visible]);

  const close = useCallback(() => {
    if (!visible) return;
    backdropOpacity.value = withTiming(0, { duration: 200 });
    translateY.value = withSpring(
      sheetHeight.value || SCREEN_HEIGHT,
      {
        damping: 20,
        stiffness: 90,
      }
    );
    // Set visible to false after a short delay to allow animation to start
    setTimeout(() => {
      setVisible(false);
    }, 600);
  }, [translateY, backdropOpacity, sheetHeight, SCREEN_HEIGHT, visible]);

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

  const handleSelectCar = (car: Car) => {
    onSelectCar(car);
    close();
  };

  const handleDeleteCar = (car: Car) => {
    if (!onDeleteCar) return;
    Alert.alert(
      t("delete_car") || "Delete Car",
      t("delete_car_confirm") || "Are you sure you want to delete this car?",
      [
        { text: t("cancel") || "Cancel", style: "cancel" },
        {
          text: t("delete") || "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await onDeleteCar?.(car.id);
              Toast.show({ type: "success", text1: t("success"), text2: t("car_deleted_successfully") || "Car deleted successfully" });
            } catch {
              Toast.show({ type: "error", text1: t("error"), text2: t("failed_to_delete_car") || "Failed to delete car" });
            }
          },
        },
      ]
    );
  };

  const handleClose = useCallback(() => {
    close();
  }, [close]);

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.flex} onPress={handleClose} />
      </Animated.View>
      <GestureDetector gesture={gesture}>
        <Animated.View
          onLayout={onLayout}
          style={[
            styles.container,
            animatedStyle,
            { paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.handle} />

          <View
            style={[
              styles.header,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <Text style={styles.title}>
              {t("select_car")}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color={Colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={cars}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            renderItem={({ item: car }) => (
              <TouchableOpacity
                style={[
                  styles.carItem,
                  selectedCarId === car.id && styles.carItemSelected,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
                onPress={() => handleSelectCar(car)}
              >
                <View style={styles.carItemContent}>
                  <Text
                    style={[
                      styles.carItemModel,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {car.model} {car.year}
                  </Text>
                  <Text
                    style={[
                      styles.carItemPlate,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {car.plateNumber}
                  </Text>
                </View>
                <View style={[styles.carItemActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  {onDeleteCar && (
                    <TouchableOpacity
                      style={styles.carDeleteBtn}
                      onPress={(e) => {
                        e?.stopPropagation?.();
                        handleDeleteCar(car);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                  {selectedCarId === car.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={Colors.primary}
                      style={isRTL ? { marginRight: 12 } : { marginLeft: 12 }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={[
              styles.addCarButton,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
            onPress={() => {
              close();
              onAddNewCar();
            }}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={Colors.primary}
              style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }}
            />
            <Text style={styles.addCarButtonText}>
              {t("add_new_car")}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
});

CarSelectionSheet.displayName = "CarSelectionSheet";

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
    maxHeight: "80%",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  carItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  carItemSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: "#FFF5E6",
  },
  carItemContent: {
    flex: 1,
  },
  carItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  carDeleteBtn: {
    padding: 8,
  },
  carItemModel: {
    fontSize: 16,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  carItemPlate: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
  },
  addCarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
  },
  addCarButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoBold,
    color: Colors.primary,
  },
});
