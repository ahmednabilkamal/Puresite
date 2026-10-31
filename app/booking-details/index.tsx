import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { getServiceImageSource } from "@/constants/api";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { bookingService, ServiceOrder } from "@/services/booking-service";
import { cafeService } from "@/services/cafe-service";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useGlobalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import styles from "./styles";

interface ServiceStep {
  id: string;
  name: string;
  status: "completed" | "in_progress" | "pending";
  completedAt?: string;
  estimatedAt?: string;
  instruction?: string;
  orderStatus?: string;
}

export type ApiOrderStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

interface BookingDetails {
  id: string;
  orderNumber: string;
  status: ApiOrderStatus;
  paymentStatus?: string;
  progress: number;
  serviceName: string;
  licensePlate: string;
  carName?: string;
  additionalServices: string[];
  carImage: string;
  steps: ServiceStep[];
  queuePosition?: number;
  estimatedCompletion?: string;
  qrcode_payload?: string | null;
  scheduledAt?: string | null;
  createdAt?: string | null;
  subtotal?: string;
  discountTotal?: string;
  total?: string;
  carSize?: string;
  hasFreeCafeItem?: boolean;
  freeCafeOrder?: { id: number; cafe_status: string } | null;
}

const API_ORDER_STATUSES: ApiOrderStatus[] = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

