import { ThemedText } from "@/components/themed-text";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomInput } from "@/components/ui/custom-input";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Colors } from "@/constants/colors";
import { carService } from "@/services/car-service";
import { CAR_COLORS } from "@/constants/car-colors";
import { storage } from "@/utils/storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import styles from "./styles";

export default function CarDetailsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ carId?: string; carModel?: string; plateNumber?: string }>();
  const isRTL = i18n.language === "ar";

  const carId = typeof params.carId === "string" ? params.carId : Array.isArray(params.carId) ? params.carId[0] : undefined;
  const isEditMode = Boolean(carId);

  const [formData, setFormData] = useState({
    car_model: params.carModel || "",
    plate_number: params.plateNumber || "",
    color: "silver" as string,
    notes: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCar, setIsFetchingCar] = useState(isEditMode);

  useEffect(() => {
    if (!carId) return;
    let cancelled = false;
    (async () => {
      try {
        setIsFetchingCar(true);
        const car = await carService.getCarById(carId);
        if (!cancelled) {
          setFormData({
            car_model: car.car_model || "",
            plate_number: car.plate_number || "",
            color: car.color || "silver",
            notes: car.notes || "",
          });
        }
      } catch {
        if (!cancelled) {
          Toast.show({
            type: "error",
            text1: t("error"),
            text2: t("failed_to_load_service"),
          });
          router.back();
        }
      } finally {
        if (!cancelled) setIsFetchingCar(false);
      }
    })();
    return () => { cancelled = true; };
  }, [carId, t, router]);

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.car_model?.trim()) {
      newErrors.car_model = t("car_model_required");
    }
    if (!formData.plate_number?.trim()) {
      newErrors.plate_number = t("plate_number_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload = {
        car_model: formData.car_model?.trim() ?? "",
        plate_number: formData.plate_number?.trim() ?? "",
        ...(formData.color && { color: formData.color }),
        ...(formData.notes.trim() && { notes: formData.notes.trim() }),
      };

      if (isEditMode && carId) {
        await carService.updateCar(carId, payload);
        Toast.show({
          type: "success",
          text1: t("success"),
          text2: t("car_updated_successfully"),
        });
      } else {
        const newCar = await carService.createCar(payload);
        // Make the newly added car the default selected one
        if (newCar?.id != null) {
          storage.setItem("selected_car_id", String(newCar.id));
        }
        Toast.show({
          type: "success",
          text1: t("success"),
          text2: t("car_added_successfully"),
        });
      }
      router.replace("/(tabs)/home");
    } catch (error: any) {


      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        (isEditMode ? t("failed_to_update_car") : t("failed_to_add_car"));
      const errorDetails = error.response?.data?.errors;

      // Handle validation errors from Laravel
      if (errorDetails) {
        const validationErrors: { [key: string]: string } = {};
        Object.keys(errorDetails).forEach((key) => {
          // Map backend field names to form field names
          const formKey = key === "car_model" ? "car_model" : key === "plate_number" ? "plate_number" : key;
          validationErrors[formKey] = errorDetails[key][0];
        });
        setErrors(validationErrors);
      }

      // Show more detailed error message
      let displayMessage = errorMessage;
      if (error.response?.status === 401) {
        displayMessage = t("unauthorized")
      } else if (error.response?.status === 422) {
        displayMessage = t("validation_error")
      } else if (error.response?.status >= 500) {
        displayMessage = t("server_error")
      }
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: displayMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingCar) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.appBackground }]} edges={[]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.appBackground }]} edges={[]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={{
                position: "absolute",
                left: isRTL ? undefined : 0,
                right: isRTL ? 0 : undefined,
                marginLeft: isRTL ? undefined : 15,
                marginRight: isRTL ? 15 : undefined,
              }}
              onPress={() => router.back()}
            >
              {isRTL ? (
                <MaterialIcons name="arrow-forward-ios" size={24} color={colors.text.primary} />
              ) : (
                <MaterialIcons name="arrow-back-ios" size={24} color={colors.text.primary} />
              )}
            </TouchableOpacity>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          <View style={styles.content}>
            <ThemedText style={[styles.title, { color: colors.text.primary }]}>
              {t("enter_car_details")}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t("enter_car_details_subtitle")}
            </ThemedText>

            <View style={styles.form}>
              <CustomInput
                label={t("car_model")}
                placeholder={t("enter_car_model")}
                value={formData.car_model}
                onChangeText={(val) => updateFormData("car_model", val)}
                error={errors.car_model}
              />
              <View style={[styles.colorSection, { marginBottom: 16 }]}>
                <ThemedText style={[styles.colorLabel, { color: colors.text.secondary }]}>
                  {t("color")}
                </ThemedText>
                <View style={[styles.colorRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  {Object.entries(CAR_COLORS).map(([key, hex]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: hex,
                          borderColor: formData.color === key ? colors.primary : colors.border,
                          borderWidth: formData.color === key ? 3 : 2,
                          marginHorizontal: 4,
                          marginVertical: 4,
                        },
                      ]}
                      onPress={() => setFormData((prev) => ({ ...prev, color: key }))}
                    />
                  ))}
                </View>
              </View>
              <CustomInput
                label={t("plate_number")}
                placeholder={t("plate_number")}
                value={formData.plate_number}
                onChangeText={(val) => updateFormData("plate_number", val)}
                error={errors.plate_number}
              />
              <CustomInput
                label={t("notes")}
                placeholder={t("enter_notes")}
                value={formData.notes}
                onChangeText={(val) => updateFormData("notes", val)}
                error={errors.notes}
                multiline
                numberOfLines={3}
              />

              <CustomButton
                title={isEditMode ? t("update") : t("next")}
                onPress={handleNext}
                style={styles.nextButton}
                isLoading={isLoading}
              />
              {isEditMode && carId && (
                <TouchableOpacity
                  style={[styles.deleteButton, { marginTop: 12 }]}
                  onPress={() => {
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
                              await carService.deleteCar(carId);
                              await storage.removeItem("selected_car_id");
                              Toast.show({ type: "success", text1: t("success"), text2: t("car_deleted_successfully") || "Car deleted successfully" });
                              router.replace("/(tabs)/home");
                            } catch {
                              Toast.show({ type: "error", text1: t("error"), text2: t("failed_to_delete_car") || "Failed to delete car" });
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <ThemedText style={[styles.deleteButtonText, { color: Colors.error }]}>
                    {t("delete_car") || "Delete Car"}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
