import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  bookingService,
  ServiceOrder,
} from "@/services/booking-service";
import { cafeService } from "@/services/cafe-service";
import { useAuthStore } from "@/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { BookingsSkeleton } from "./BookingsSkeleton";
import styles from "./styles";

type TabType = "services" | "cafe";

interface CafeOrderItem {
  id: number;
  status: string;
  total: number | string;
  pickup_method: string;
  created_at: string;
  is_free?: boolean;
}

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

function mapServiceOrderToBooking(order: ServiceOrder): Booking {
  const raw = (order.status?.toLowerCase?.() ?? "pending") as string;
  const normalizedStatus: BookingStatus = BOOKING_STATUSES.includes(raw as BookingStatus) ? (raw as BookingStatus) : "pending";
  const dateTime = order.scheduled_at
    ? new Date(order.scheduled_at)
    : new Date(order.created_at);
  const dateFormatted = dateTime.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    calendar: "gregory",
  });
  const timeFormatted = dateTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const carName = order.car?.car_model;
  const carPlate = order.car?.plate_number;
  const addons = Array.isArray(order.addons)
    ? (order.addons as { addon_id?: number }[])
      .filter((a) => a.addon_id != null)
      .map((a) => String(a.addon_id))
    : [];

  return {
    id: String(order.id),
    orderNumber: order.ticket_code ?? String(order.id),
    serviceName: order.service?.name ?? "",
    date: dateFormatted,
    time: timeFormatted,
    status: normalizedStatus,
    carImage: order.service?.image_path,
    carName,
    carPlate,
    serviceId: order.service?.id,
    carSize: order.car_size,
    addonIds: addons.length > 0 ? addons.join(",") : undefined,
    carId: order.car?.id != null ? Number(order.car.id) : undefined,
    is_fast_track: order.is_fast_track === true,
  };
}

