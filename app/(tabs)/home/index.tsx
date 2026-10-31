import { GradientOverlay } from "@/components/gradient-overlay";
import {
  Car,
  CarSelectionSheet,
  CarSelectionSheetRef,
} from "@/components/ui/car-selection-sheet";
import { API_CONFIG, getServiceImageSource } from "@/constants/api";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { bannerService, getBannerImageUri, HomePageBanner } from "@/services/banner-service";
import { bookingService, ServiceOrder } from "@/services/booking-service";
import { Car as BackendCar, carService } from "@/services/car-service";
import { Service, serviceService } from "@/services/service-service";
import { useAuthStore } from "@/store/auth-store";
import { getStoredPushToken } from "@/utils/push-notifications";
import { storage } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { HomeSkeleton } from "./HomeSkeleton";
import styles from "./styles";

// Helper function to map backend car to component car
const mapBackendCarToComponent = (backendCar: BackendCar): Car => {
  // Extract year from created_at if available, or leave undefined
  const year = backendCar.created_at
    ? new Date(backendCar.created_at).getFullYear().toString()
    : undefined;

  return {
    id: backendCar.id.toString(),
    model: backendCar.car_model,
    plateNumber: backendCar.plate_number,
    year,
  };
};

export default function HomeScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [bookingAgainId] = useState<string | null>(null);
  const [bannersFromApi, setBannersFromApi] = useState<HomePageBanner[]>([]);
  const carSheetRef = useRef<CarSelectionSheetRef>(null);

  const recentServiceOrders = serviceOrders.slice(0, 3);

  const getAvatarUri = (uri: string | null | undefined) => {
    if (!uri) return undefined;
    if (uri.startsWith("http") || uri.startsWith("file:")) return uri;
    return `${API_CONFIG.BASE_URL.replace("/api/v1", "").replace(/\/$/, "")}${uri.startsWith("/") ? uri : `/${uri}`}`;
  };
  const avatarSource = getAvatarUri(user?.avatar_url ?? undefined);

  type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  interface Booking {
    id: string;
    orderNumber: string;
    serviceName: string;
    date: string;
    time: string;
    status: BookingStatus;
    carImage?: string;
    carName?: string;
    carPlate?: string;
    serviceId?: number;
    carSize?: string;
    addonIds?: string;
    carId?: number;
    is_fast_track?: boolean;
  }
  const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

  // Fetch current user (/me) when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated, fetchMe]);

  // Log Expo Push Token when home screen mounts (for debugging / test page)
  useEffect(() => {
    getStoredPushToken().then((token) => {
      if (token) {
        console.log("Expo Push Token:", token);
      }
    });
  }, []);

  // Fetch cars
  useEffect(() => {
    if (isAuthenticated) {
      fetchCars();
    } else {
      setIsLoadingCars(false);
    }
  }, [isAuthenticated]);

  // Fetch services (available for guests and authenticated users)
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch cafe orders (first 3 shown on home)
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     fetchCafeOrders();
  //   } else {
  //     setCafeOrders([]);
  //   }
  // }, [isAuthenticated]);

  // Fetch service orders (first 3 shown in recent activity)
  useEffect(() => {
    if (isAuthenticated) {
      fetchServiceOrders();
    } else {
      setServiceOrders([]);
    }
  }, [isAuthenticated]);

  // Fetch home page banners (public)
  useEffect(() => {
    bannerService.getBanners().then(setBannersFromApi).catch((err) => {
      console.error("Error fetching banners:", err);
      setBannersFromApi([]);
    });
  }, []);

  const fetchCars = async () => {
    try {
      setIsLoadingCars(true);
      const backendCars = await carService.getCars();
      const mappedCars = backendCars.map(mapBackendCarToComponent);
      setCars(mappedCars);
      if (mappedCars.length > 0) {
        const storedSelectedId = await storage.getItem("selected_car_id");
        const preferredCar =
          mappedCars.find((c) => c.id === storedSelectedId) ?? mappedCars[0];
        setSelectedCar(preferredCar);
        if (!storedSelectedId || storedSelectedId !== preferredCar.id) {
          storage.setItem("selected_car_id", preferredCar.id);
        }
      } else {
        setSelectedCar(null);
        storage.removeItem("selected_car_id");
      }
    } catch (err: any) {
      console.error("Error fetching cars:", err);
      // Error is logged, user can retry by pulling to refresh or navigating away and back
    } finally {
      setIsLoadingCars(false);
    }
  };

  const fetchServices = async () => {
    try {
      setIsLoadingServices(true);
      const fetchedServices = await serviceService.getServices();
      setServices(fetchedServices);
    } catch (err: any) {
      console.error("Error fetching services:", err);
      // Error is logged, user can retry by pulling to refresh or navigating away and back
    } finally {
      setIsLoadingServices(false);
    }
  };

  const fetchServiceOrders = async () => {
    try {
      const orders = await bookingService.getServiceOrders();
      setServiceOrders(orders);
    } catch (err: any) {
      console.error("Error fetching service orders:", err);
      setServiceOrders([]);
    }
  };

  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
    storage.setItem("selected_car_id", car.id);
  };

  const handleAddNewCar = () => {
    router.push("/car-details");
  };

  const handleDeleteCar = async (carId: string) => {
    await carService.deleteCar(carId);
    await fetchCars();
  };

  const userName = user?.name || t("user");
  const helloText = t("welcome");
  const greetingText = `${helloText} ${userName}`;

  const getUserInitials = (name?: string): string => {
    if (!name) return "U";
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return "U";
    if (trimmedName.length === 1) return trimmedName[0].toUpperCase();
    // Get first character and second character (or first character of second word)
    const words = trimmedName.split(" ").filter(w => w.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return trimmedName.substring(0, 2).toUpperCase();
  };

  const userInitials = getUserInitials(user?.name);

  const popularServices = services;

  const banners = bannersFromApi.map((b) => ({
    id: String(b.id),
    title: b.title ?? null,
    image: getBannerImageUri(b),
    onPress: () => {
      if (b.link) {
        if (b.link.startsWith("/")) router.push(b.link as any);
        else router.push("/cafe");
      } else {
        router.push("/cafe");
      }
    },
  }));

  const handleBookAgainPress = useCallback(
    (item: Booking) => {
      if (item.serviceId == null) {
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("failed_to_load_service"),
        });
        return;
      }
      const params: Record<string, string> = {
        serviceId: String(item.serviceId),
        carSize: item.carSize ?? "medium",
        vipFastTrack: item.is_fast_track ? "1" : "0",
      };
      if (item.addonIds) params.addonIds = item.addonIds;
      if (item.carId != null) params.carId = String(item.carId);
      if (item.is_fast_track) {
        router.push({ pathname: "/addon-details", params });
      } else {
        router.push({ pathname: "/booking-date", params });
      }
    },
    [router, t]
  );

  const getStatusInfo = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return { label: t("pending"), color: Colors.statusPending, bgColor: Colors.statusPendingBg };
      case "confirmed":
        return { label: t("confirmed") ?? "Confirmed", color: Colors.statusConfirmed, bgColor: Colors.statusConfirmedBg };
      case "in_progress":
        return { label: t("in_progress"), color: Colors.statusInProgress, bgColor: Colors.statusInProgressBg };
      case "completed":
        return { label: t("completed"), color: Colors.statusCompleted, bgColor: Colors.statusCompletedBg };
      case "cancelled":
        return { label: t("cancelled") ?? "Cancelled", color: Colors.statusCancelled, bgColor: Colors.statusCancelledBg };
      default:
        return { label: t("pending"), color: Colors.statusPending, bgColor: Colors.statusPendingBg };
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusInfo = getStatusInfo(item?.status);


    return (
      <View style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.bgColor, ...(isRTL ? { left: 16 } : { right: 16 }) },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>

        {/* Service Info */}
        <View
          style={[
            styles.serviceInfoContainer,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <View>
            {(() => {
              const si = getStatusInfo(item.status);
              return (
                <View style={[styles.completedIcon, {
                  borderColor: si.bgColor,
                  backgroundColor: si.bgColor,
                  marginRight: isRTL ? 0 : 6,
                  marginLeft: isRTL ? 6 : 0,
                }]}>
                  <Ionicons name="checkmark-circle" size={24} color={si.color} />
                </View>
              );
            })()}
          </View>

          <View>
            <Text style={[styles.serviceName, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>{item.serviceName}</Text>
            <Text style={[styles.serviceDateTime, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
              {item.date} {item.time}
            </Text>
            {(item.carName != null || item.carPlate != null) && (
              <Text style={[styles.serviceDateTime, { textAlign: isRTL ? "right" : "left", marginTop: 2, opacity: 0.9, color: colors.text.secondary }]}>
                {item.carName} - ({item.carPlate})
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={[
            styles.actionButtonsContainer,
            { flexDirection: isRTL ? "row" : "row-reverse" },
          ]}
        >
          <Pressable
            style={[
              styles.actionButton,
              styles.bookAgainButton,
              { backgroundColor: colors.surface, borderColor: colors.primary },
              bookingAgainId === item.id && { opacity: 0.7 },
            ]}
            disabled={bookingAgainId === item.id}
            onPress={() => handleBookAgainPress(item)}
            android_ripple={{ color: "rgba(0,0,0,0.1)" }}
          >
            {bookingAgainId === item.id ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={[styles.bookAgainText, { color: colors.primary }]}>
                {t("book_again")}
              </Text>
            )}
          </Pressable>

          <TouchableOpacity
            style={[styles.actionButton, styles.viewDetailsButton, { backgroundColor: colors.bookingButton, borderColor: colors.bookingButton }]}
            onPress={() => {
              router.push(`/booking-details?id=${item.id}&order=${item.orderNumber}`);
            }}
          >
            <Text style={[styles.viewDetailsText, { color: colors.text.primary }]}>
              {t("view_details")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBannerItem = ({ item }: { item: (typeof banners)[0] }) => {
    return (
      <TouchableOpacity
        style={[
          styles.bannerContainer,
          { direction: isRTL ? "rtl" : "ltr", marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 },
        ]}
        onPress={item.onPress}
        activeOpacity={0.9}
      >
        <View style={[styles.bannerGradient, { direction: isRTL ? "rtl" : "ltr" }]}>
          <Image
            source={{ uri: item.image }}
            style={styles.bannerBackgroundImage}
            resizeMode="cover"
          />
          {item.title ? (
            <View
              style={[
                styles.bannerContent,
                {
                  left: 0,
                  right: 0,
                  width: "100%",
                  paddingHorizontal: 20,
                  alignItems: isRTL ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.bannerTitle,
                  {
                    textAlign: isRTL ? "right" : "left",
                    color: Colors.white,
                    marginVertical: 12,
                  },
                ]}
              >
                {item.title}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const isInitialLoading = isLoadingCars || isLoadingServices;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
      <GradientOverlay />
      {/* Circular Spread Gradient at Top Right */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {isInitialLoading ? (
          <HomeSkeleton />
        ) : (
          <>
        {/* Header with Greeting */}
        <View
          style={[
            styles.header,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >

          <View
            style={[
              styles.userInfo,
              {
                flexDirection: isRTL ? "row-reverse" : "row",
                alignItems: "center",
              },
            ]}
          >
            {avatarSource ? (
              <Image
                source={{ uri: avatarSource }}
                style={[
                  styles.avatar,
                  isRTL ? { marginLeft: 12 } : { marginRight: 12 },
                ]}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarInitials,
                  isRTL ? { marginLeft: 12 } : { marginRight: 12 },
                ]}
              >
                <Text style={styles.avatarText}>{userInitials}</Text>
              </View>
            )}
            <View
              style={[
                styles.greetingContainer,
                {
                  flex: 1,
                  minWidth: 0,
                  justifyContent: "center",
                  alignItems: isRTL ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.greeting,
                  {
                    color: colors.text.primary,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {greetingText}
              </Text>
              <Text
                numberOfLines={2}
                style={[
                  styles.subGreeting,
                  {
                    textAlign: isRTL ? "right" : "left",
                    color: colors.text.secondary,
                  },
                ]}
              >
                {t("welcome_car_care")}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/notifications")}
          >
            <Image source={require("@/assets/images/notification.png")} resizeMode="contain" style={{ width: 22, height: 22 }} />
          </TouchableOpacity>
        </View>

        {/* Current Vehicle Card (authenticated users only) */}
        {isAuthenticated && (
          isLoadingCars ? (
            <View style={[styles.vehicleCard, { backgroundColor: colors.surface, borderColor: colors.border, justifyContent: "center", alignItems: "center", minHeight: 100 }]}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : selectedCar ? (
            <TouchableOpacity
              style={[
                styles.vehicleCard,
                { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={() => carSheetRef.current?.open()}
              activeOpacity={0.7}
            >
              <View style={styles.vehicleIconContainer}>
                <Image source={require("@/assets/images/car.png")} resizeMode="contain" style={{ width: 24, height: 24 }} />
              </View>

              <View style={styles.vehicleContent}>
                <Text
                  style={[
                    styles.vehicleLabel,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                  ]}
                >
                  {t("current_vehicle")}
                </Text>
                <Text
                  style={[
                    styles.vehicleName,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {selectedCar.model} {selectedCar.year ? selectedCar.year : ""}
                </Text>
                <Text
                  style={[
                    styles.vehiclePlate,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {selectedCar.plateNumber}
                </Text>
              </View>

              <Image source={require("@/assets/images/arrow.png")} resizeMode="contain" style={{ width: 32, height: 32 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.vehicleCard,
                { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={handleAddNewCar}
              activeOpacity={0.7}
            >
              <View style={[styles.vehicleIconContainer, { backgroundColor: colors.primary + "30" }]}>
                <Ionicons
                  name="add-circle-outline"
                  size={32}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.vehicleContent}>
                <Text
                  style={[
                    styles.vehicleLabel,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                  ]}
                >
                  {t("current_vehicle")}
                </Text>
                <Text
                  style={[
                    styles.vehicleName,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {t("no_car_added")}
                </Text>
              </View>

            </TouchableOpacity>
          )
        )}

        {/* Promotional Banner */}
        <TouchableOpacity
          style={styles.bannerContainer}
          onPress={() => router.push({
            pathname: "/service-details",
            params: { carId: selectedCar?.id }
          })}
          activeOpacity={0.9}
        >
          {/* ... existing code ... */}
        </TouchableOpacity>

        {/* Banners Horizontal FlatList */}
        <FlatList
          data={banners}
          renderItem={renderBannerItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.bannersListContent,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
          style={[styles.bannersList, { direction: isRTL ? "rtl" : "ltr" }]}
        />

        {/* Popular Services Section */}
        <Text
          style={[
            styles.sectionTitle,
            { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
          ]}
        >
          {t("popular_services")}
        </Text>

        {isLoadingServices ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.servicesContainer}>
            {popularServices.length > 0 ? (
              popularServices.map((service, index) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    index === 0 && styles.serviceCardFirst,
                    index === popularServices.length - 1 && styles.serviceCardLast,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/service-details",
                      params: { serviceId: service.id, carId: selectedCar?.id },
                    })
                  }
                >
                  <View style={{
                    width: 72, height: 72, backgroundColor: colors.border,
                    borderRadius: 20, marginBottom: 10,
                    overflow: "hidden",
                    justifyContent: "center", alignItems: "center",
                  }}>
                    <Image
                      source={getServiceImageSource(service?.image_path)}
                      resizeMode="cover"
                      style={{ width: 72, height: 72 }}
                    />
                  </View>
                  <Text
                    style={[
                      styles.serviceName,
                      { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                    ]}
                  >
                    {service.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ padding: 20 }}>
                <Text
                  style={[
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary, fontFamily: Fonts.CairoRegular },
                  ]}
                >
                  {t("no_services_available")}
                </Text>
              </View>
            )}
          </View>
        )}


        {false && (
          <>
            {/* Recent Activity Section intentionally hidden */}
            <Text
              style={[
                styles.sectionTitle,
                { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                styles.activitySectionTitle,
              ]}
            >
              {t("recent_activity")}
            </Text>

            <FlatList
              data={recentServiceOrders.map((so): Booking => {
                const dateTime = so.scheduled_at
                  ? new Date(so.scheduled_at)
                  : new Date(so.created_at);
                const dateStr = dateTime.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  calendar: "gregory",
                });
                const timeStr = dateTime.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const carName = so.car?.car_model;
                const carPlate = so.car?.plate_number;
                const addons = Array.isArray(so.addons)
                  ? (so.addons as { addon_id?: number }[])
                    .filter((a) => a.addon_id != null)
                    .map((a) => String(a.addon_id))
                  : [];
                return {
                  id: String(so.id),
                  orderNumber: so.ticket_code ?? String(so.id),
                  serviceName: so.service?.name ?? "",
                  date: dateStr,
                  time: timeStr,
                  status: BOOKING_STATUSES.includes((so.status?.toLowerCase?.() ?? "") as BookingStatus) ? (so.status?.toLowerCase?.() as BookingStatus) : "pending",
                  carImage: so.service?.image_path,
                  carName,
                  carPlate,
                  serviceId: so.service?.id,
                  carSize: so.car_size,
                  addonIds: addons.length > 0 ? addons.join(",") : undefined,
                  carId: so.car?.id != null ? Number(so.car.id) : undefined,
                  is_fast_track: so.is_fast_track === true,
                };
              })}
              initialNumToRender={3}
              renderItem={renderBookingCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                    {t("no_recent_activity")}
                  </Text>
                </View>
              }
            />
          </>
        )}
          </>
        )}
      </ScrollView>

      {/* Car Selection Bottom Sheet */}
      {isAuthenticated && (
        <CarSelectionSheet
          ref={carSheetRef}
          cars={cars}
          selectedCarId={selectedCar?.id}
          onSelectCar={handleSelectCar}
          onAddNewCar={handleAddNewCar}
          onDeleteCar={handleDeleteCar}
        />
      )}
    </SafeAreaView>
  );
}
