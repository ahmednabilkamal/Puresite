import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Saudi_riyal from "@/components/saudi_riyal";
import { getAddonImageSource } from "@/constants/api";
import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { bookingService } from "@/services/booking-service";
import { Addon, Service, serviceService } from "@/services/service-service";
import { storage } from "@/utils/storage";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import styles from "./styles";

export default function AddonDetailsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRTL = i18n.language === "ar";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [selectedCarSize, setSelectedCarSize] = useState<string>("medium");
  const [vipFastTrack, setVipFastTrack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slotId = typeof params.slotId === "string" ? params.slotId : params.slotId?.[0];
  const slotDate = typeof params.slotDate === "string" ? params.slotDate : params.slotDate?.[0];
  const slotTime = typeof params.slotTime === "string" ? params.slotTime : params.slotTime?.[0];
  const hasSlot = Boolean(slotId && slotDate && slotTime);

  const fetchService = useCallback(async (serviceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedService = await serviceService.getServiceById(serviceId);
      setService(fetchedService);
      const sizes = fetchedService.car_sizes ?? [];
      setSelectedCarSize((params.selectedCarSize as string) || sizes[0] || "medium");
      setVipFastTrack(params.vipFastTrack === "1");
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
  }, [params.selectedCarSize, params.vipFastTrack, t]);

  useEffect(() => {
    const serviceId = params.serviceId as string;
    if (serviceId) {
      fetchService(serviceId);
    }
  }, [params.serviceId, fetchService]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(addonId)) {
        newSet.delete(addonId);
      } else {
        newSet.add(addonId);
      }
      return newSet;
    });
  };

  const getAddonPrice = (addon: Addon): number => {
    if (!addon) return 0;
    if (addon.has_size_pricing && addon.prices_by_size?.[selectedCarSize] != null) {
      return parseFloat(String(addon.prices_by_size[selectedCarSize]));
    }
    return parseFloat(addon.price || "0") || 0;
  };

  const calculateAddonsTotal = () => {
    if (!service || !service.addons) return 0;
    return service.addons
      .filter((addon) => selectedAddons.has(addon.id))
      .reduce((sum, addon) => sum + getAddonPrice(addon), 0);
  };

  const getBasePrice = (): number => {
    if (!service) return 0;
    const hasSizePricing = service.has_size_pricing && service.prices_by_size;
    if (hasSizePricing && service.prices_by_size?.[selectedCarSize] != null) {
      return parseFloat(String(service.prices_by_size[selectedCarSize]));
    }
    return parseFloat(service.base_price || "0") || 0;
  };

  const getFastTrackPrice = (): number => {
    if (!vipFastTrack || !service?.fast_track_price) return 0;
    return parseFloat(String(service.fast_track_price)) || 0;
  };

  /** Full total (service base + selected addons + fast track) for payment and display */
  const calculateTotalPrice = () => {
    if (!service) return 0;
    return getBasePrice() + calculateAddonsTotal() + getFastTrackPrice();
  };

  const renderAddonItem = ({ item }: { item: Addon }) => {
    const isSelected = selectedAddons.has(item.id);
    const imageSource = getAddonImageSource(item?.image_path);

    return (
      <View
        style={[
          styles.addonCard,
          { flexDirection: isRTL ? "row-reverse" : "row" },
          isSelected && { borderColor: Colors.primary },
        ]}
      >
        {/* Image */}
        <Image
          source={imageSource}
          style={[
            styles.addonImage,
            isRTL ? { marginLeft: 12, marginRight: 0 } : { marginRight: 12, marginLeft: 0 },
          ]}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={[styles.addonContent, { flex: 1 }]}>
          {/* Title */}
          <Text
            style={[
              styles.addonTitle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {item.name}
          </Text>

          {/* Price and Duration */}
          <View
            style={[
              styles.addonPriceRow,
              { flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center" },
            ]}
          >
            <Text style={styles.addonPrice}>
              {getAddonPrice(item).toFixed(2)}
            </Text>
            <View style={{ marginHorizontal: 4 }}>
              <Saudi_riyal width={16} height={16} />
            </View>
            <Text style={styles.addonDuration}>
              {" "}• {item.duration_delta_minutes} {t("minutes") || "min"}
            </Text>
          </View>

          {/* Description */}
          <Text
            style={[
              styles.addonDescription,
              { textAlign: isRTL ? "right" : "left" },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>


          {/* Action Buttons */}
          <View
            style={[
              styles.addonActions,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => {
                router.push({
                  pathname: "/service-details",
                  params: {
                    serviceId: service?.id,
                    carId: params.carId,
                  },
                });

              }}
            >
              <Text style={styles.detailsButtonText}>
                {t("details")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addButton,
                isSelected && styles.addButtonSelected,
              ]}
              onPress={() => toggleAddon(item.id)}
            >
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={Colors.white}
                  style={isRTL ? { marginLeft: 4 } : { marginRight: 4 }}
                />
              )}
              <Text
                style={[
                  styles.addButtonText,
                  isSelected && styles.addButtonTextSelected,
                ]}
              >
                {isSelected
                  ? t("added")
                  : t("add")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
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

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/notifications")}
          >
            <Image source={require("@/assets/images/notification.png")}
              style={{ width: 24, height: 24 }}
              resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>{t("loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !service) {
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
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{service?.name}</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/notifications")}
          >
            <Image source={require("@/assets/images/notification.png")}
              style={{ width: 24, height: 24 }}
              resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
          <Text style={[styles.errorText, { color: colors.text.primary }]}>
            {error || t("failed_to_load_service")}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              const serviceId = params.serviceId as string;
              if (serviceId) {
                fetchService(serviceId);
              }
            }}
          >
            <Text style={styles.retryButtonText}>{t("retry")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No data state
  const hasAddons = service.addons && service.addons.length > 0;

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
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{service?.name}</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push("/notifications")}
        >
          <Image source={require("@/assets/images/notification.png")}
            style={{ width: 24, height: 24 }}
            resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {!hasAddons ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cube-outline" size={64} color={colors.text.secondary} />
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
            {t("no_addons_available") || "No addons available"}
          </Text>
        </View>
      ) : (
        <>
          {/* Your appointment - when coming from slot selection */}
          {hasSlot && (
            <View style={[styles.addonCard, { flexDirection: isRTL ? "row-reverse" : "row", marginHorizontal: 20, marginTop: 16, backgroundColor: `${Colors.primary}12`, borderColor: `${Colors.primary}30` }]}>
              <View style={{ flex: 1, flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12 }}>
                <Ionicons name="calendar" size={24} color={Colors.primary} />
                <View>
                  <Text style={[styles.addonTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("your_appointment")}</Text>
                  <Text style={[styles.addonDuration, { textAlign: isRTL ? "right" : "left" }]}>
                    {slotDate} {t("at")} {slotTime}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* VIP Fast Track - when service has fast_track_price */}
          {service?.fast_track_price != null && parseFloat(String(service.fast_track_price)) > 0 && (
            <View style={[styles.addonCard, { flexDirection: isRTL ? "row-reverse" : "row", marginHorizontal: 20, marginTop: 16, backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}>
              <View style={{ flex: 1, flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12 }}>
                <Image source={require("@/assets/icons/diamond.png")} style={{ width: 22, height: 22 }} resizeMode="contain" />
                <View>
                  <Text style={[styles.addonTitle, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>{t("vip_fast_track")}</Text>
                  <Text style={[styles.addonDuration, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
                    {t("skip_queue")} (+{parseFloat(String(service.fast_track_price)).toFixed(2)} SAR)
                  </Text>
                </View>
              </View>
              <Switch
                value={vipFastTrack}
                onValueChange={setVipFastTrack}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
          )}

          {/* Car size selector - when service has size pricing */}
          {service?.has_size_pricing && (service.car_sizes?.length || Object.keys(service.prices_by_size || {}).length) > 0 && (
            <View style={{ marginHorizontal: 20, marginTop: 16, marginBottom: 8 }}>
              <Text style={[styles.addonTitle, { marginBottom: 8, textAlign: isRTL ? "right" : "left" }]}>
                {t("choose_car_size") || "Choose car size"}
              </Text>
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: 8 }}>
                {(service.car_sizes || Object.keys(service.prices_by_size || {})).map((size) => {
                  const isSelected = selectedCarSize === size;
                  const sizePrice = service.prices_by_size?.[size] ?? service.base_price;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.addButton,
                        { paddingVertical: 10, paddingHorizontal: 16 },
                        isSelected && styles.addButtonSelected,
                        !isSelected && { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
                      ]}
                      onPress={() => setSelectedCarSize(size)}
                    >
                      <Text
                        style={[
                          styles.addButtonText,
                          isSelected && styles.addButtonTextSelected,
                          !isSelected && { color: colors.text.primary },
                        ]}
                      >
                        {t(`car_size_${size}`)} ({parseFloat(String(sizePrice)).toFixed(2)})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <FlatList
            data={service.addons}
            renderItem={renderAddonItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.footer, { backgroundColor: colors.surface }]}>
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
                <Text style={[styles.totalPriceValue, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
                  <Saudi_riyal color={colors.text.primary} /> {calculateTotalPrice().toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  isRTL ? { marginRight: 32 } : { marginLeft: 32 },
                  isSubmitting && { opacity: 0.7 },
                ]}
                disabled={isSubmitting}
                onPress={async () => {
                  const carIdParam = typeof params.carId === "string" ? params.carId : params.carId?.[0];
                  const carId = carIdParam ? Number(carIdParam) : Number(await storage.getItem("selected_car_id"));
                  if (!Number.isFinite(carId) || carId <= 0) {
                    Toast.show({ type: "error", text1: t("error"), text2: t("please_select_car") || "Please select a car" });
                    return;
                  }
                  const addonsPayload = Array.from(selectedAddons).map((id) => ({ addon_id: parseInt(id, 10), qty: 1 }));

                  if (hasSlot && slotId) {
                    setIsSubmitting(true);
                    try {
                      const order = await bookingService.createServiceOrder({
                        service_id: Number(service?.id),
                        car_id: carId,
                        car_size: selectedCarSize,
                        addons: addonsPayload,
                        is_fast_track: false,
                        pay_with_moyasar: false,
                        slot_id: Number(slotId),
                      });
                      const orderId = order?.id ?? order?.ticket_code;
                      if (orderId != null) {
                        router.push({
                          pathname: "/booking-payment",
                          params: {
                            orderId: String(orderId),
                            ticketCode: order.ticket_code ?? "",
                            totalAmount: calculateTotalPrice().toFixed(2),
                            orderType: "service",
                          },
                        });
                      }
                    } catch (err: any) {
                      const msg = err.response?.data?.message || t("failed_to_create_booking");
                      Toast.show({ type: "error", text1: t("error"), text2: msg });
                    } finally {
                      setIsSubmitting(false);
                    }
                    return;
                  }
                  if (vipFastTrack) {
                    setIsSubmitting(true);
                    try {
                      const order = await bookingService.createServiceOrder({
                        service_id: Number(service?.id),
                        car_id: carId,
                        car_size: selectedCarSize,
                        addons: addonsPayload,
                        is_fast_track: true,
                        pay_with_moyasar: false,
                      });
                      const orderId = order?.id ?? order?.ticket_code;
                      if (orderId != null) {
                        router.push({
                          pathname: "/booking-payment",
                          params: {
                            orderId: String(orderId),
                            ticketCode: order.ticket_code ?? "",
                            totalAmount: calculateTotalPrice().toFixed(2),
                            orderType: "service",
                          },
                        });
                      }
                    } catch (err: any) {
                      const msg = err.response?.data?.message || t("failed_to_create_booking");
                      Toast.show({ type: "error", text1: t("error"), text2: msg });
                    } finally {
                      setIsSubmitting(false);
                    }
                    return;
                  }
                  const addonIds = Array.from(selectedAddons).join(",");
                  const totalAmount = calculateTotalPrice().toFixed(2);
                  router.push({
                    pathname: "/booking-date",
                    params: {
                      carId: params.carId,
                      serviceId: String(service?.id ?? ""),
                      addonIds,
                      totalAmount,
                      carSize: selectedCarSize,
                      vipFastTrack: vipFastTrack ? "1" : "0",
                    },
                  });
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.bookButtonText}>{t("book_appointment")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

    </SafeAreaView>
  );
}
