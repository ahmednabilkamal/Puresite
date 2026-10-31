import { getServiceImageSource } from "@/constants/api";
import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Service, serviceService } from "@/services/service-service";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ServiceAddonsSkeleton } from "./ServiceAddonsSkeleton";
import styles from "./styles";

export default function ServiceAddonsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRTL = i18n.language === "ar";

  const [services, setServices] = useState<Service[]>([]);
  const [mainService, setMainService] = useState<Service | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const promises: Promise<any>[] = [serviceService.getServices()];

      const serviceId = params.serviceId as string;
      if (serviceId) {
        promises.push(serviceService.getServiceById(serviceId));
      }

      const results = await Promise.all(promises);
      setServices(results[0]);
      if (results[1]) {
        setMainService(results[1]);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      const errorMessage = err.response?.data?.message || t("failed_to_load_services");
      setError(errorMessage);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const finalTotalPrice = (mainService ? parseFloat(mainService.base_price) : 0) +
    services.reduce((sum, service) => {
      return selectedServices.includes(service.id)
        ? sum + parseFloat(service.base_price)
        : sum;
    }, 0);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <ServiceAddonsSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
      {/* Sticky Main Service Header */}
      {mainService && (
        <View style={[styles.stickyHeaderContainer, { backgroundColor: colors.appBackground }]}>
          <View style={[styles.mainServiceCard, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Image
              source={getServiceImageSource(mainService.image_path)}
              style={[styles.mainServiceImage, { backgroundColor: colors.border }]}
              resizeMode="cover"
            />
            <View style={[styles.mainServiceContent, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
              <Text style={[styles.mainServiceTitle, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]} numberOfLines={1}>
                {mainService.name}
              </Text>
              <Text style={[styles.mainServicePrice, { textAlign: isRTL ? "right" : "left", color: colors.primary }]}>
                ${parseFloat(mainService.base_price).toFixed(2)}
              </Text>
              <Text style={[styles.mainServiceDuration, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                {mainService.duration_minutes} {t("minutes")}
              </Text>
            </View>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.primary}
            />
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {error ? (
          <View style={{ padding: 20 }}>
            <Text style={{ textAlign: "center", color: colors.text.secondary }}>
              {error}
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
              {t("available_addons")}
            </Text>

            {/* Services List (Addons) */}
            {services.length === 0 ? (
              <View style={{ padding: 20 }}>
                <Text
                  style={[
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {t("no_services_available")}
                </Text>
              </View>
            ) : (
              services.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <TouchableOpacity
                    key={service.id}
                    activeOpacity={0.8}
                    onPress={() => toggleService(service.id)}
                    style={[
                      styles.addonCard,
                      {
                        backgroundColor: isSelected ? colors.primary + "15" : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        flexDirection: isRTL ? "row-reverse" : "row",
                      },
                    ]}
                  >
                    <Image
                      source={getServiceImageSource(service.image_path)}
                      style={[styles.addonImage, { backgroundColor: colors.border }]}
                      resizeMode="cover"
                    />
                    <View style={[styles.addonContent, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                      <Text
                        style={[
                          styles.addonTitle,
                          { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                        ]}
                      >
                        {service.name}
                      </Text>
                      <View style={[styles.addonPriceRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <Text style={[styles.addonPrice, { color: colors.primary }]}>
                          +${parseFloat(service.base_price).toFixed(2)}
                        </Text>
                        <Text style={[styles.addonDuration, { color: colors.text.secondary }]}>
                          • {service.duration_minutes} {t("minutes")}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      <View style={[
                        styles.toggleButton,
                        { backgroundColor: isSelected ? colors.primary : colors.surface },
                        isSelected && styles.toggleButtonSelected,
                      ]}
                      >
                        <Ionicons
                          name={isSelected ? "checkmark" : "add"}
                          size={18}
                          color={isSelected ? Colors.white : colors.text.primary}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.footerContent,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <View style={[styles.totalContainer, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
            <Text style={[styles.totalLabel, { color: colors.text.primary }]}>{t("total_price")}</Text>
            <Text style={[styles.totalPriceValue, { color: colors.primary }]}>${finalTotalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => router.push({
              pathname: "/booking-date",
              params: {
                carId: params.carId, // Pass carId forward
                serviceId: mainService?.id,
                selectedAddons: JSON.stringify(selectedServices)
              }
            })}
          >
            <Text style={styles.bookButtonText}>{t("book_appointment")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