function mapServiceOrderToBookingDetails(order: ServiceOrder): BookingDetails {

  const raw = (order.status?.toLowerCase?.() ?? "pending") as string;
  const status: ApiOrderStatus = API_ORDER_STATUSES.includes(raw as ApiOrderStatus) ? (raw as ApiOrderStatus) : "pending";
  const progress = status === "completed" ? 100 : status === "cancelled" ? 0 : status === "in_progress" ? 50 : status === "confirmed" ? 25 : 20;
  const addons = Array.isArray(order.addons)
    ? (order.addons as { name?: string }[]).map((a) => a.name ?? "").filter(Boolean)
    : [];

  // Build steps: created_at, confirmed, in_progress, ready_for_receiving (no pending step)
  const steps: ServiceStep[] = [];
  if (order.created_at) {
    const createdAtFormatted = new Date(order.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", calendar: "gregory" });
    steps.push({
      id: "created_at",
      name: "Order date",
      status: "completed",
      instruction: createdAtFormatted,
      orderStatus: status,
    });
  }
  steps.push({
    id: "confirmed",
    name: "Confirmed",
    status: "pending",
    orderStatus: status,
  });
  steps.push({
    id: "in_progress",
    name: "In Progress",
    status: "pending",
    orderStatus: status,
  });
  if (status === "cancelled") {
    steps.push({
      id: "cancelled",
      name: "Cancelled",
      status: "pending",
      orderStatus: status,
    });
  } else {
    steps.push({
      id: "ready_for_receiving",
      name: "Ready for receiving",
      status: "pending",
      instruction: "please_come_to_receive_your_car",
      orderStatus: status,
    });
  }

  // Map step status from order status: pending, confirmed, in_progress, completed, cancelled
  if (status === "completed") {
    steps.forEach((s) => { s.status = "completed"; });
  } else if (status === "cancelled") {
    steps.forEach((s) => {
      if (s.id === "created_at") s.status = "completed";
      else if (s.id === "cancelled") s.status = "in_progress";
      else s.status = "pending";
    });
  } else if (status === "pending") {
    steps.forEach((s) => {
      if (s.id === "created_at") s.status = "completed";
      else if (s.id === "confirmed") s.status = "in_progress";
      else s.status = "pending";
    });
  } else if (status === "confirmed") {
    steps.forEach((s) => {
      if (s.id === "created_at" || s.id === "confirmed") s.status = "completed";
      else if (s.id === "in_progress") s.status = "in_progress";
      else s.status = "pending";
    });
  } else if (status === "in_progress") {
    steps.forEach((s) => {
      if (s.id === "created_at" || s.id === "confirmed") s.status = "completed";
      else if (s.id === "in_progress") s.status = "in_progress";
      else s.status = "pending";
    });
  }

  const hasFreeCafeItem = !!(order.service?.free_cafe_product_id);
  const freeCafeOrder = order.cafe_order ?? null;
  return {
    id: String(order.id),
    orderNumber: order.ticket_code ?? String(order.id),
    status,
    paymentStatus: order.payment_status,
    progress,
    serviceName: order.service?.name ?? "",
    licensePlate: order.car?.plate_number ?? "",
    carName: order.car?.name ?? order.car?.car_model ?? undefined,
    additionalServices: addons,
    carImage: order.service?.image_path ?? "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
    steps,
    estimatedCompletion: order.service?.duration_minutes ? `${order.service.duration_minutes} mins` : undefined,
    qrcode_payload: order.qrcode_payload ?? null,
    scheduledAt: order.scheduled_at ?? null,
    createdAt: order.created_at ?? null,
    subtotal: order.subtotal,
    discountTotal: order.discount_total,
    total: order.total,
    carSize: order.car_size,
    hasFreeCafeItem,
    freeCafeOrder,
  };
}

export default function BookingDetailsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useGlobalSearchParams<{ id?: string; order?: string }>();
  const isRTL = i18n.language === "ar";
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingFreeCafeOrder, setIsCreatingFreeCafeOrder] = useState(false);

  const fetchBookingDetails = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await bookingService.getServiceOrderById(id);
        setBooking(mapServiceOrderToBookingDetails(data));
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError(t("failed_to_load_service"));
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  useFocusEffect(
    useCallback(() => {
      const rawId = params.id;
      const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
      if (id) {
        fetchBookingDetails(id);
      } else {
        setBooking(null);
        setIsLoading(false);
      }
    }, [params.id, fetchBookingDetails])
  );

  const requestFreeDrink = useCallback(async () => {
    if (!booking?.id || booking.freeCafeOrder || isCreatingFreeCafeOrder) return;
    try {
      setIsCreatingFreeCafeOrder(true);
      await cafeService.createFreeOrderFromServiceOrder(Number(booking.id), "branch");
      Toast.show({ type: "success", text1: t("free_cafe_order_created") });
      await fetchBookingDetails(booking.id);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message ?? t("failed_to_load_service");
      Toast.show({ type: "error", text1: msg });
    } finally {
      setIsCreatingFreeCafeOrder(false);
    }
  }, [booking?.id, booking?.freeCafeOrder, isCreatingFreeCafeOrder, t, fetchBookingDetails]);

  const getStatusInfo = (details: BookingDetails) => {
    switch (details.status) {
      case "pending":
        return {
          label: t("pending"),
          icon: require("@/assets/images/waiting.png"),
          color: Colors.statusPending,
          bgColor: Colors.statusPendingBg,
          progressColor: Colors.statusPending,
          progressText: t("progress_status"),
        };
      case "confirmed":
        return {
          label: t("confirmed") ?? "Confirmed",
          icon: require("@/assets/images/waiting.png"),
          color: Colors.statusConfirmed,
          bgColor: Colors.statusConfirmedBg,
          progressColor: Colors.statusConfirmed,
          progressText: t("queue_status"),
        };
      case "in_progress":
        return {
          label: t("in_progress"),
          icon: require("@/assets/images/in_service.png"),
          color: Colors.statusInProgress,
          bgColor: Colors.statusInProgressBg,
          progressColor: Colors.statusInProgress,
          progressText: t("estimated_completion_time"),
        };
      case "completed":
        return {
          label: t("car_ready_for_pickup"),
          icon: require("@/assets/images/ready.png"),
          color: Colors.statusCompleted,
          bgColor: Colors.statusCompletedBg,
          progressColor: Colors.statusCompleted,
          progressText: t("progress_status"),
        };
      case "cancelled":
        return {
          label: t("cancelled") ?? "Cancelled",
          icon: require("@/assets/images/waiting.png"),
          color: Colors.statusCancelled,
          bgColor: Colors.statusCancelledBg,
          progressColor: Colors.statusCancelled,
          progressText: t("progress_status"),
        };
      default:
        return {
          label: t("pending"),
          icon: require("@/assets/images/waiting.png"),
          color: Colors.statusPending,
          bgColor: Colors.statusPendingBg,
          progressColor: Colors.statusPending,
          progressText: t("progress_status"),
        };
    }
  };

  const getStepStatusIcon = (step: ServiceStep, orderStatus: ApiOrderStatus) => {
    switch (step.status) {
      case "completed":
        if (step.id === "ready_for_receiving" && orderStatus === "completed") {
          return <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: Colors.statusCompletedBg,
            justifyContent: "center",
            alignItems: "center",
          }}>
            <View style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: Colors.statusCompleted,
            }} />
          </View>
        }
        return (
          <View style={styles.stepIconCompleted}>
            <Ionicons name="checkmark" size={16} color={Colors.white} />
          </View>
        );
      case "in_progress":
        return (
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#f7f2ec",
            justifyContent: "center",
            alignItems: "center",
          }}>
            <View style={{
              width: 16,
              height: 16,
              borderRadius: 14,
              backgroundColor: Colors.primary,
            }} />
          </View>
        );
      default:
        return <View style={{
          width: 28,
          height: 28,
          borderRadius: 16,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: Colors.border
        }} />;
    }
  };

  if (isLoading && !booking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.appBackground }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            {/* <Image source={require("@/assets/icons/back.png")} style={{ width: 16, height: 16 }} resizeMode="contain" /> */}
            {isRTL ? (
              <MaterialIcons name="arrow-forward-ios" size={24} color={colors.text.primary} />
            ) : (
              <MaterialIcons name="arrow-back-ios" size={24} color={colors.text.primary} />
            )}
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("order")}</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !booking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.appBackground }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            {/* <Image source={require("@/assets/icons/back.png")} style={{ width: 16, height: 16 }} resizeMode="contain" /> */}
            {isRTL ? (
              <MaterialIcons name="arrow-forward-ios" size={24} color={colors.text.primary} />
            ) : (
              <MaterialIcons name="arrow-back-ios" size={24} color={colors.text.primary} />
            )}
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("order")}</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ textAlign: "center", color: colors.text.secondary, fontSize: 16, fontFamily: Fonts.CairoMedium }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.appBackground }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            {/* <Image source={require("@/assets/icons/back.png")} style={{ width: 16, height: 16 }} resizeMode="contain" /> */}
            {isRTL ? (
              <MaterialIcons name="arrow-forward-ios" size={24} color={colors.text.primary} />
            ) : (
              <MaterialIcons name="arrow-back-ios" size={24} color={colors.text.primary} />
            )}
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("order")}</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ textAlign: "center", color: Colors.text.secondary }}>{t("no_recent_activity")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayBooking = booking;
  const statusInfo = getStatusInfo(displayBooking);
  const normalizedPaymentStatus = String(displayBooking.paymentStatus ?? "").toLowerCase();
  const isUnpaid = normalizedPaymentStatus !== "" && normalizedPaymentStatus !== "paid";
  const canPayNow = isUnpaid && displayBooking.status !== "cancelled" && !!displayBooking.total && parseFloat(displayBooking.total) > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.appBackground },
        ]}
      >

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          {/* <Image source={require("@/assets/icons/back.png")}
            style={{ width: 16, height: 16 }}
            resizeMode="contain" /> */}
          {isRTL ? (
            <MaterialIcons name="arrow-forward-ios" size={24} color={colors.text.primary} />
          ) : (
            <MaterialIcons name="arrow-back-ios" size={24} color={colors.text.primary} />
          )}
        </TouchableOpacity>



        <Text style={[styles.headerTitle, { maxWidth: "80%", textAlign: "center", color: colors.text.primary }]} numberOfLines={2}>
          {t("order")} #{displayBooking.orderNumber}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.appBackground }]}
      >
        {/* Current Status */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View
            style={[
              styles.statusHeader,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <Image source={statusInfo.icon} style={{ width: 40, height: 40 }} resizeMode="contain" />

            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusLabel, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                {t("current_status")}
              </Text>
              <Text
                style={[styles.statusValue, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}
              >
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressTextContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.progressText, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                {statusInfo.progressText}
              </Text>
              <Text style={{ textAlign: isRTL ? "left" : "right", color: colors.text.primary }}>{displayBooking.progress}% </Text>
            </View>
            <View style={[styles.progressBarBackground, { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.border + "60" }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${displayBooking.progress}%`,
                    backgroundColor: statusInfo.progressColor,
                  },
                ]}
              />
            </View>

          </View>

          {/* Queue Info (if waiting) */}
          {/* {displayBooking.status === "waiting" && displayBooking.queuePosition && (
            <View style={styles.queueInfo}>
              <Text style={styles.queueLabel}>
                {t("turn")}: {displayBooking.queuePosition}
              </Text>
              <Text style={styles.queueStatusLabel}>
                {t("queue_status")}
              </Text>
            </View>
          )} */}

          {/* Estimated Completion (if in service) */}
          {/* {displayBooking.status === "in_service" && displayBooking.estimatedCompletion && (
            <View style={styles.estimatedInfo}>
              <Text style={styles.estimatedLabel}>
                {t("estimated_completion_time")}
              </Text>
              <Text style={styles.estimatedTime}>
                {displayBooking.estimatedCompletion}
              </Text>
            </View>
          )} */}
        </View>

        {/* QR Code / Barcode */}
        <View style={[styles.qrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.qrTitle, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
            {t("booking_qr_code")}
          </Text>
          <View style={[styles.qrWrapper, { backgroundColor: colors.surface }]}>
            <QRCode
              value={displayBooking.qrcode_payload ?? displayBooking.orderNumber ?? ""}
              size={180}
              backgroundColor={colors.surface}
              color={colors.text.primary}
            />
          </View>
        </View>


        {/* Service Details */}
        <View style={[styles.serviceDetailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View
            style={[
              styles.serviceDetailsHeader,
              { flexDirection: isRTL ? "row-reverse" : "row", alignItems: "flex-start" },
            ]}
          >
            <Image
              source={getServiceImageSource(displayBooking.carImage)}
              style={styles.carImage}
            />
            <View style={[styles.serviceInfo, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
              <View
                style={[
                  styles.serviceTag,
                  { backgroundColor: statusInfo.bgColor, alignSelf: isRTL ? "flex-end" : "flex-start" },
                ]}
              >
                <Text style={[styles.serviceTagText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
              <Text style={[styles.serviceName, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>{displayBooking.serviceName}</Text>
              {displayBooking.carName != null && displayBooking.carName !== "" && (
                <Text style={[styles.licensePlate, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                  {displayBooking.carName}
                </Text>
              )}
              {displayBooking.additionalServices.length > 0 && (
                <Text style={[styles.additionalServices, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                  {displayBooking.additionalServices.join(" + ")}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Service Log */}
        <View style={[styles.serviceLogCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.serviceLogTitle, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
            {t("service_log")}
          </Text>

          {displayBooking.steps.map((step: ServiceStep, index: number) => (
            <View
              key={step.id}
              style={[
                {
                  flexDirection: "row",
                  // marginBottom: 24,
                  // backgroundColor: Colors.primary + "18",
                  // borderRadius: 12,
                  padding: 12,
                },
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <View style={styles.stepIconContainer}>
                {getStepStatusIcon(step, displayBooking.status)}
                {index < displayBooking.steps.length - 1 && (
                  <View
                    style={[
                      {
                        width: 1.5,
                        flex: 1,
                        marginTop: 8,
                        minHeight: 40,
                      },
                      step.status === "completed"
                        ? {
                          backgroundColor: colors.primary
                        }
                        : {
                          backgroundColor: colors.border + "80",
                        },
                    ]}
                  />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepName, {
                  color: step.orderStatus === "completed"
                    && step.id === "ready_for_receiving" ? Colors.statusCompleted : colors.text.primary,
                  textAlign: isRTL ? "right" : "left"
                }]}>
                    {step.id === "created_at" ? t("order_date")
                    : step.id === "ready_for_receiving" ? t("ready_for_receiving")
                    : ["confirmed", "in_progress", "cancelled"].includes(step.id) ? t(step.id) : step.name}
                </Text>
                {/* {step.completedAt && (
                  <Text style={styles.stepTime}>
                    {t("completed")} {step.completedAt}
                  </Text>
                )}
                {step.estimatedAt && (
                  <Text style={styles.stepTime}>
                    {t("estimated")}: {step.estimatedAt}
                  </Text>
                )} */}
                {step.instruction && (
                  <Text style={[styles.stepInstruction, {
                    color: step.orderStatus !== "completed" && step.status !== "completed" && step.status !== "in_progress"
                      ? colors.text.light : colors.text.secondary,
                    textAlign: isRTL ? "right" : "left"
                  }]}>
                    {step.id === "ready_for_receiving"
                      ? (t("please_come_to_receive_your_car")
                        ?? step.instruction) : step.instruction}
                  </Text>
                )}
                {/* {step.status === "pending" && (
                  <Text style={styles.stepTime}>
                    {t("scheduled")}
                  </Text>
                )}
                {step.status === "in_progress" && (
                  <Text style={[styles.stepTime]}>
                    {displayBooking.status === "pending" ? `${t("waiting")}...` : `${t("in_progress")}...`}
                  </Text>
                )} */}
              </View>
            </View>
          ))}
        </View>

        {/* Free Cafe: pending - show info that drink available after confirmation */}
        {displayBooking.hasFreeCafeItem && !displayBooking.freeCafeOrder && displayBooking.status === "pending" && (
          <View style={[styles.freeCafeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.freeCafeCardRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Image source={require("@/assets/icons/cafe.png")} style={styles.freeCafeIcon} resizeMode="contain" />
              <View style={{ flex: 1, alignItems: isRTL ? "flex-end" : "flex-start" }}>
                <Text style={[styles.freeCafeTitle, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}>
                  {t("free_cafe_request")}
                </Text>
                <Text style={[styles.freeCafeStatusText, { color: colors.text.secondary, textAlign: isRTL ? "right" : "left", marginTop: 4 }]}>
                  {t("free_drink_after_confirmed")}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Free Cafe Order (when user has requested free cafe) */}
        {displayBooking.hasFreeCafeItem && displayBooking.freeCafeOrder && (() => {
          const status = displayBooking.freeCafeOrder.cafe_status;
          const statusInfo = status === "pending" ? { color: Colors.statusPending, bgColor: Colors.statusPendingBg, label: t("pending") }
            : ["preparing", "ready"].includes(status) ? { color: Colors.statusInProgress, bgColor: Colors.statusInProgressBg, label: status === "preparing" ? t("preparing") : t("ready") }
            : ["completed", "picked_up"].includes(status) ? { color: Colors.statusCompleted, bgColor: Colors.statusCompletedBg, label: status === "picked_up" ? t("picked_up") : t("completed") }
            : status === "cancelled" ? { color: Colors.statusCancelled, bgColor: Colors.statusCancelledBg, label: t("cancelled") }
            : { color: Colors.statusPending, bgColor: Colors.statusPendingBg, label: status };
          return (
            <View style={[styles.freeCafeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.freeCafeCardRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <Image source={require("@/assets/icons/cafe.png")} style={styles.freeCafeIcon} resizeMode="contain" />
                <View style={{ flex: 1, alignItems: isRTL ? "flex-end" : "flex-start" }}>
                  <Text style={[styles.freeCafeTitle, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}>
                    {t("free_cafe_request")}
                  </Text>
                  <View style={[styles.freeCafeStatusBadge, { backgroundColor: statusInfo.bgColor, alignSelf: isRTL ? "flex-end" : "flex-start" }]}>
                    <Text style={[styles.freeCafeStatusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.freeCafeViewButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push(`/cafe/orders/${displayBooking.freeCafeOrder!.id}`)}
                >
                  <Text style={styles.freeCafeViewButtonText}>{t("view_cafe_order")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtonsContainer, { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.appBackground, borderTopColor: colors.border }]}>
        {canPayNow && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionButton, styles.viewInvoiceButton]}
            onPress={() => {
              router.push({
                pathname: "/booking-payment",
                params: {
                  orderId: displayBooking.id,
                  ticketCode: displayBooking.orderNumber,
                  totalAmount: displayBooking.total,
                  orderType: "service",
                },
              } as any);
            }}
          >
            <Text style={[styles.viewInvoiceText, { color: Colors.white }]}>
              {t("pay_now")}
            </Text>
          </TouchableOpacity>
        )}
        {displayBooking.hasFreeCafeItem && !displayBooking.freeCafeOrder && displayBooking.status !== "pending" && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionButton, styles.viewInvoiceButton]}
            onPress={requestFreeDrink}
            disabled={isCreatingFreeCafeOrder}
          >
            <Text style={[styles.viewInvoiceText, { color: Colors.white }]}>
              {isCreatingFreeCafeOrder ? `${t("loading")}...` : t("request_drink")}
            </Text>
            <Image source={require("@/assets/icons/cafe.png")} style={{ width: 20, height: 20 }} resizeMode="contain" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.actionButton, styles.requestDrinkButton, { backgroundColor: colors.bookingButton, borderColor: colors.border }]}
          onPress={() => {
            if (booking?.id) {
              router.push(`/transaction/${booking.id}`);
            }
          }}
        >
          <Text style={[styles.requestDrinkText, { color: colors.bookingButtonText ?? colors.text.primary }]}>
            {t("view_invoice")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
