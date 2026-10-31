import Saudi_riyal from "@/components/saudi_riyal";
import { getServiceImageSource } from "@/constants/api";
import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Service, serviceService } from "@/services/service-service";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ServiceDetailsSkeleton } from "./ServiceDetailsSkeleton";
import styles from "./styles";
import { Fonts } from "@/constants/fonts";

export default function ServiceDetailsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRTL = i18n.language === "ar";
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vipEnabled, setVipEnabled] = useState(false);
  const [selectedCarSize, setSelectedCarSize] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);

  useEffect(() => {
    const serviceId = params.serviceId as string;
    if (serviceId) {
      fetchService(serviceId);
    } else {
      setError(t("service_id_required"));
      setIsLoading(false);
    }
  }, [params.serviceId, t]);

  const fetchService = async (serviceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setImageError(false);
      const fetchedService = await serviceService.getServiceById(serviceId);
      setService(fetchedService);
      const sizes = fetchedService.car_sizes ?? [];
      setSelectedCarSize(sizes.length > 0 ? sizes[0] : null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t("failed_to_load_service");
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <ServiceDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("service_details")}</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ textAlign: "center", color: colors.text.secondary }}>
            {error || t("service_not_found")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const carSizes = service.car_sizes ?? [];
  const isCarSizeRequired = carSizes.length > 0;
  const hasSizePricing = service.has_size_pricing && service.prices_by_size;
  const basePrice = hasSizePricing && selectedCarSize && service.prices_by_size?.[selectedCarSize] != null
    ? parseFloat(String(service.prices_by_size[selectedCarSize]))
    : parseFloat(service.base_price || "0");
  const fastTrackPrice = service.fast_track_price != null ? parseFloat(String(service.fast_track_price)) : 0;
  const totalPrice = basePrice + (vipEnabled ? fastTrackPrice : 0);

  const getCarSizeLabel = (size: string) => {
    const key = `car_size_${size}` as "car_size_small" | "car_size_medium" | "car_size_large";
    return t(key);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          {isRTL ? (
            <MaterialIcons name="arrow-forward-ios" size={24} color={colors.text.primary} />
          ) : (
            <MaterialIcons name="arrow-back-ios" size={24} color={colors.text.primary} />
          )}
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { flex: 1, color: colors.text.primary }]}>{service?.name}</Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.appBackground }]}
      >
        {/* Service Image */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image
            source={
              service?.image_path && !imageError
                ? getServiceImageSource(service.image_path)
                : require("@/assets/images/no_image_default.jpeg")
            }
            style={styles.serviceImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>

        {/* Service Title */}
        <Text
          style={[
            styles.serviceTitle,
            { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
          ]}
        >
          {service.name}
        </Text>

        {/* Duration and Price */}
        <View
          style={[
            styles.metaContainer,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <View
            style={[
              styles.metaItem,
              {
                flexDirection: isRTL ? "row-reverse" : "row",
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Text style={[styles.priceText, { color: colors.text.primary }]}> {basePrice.toFixed(2)} </Text>
            <View style={isRTL ? { marginLeft: 6 } : { marginRight: 6 }}>
              <Saudi_riyal width={16} height={16} color={colors.text.primary} />
            </View>
          </View>

          <View
            style={[
              styles.metaItem,
              {
                flexDirection: isRTL ? "row-reverse" : "row",
                marginRight: isRTL ? 10 : 0,
                marginLeft: isRTL ? 0 : 10,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={colors.primary}
              style={isRTL ? { marginLeft: 6 } : { marginRight: 6 }}
            />
            <Text style={[styles.metaText, { color: colors.text.primary }]}>
              {service.duration_minutes} {t("minutes")}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text
          style={[
            styles.description,
            { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
          ]}
        >
          {service.description}
        </Text>


        {/* VIP Fast Track Option - only when service has fast_track_price */}
        {(service.fast_track_price != null && fastTrackPrice > 0) && (
        <View style={[styles.vipCard, { backgroundColor: colors.serviceBg ?? colors.primary + "15", borderColor: colors.primary + "40" }]}>
          <View
            style={[
              styles.vipContent,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <View style={[styles.diamondContainer,
            { marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0, backgroundColor: colors.primary + "20" }]}>
              <Image source={require("@/assets/icons/diamond.png")}
                style={{ width: 22, height: 22 }} resizeMode="contain" />
            </View>

            <View style={styles.vipTextContainer}>
              <Text
                style={[
                  styles.vipTitle,
                  { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                ]}
              >
                {t("vip_fast_track")}
              </Text>
              <View
                style={[
                  styles.vipSubtitleContainer,
                  { flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", flexWrap: "wrap" },
                ]}
              >
                <Text style={[styles.vipSubtitle, { color: colors.text.primary }]}>
                  {t("skip_queue")} +{fastTrackPrice > 0 ? fastTrackPrice.toFixed(2) : "0"}{" "}
                </Text>
                {fastTrackPrice > 0 && <View style={{ marginHorizontal: 2 }}><Saudi_riyal width={14} height={14} color={colors.text.primary} /></View>}
                <Text style={[styles.vipSubtitle, { color: colors.text.primary }]}></Text>
              </View>
            </View>
            <Switch
              value={vipEnabled}
              onValueChange={setVipEnabled}
              trackColor={{
                false: colors.border,
                true: colors.primary,
              }}
              thumbColor={colors.surface}
              ios_backgroundColor={colors.border}
              style={{
                marginTop: 10
              }}
            />
          </View>
        </View>
        )}

        {/* Car Size Selection - mandatory when car_sizes provided */}
        {carSizes.length > 0 && (
          <View style={styles.carSizeSection}>
            <Text
              style={[
                styles.sectionTitle,
                { textAlign: isRTL ? "right" : "left", marginBottom: 12, color: colors.text.primary },
              ]}
            >
              {t("select_your_car_size")}
            </Text>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap" }}>
              {carSizes.map((size) => {
                const isSelected = selectedCarSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.carSizeChip,
                      {
                        backgroundColor: isSelected ? colors.primary + "20" : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCarSize(size)}
                  >
                    <Text
                      style={[
                        styles.carSizeChipText,
                        {
                          color: isSelected ? colors.primary : colors.text.primary,
                          fontFamily: isSelected ? Fonts.CairoSemiBold : Fonts.CairoMedium,
                        },
                      ]}
                    >
                      {getCarSizeLabel(size)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Service Addons */}
        {/* {service.addons && service.addons.length > 0 && (
          <>

            <View style={styles.inclusionsList}>
              {service.addons.map((addon: Addon) => (
                <TouchableOpacity
                  key={addon.id}
                  style={[
                    styles.inclusionItem,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/addon-details",
                      params: {
                        addonId: addon.id,
                        addonName: addon.name,
                        addonDescription: addon.description || "",
                        addonPrice: addon.price,
                        addonDuration: addon.duration_delta_minutes.toString(),
                      },
                    })
                  }
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={Colors.primary}
                    style={isRTL ? { marginLeft: 12 } : { marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.inclusionText,
                        { textAlign: isRTL ? "right" : "left" },
                      ]}
                    >
                      {addon.name}
                    </Text>
                    {addon.description && (
                      <Text
                        style={[
                          {
                            fontSize: 12,
                            color: Colors.text.secondary,
                            marginTop: 4,
                            textAlign: isRTL ? "right" : "left",
                          },
                        ]}
                      >
                        {addon.description}
                      </Text>
                    )}
                    <Text
                      style={[
                        {
                          fontSize: 14,
                          color: Colors.primary,
                          marginTop: 4,
                          fontFamily: "Cairo-Bold",
                          textAlign: isRTL ? "right" : "left",
                        },
                      ]}
                    >
                      ${parseFloat(addon.price).toFixed(2)}
                    </Text>
                  </View>
                  <Ionicons
                    name={isRTL ? "chevron-back" : "chevron-forward"}
                    size={20}
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )} */}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View
          style={[
            styles.footerContent,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <View>
            <Text
              style={[
                styles.totalPriceLabel,
                { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
              ]}
            >
              {t("total_price")}
            </Text>
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center" }}>
              <Text style={[styles.totalPriceValue, {
                textAlign: isRTL ? "right" : "left",
                marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0,
                color: colors.text.primary
              }]}>
                {totalPrice.toFixed(2)}
              </Text>
              <Saudi_riyal width={20} height={20} color={colors.text.primary} />
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.bookButton,
              isRTL ? { marginRight: 32 } : { marginLeft: 32 },
            ]}
            onPress={() => {
              if (isCarSizeRequired && !selectedCarSize) {
                Toast.show({
                  type: "error",
                  text1: t("error"),
                  text2: t("select_car_size"),
                });
                return;
              }
              router.push({
                pathname: "/addon-details",
                params: {
                  serviceId: service.id,
                  carId: params.carId,
                  selectedCarSize: selectedCarSize ?? undefined,
                  vipFastTrack: vipEnabled ? "1" : "0",
                },
              });
            }}
          >
            <Text style={styles.bookButtonText}>
              {t("book_appointment")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showBookingConfirmation && (
        <View style={styles.bookingOverlay}>
          <View style={[styles.bookingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.bookingIconWrapper}>
              <View style={[styles.bookingIconCircleOuter, { backgroundColor: Colors.statusCompletedBg }]}>
                <View style={[styles.bookingIconCircleInner, { backgroundColor: Colors.statusCompleted }]}>
                  <Image source={require("@/assets/images/success_booking.png")}
                    style={{ width: 100, height: 100 }} resizeMode="contain" />
                </View>
              </View>
            </View>
            <Text
              style={[
                styles.bookingTitle,
                { textAlign: "center", color: colors.text.primary },
              ]}
            >
              {t("booking_confirmed_title")}
            </Text>
            <Text
              style={[
                styles.bookingSubtitle,
                { textAlign: "center", color: colors.text.secondary },
              ]}
            >
              {t("booking_confirmed_message")}
            </Text>
            <TouchableOpacity
              style={styles.bookingActionButton}
              onPress={() => {
                setShowBookingConfirmation(false);
                // Placeholder: navigate to car status / bookings screen if needed
                router.push("/(tabs)/bookings");
              }}
            >
              <Text style={styles.bookingActionButtonText}>
                {t("track_car_status")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