export default function BookingsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const params = useLocalSearchParams<{ tab?: string }>();
  const isRTL = i18n.language === "ar";

  const tabParam = typeof params.tab === "string" ? params.tab : params.tab?.[0];
  const [activeTab, setActiveTab] = useState<TabType>(tabParam === "cafe" ? "cafe" : "services");

  useEffect(() => {
    if (tabParam === "cafe") {
      setActiveTab("cafe");
    }
  }, [tabParam]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cafeOrders, setCafeOrders] = useState<CafeOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingAgainId] = useState<string | null>(null);

  const fetchServiceOrders = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setIsLoading(true);
        }
        const orders = await bookingService.getServiceOrders();
        setBookings(orders.map(mapServiceOrderToBooking));
      } catch (error) {
        console.error("Error fetching service orders:", error);
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("service_orders_load_failed"),
        });
        setBookings([]);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [t]
  );

  const fetchCafeOrders = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setIsLoading(true);
        }
        const data = await cafeService.getOrders();
        setCafeOrders(
          (data ?? []).map(
            (o: {
              id: number;
              cafe_status?: string;
              status?: string;
              total?: number | string;
              pickup_method?: string;
              created_at?: string;
              is_free?: boolean;
            }) => ({
              id: o.id,
              status: o.cafe_status ?? o.status ?? "pending",
              total: o.total ?? 0,
              pickup_method: o.pickup_method ?? "branch",
              created_at: o.created_at ?? "",
              is_free: o.is_free ?? false,
            })
          )
        );
      } catch (error) {
        console.error("Error fetching cafe orders:", error);
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("service_orders_load_failed"),
        });
        setCafeOrders([]);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [t]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setBookings([]);
      setCafeOrders([]);
      return;
    }
    if (activeTab === "services") {
      fetchServiceOrders();
    } else {
      fetchCafeOrders();
    }
  }, [activeTab, fetchServiceOrders, fetchCafeOrders, isAuthenticated]);

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

  const handleRefresh = useCallback(() => {
    if (!isAuthenticated) return;
    if (activeTab === "services") {
      fetchServiceOrders(true);
    } else {
      fetchCafeOrders(true);
    }
  }, [activeTab, fetchCafeOrders, fetchServiceOrders, isAuthenticated]);

  const getStatusInfo = useCallback((status: BookingStatus) => {
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
  }, [t]);

  const renderBookingCard = useCallback(
    ({ item }: { item: Booking }) => {
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
            <View
              style={[
                styles.serviceTextContainer,
                // { alignItems: isRTL ? "flex-end" : "flex-start", },
              ]}
            >
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
    },
    [handleBookAgainPress, bookingAgainId, t, isRTL, getStatusInfo, router, colors]
  );

  const getPickupMethodLabel = useCallback(
    (pickup_method: string) =>
      pickup_method === "parking" ? t("deliver_to_parking") : t("pickup_branch"),
    [t]
  );

  const getCafeStatusInfo = useCallback(
    (status: string): { label: string; color: string; bgColor: string } => {
      const s = status?.toLowerCase();
      switch (s) {
        case "pending":
          return { label: t("pending"), color: Colors.statusPending, bgColor: Colors.statusPendingBg };
        case "preparing":
          return { label: t("preparing"), color: Colors.statusInProgress, bgColor: Colors.statusInProgressBg };
        case "ready":
          return { label: t("ready"), color: Colors.statusInProgress, bgColor: Colors.statusInProgressBg };
        case "picked_up":
          return { label: t("picked_up"), color: Colors.statusCompleted, bgColor: Colors.statusCompletedBg };
        case "completed":
          return { label: t("completed"), color: Colors.statusCompleted, bgColor: Colors.statusCompletedBg };
        case "cancelled":
          return { label: t("cancelled") ?? "Cancelled", color: Colors.statusCancelled, bgColor: Colors.statusCancelledBg };
        default:
          return { label: status ?? t("pending"), color: Colors.statusPending, bgColor: Colors.statusPendingBg };
      }
    },
    [t]
  );

  const formatCafeOrderDate = useCallback((created_at: string) => {
    if (!created_at) return "";
    const d = new Date(created_at);
    return d.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "gregory",
    });
  }, []);

  const renderCafeOrderCard = useCallback(
    ({ item }: { item: CafeOrderItem }) => {
      const statusInfo = getCafeStatusInfo(item.status);
      const pickupLabel = getPickupMethodLabel(item.pickup_method);
      const dateStr = formatCafeOrderDate(item.created_at);
      return (
        <View style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View
            style={[
              styles.serviceInfoContainer,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <View style={styles.serviceTextContainer}>
              <Text style={[styles.serviceName, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
                {t("order_number")} #{item.id}
              </Text>
              {dateStr ? (
                <Text style={[styles.serviceDateTime, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                  {t("order_date")}: {dateStr}
                </Text>
              ) : null}
              <Text style={[styles.serviceDateTime, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                {t("total_price")}: {item.is_free ? t("free") : `${String(item.total)} ${t("riyals")}`}
              </Text>
              <Text style={[styles.serviceDateTime, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                {t("delivery_method")}: {pickupLabel}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusInfo.bgColor,
                  position: "absolute",
                  top: 16,
                  ...(isRTL ? { left: 16 } : { right: 16 }),
                },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.actionButtonsContainer,
              { flexDirection: isRTL ? "row" : "row-reverse" },
            ]}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.viewDetailsButton, { backgroundColor: colors.bookingButton, borderColor: colors.bookingButton }]}
              onPress={() => router.push(`/cafe/orders/${item.id}`)}
            >
              <Text style={[styles.viewDetailsText, { color: colors.text.primary }]}>{t("details")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [t, isRTL, router, getPickupMethodLabel, getCafeStatusInfo, formatCafeOrderDate, colors]
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8, textAlign: "center", color: colors.text.primary }}>
            {t("login")}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 24, textAlign: "center", color: colors.text.secondary }}>
            {t("login_to_workspace")}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/login" as any)}
            style={{ backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
          >
            <Text style={{ color: Colors.white, fontWeight: "600", fontSize: 16 }}>{t("login")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("orders")}</Text>
      </View>

      {/* Tab Buttons: Services | Cafe */}
      <View style={[styles.tabRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Pressable
          style={[
            styles.tabButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            activeTab === "services" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("services")}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === "services" ? Colors.white : colors.text.primary },
              activeTab === "services" && styles.tabButtonTextActive,
            ]}
          >
            {t("car_services")}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            activeTab === "cafe" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("cafe")}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === "cafe" ? Colors.white : colors.text.primary },
              activeTab === "cafe" && styles.tabButtonTextActive,
            ]}
          >
            {t("cafe")}
          </Text>
        </Pressable>
      </View>

      {/* Bookings List */}
      {isLoading ? (
        <BookingsSkeleton />
      ) : activeTab === "cafe" ? (
        <FlatList
          data={cafeOrders}
          renderItem={renderCafeOrderCard}
          keyExtractor={(item) => String(item.id)}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={[
            styles.listContent,
            cafeOrders.length === 0 && { flex: 1, justifyContent: "center" },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>{t("no_orders")}</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={[
            styles.listContent,
            bookings.length === 0 && { flex: 1, justifyContent: "center" },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                {t("no_bookings")}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
