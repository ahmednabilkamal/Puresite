import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { bookingService } from "@/services/booking-service";
import { storage } from "@/utils/storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import moment from "moment";
import "moment/locale/ar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import styles from "./styles";


export default function BookingDateScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);

  const isSubmittingRef = useRef(false);
  const dateScrollRef = useRef<ScrollView>(null);

  const [workingDays, setWorkingDays] = useState<import('@/services/booking-service').WorkingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    moment.locale(i18n.language === "ar" ? "ar" : "en");
  }, [i18n.language]);

  const fetchSlots = async () => {
    try {
      const data = await bookingService.getAvailableSlots();
      setWorkingDays(data);
      if (data.length > 0) {
        setSelectedDateStr((prev) =>
          prev === "" || !data.some((d) => d.date === prev) ? data[0].date : prev
        );
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const todayStr = moment().format("YYYY-MM-DD");
  const daysArr = (t("days_short") || "Sun,Mon,Tue,Wed,Thu,Fri,Sat").split(",");
  const dateRowDays = workingDays.map((d) => {
    const isToday = d.date === todayStr;
    const dateObj = moment(d.date);
    const dateNum = dateObj.date();
    const dayShort = daysArr[dateObj.day()] ?? dateObj.format("ddd");
    return {
      fullDate: d.date,
      label: isToday ? t("today") : dayShort,
      dateNum,
    };
  });

  const selectedDayData = workingDays.find((d) => d.date === selectedDateStr);
  const allSlots = selectedDayData?.slots
    ? [...selectedDayData.slots].sort((a, b) => {
      const [ha, ma] = a.time.split(":").map(Number);
      const [hb, mb] = b.time.split(":").map(Number);
      return ha * 60 + (ma || 0) - (hb * 60 + (mb || 0));
    })
    : [];

  const monthYearLabel =
    workingDays.length > 0 && workingDays[0]?.date
      ? moment(workingDays[0].date).format("MMMM YYYY")
      : "";

  const params = useLocalSearchParams();
  const vipFastTrack =
    params.vipFastTrack === "1" ||
    (Array.isArray(params.vipFastTrack) && params.vipFastTrack[0] === "1");

  const handleConfirmBooking = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    if (isConfirming) {
      isSubmittingRef.current = false;
      return;
    }

    const serviceId = typeof params.serviceId === "string" ? params.serviceId : params.serviceId?.[0];
    const carSize = (typeof params.carSize === "string" ? params.carSize : params.carSize?.[0]) || "medium";
    const addonIdsRaw = typeof params.addonIds === "string" ? params.addonIds : params.addonIds?.[0];
    const carIdParam = typeof params.carId === "string" ? params.carId : params.carId?.[0];
    const carId = carIdParam ? Number(carIdParam) : Number(await storage.getItem("selected_car_id"));

    if (!serviceId) {
      isSubmittingRef.current = false;
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("missing_car_or_service"),
      });
      return;
    }
    if (!vipFastTrack && selectedSlotId == null) {
      isSubmittingRef.current = false;
      alert(t("please_select_date_and_time"));
      return;
    }
    if (!Number.isFinite(carId) || carId <= 0) {
      isSubmittingRef.current = false;
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("please_select_car") || "Please select a car",
      });
      return;
    }

    const addons: { addon_id: number; qty: number }[] = addonIdsRaw
      ? addonIdsRaw
        .split(",")
        .map((id) => ({ addon_id: parseInt(id.trim(), 10), qty: 1 }))
        .filter((a) => Number.isFinite(a.addon_id))
      : [];

    try {
      setIsConfirming(true);
      const orderPayload = {
        service_id: Number(serviceId),
        car_id: carId,
        car_size: carSize,
        addons,
        pay_with_moyasar: false,
        is_fast_track: vipFastTrack,
        ...(!vipFastTrack && selectedSlotId != null && { slot_id: Number(selectedSlotId) }),
      };
      const order = await bookingService.createServiceOrder(orderPayload);
      const orderId = order?.id ?? order?.ticket_code;
      if (orderId != null && order) {
        const total =
          typeof params.totalAmount === "string"
            ? params.totalAmount
            : params.totalAmount != null
              ? String(params.totalAmount)
              : order.total;
        router.push({
          pathname: "/booking-payment",
          params: {
            orderId: String(orderId),
            ticketCode: order.ticket_code ?? "",
            totalAmount: total ?? "",
          },
        });
      } else {
        setShowBookingConfirmation(true);
      }
    } catch (error) {
      console.error("Error creating service order:", error);
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: msg || t("failed_to_create_booking"),
      });
    } finally {
      setIsConfirming(false);
      isSubmittingRef.current = false;
    }
  }, [router, selectedSlotId, isConfirming, params, t, vipFastTrack]);

  const triggerConfirm = useCallback(() => {
    if (!vipFastTrack && (!selectedDateStr || selectedSlotId == null)) {
      alert(t("please_select_date_and_time"));
      return;
    }
    const serviceId = typeof params.serviceId === "string" ? params.serviceId : params.serviceId?.[0];
    if (!serviceId) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("missing_car_or_service"),
      });
      return;
    }
    if (!vipFastTrack && selectedSlotId == null) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("invalid_slot"),
      });
      return;
    }
    handleConfirmBooking();
  }, [handleConfirmBooking, params.serviceId, selectedDateStr, selectedSlotId, vipFastTrack, t]);

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const is12h = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const suffix = h >= 12 ? t("pm") : t("am");
    return `${is12h}:${String(m || 0).padStart(2, "0")} ${suffix}`;
  };

  const hasSlotsForDate = (dateStr: string) =>
    workingDays.some((d) => d.date === dateStr);
  const isSelectedDate = (dateStr: string) => selectedDateStr === dateStr;
  const selectDate = (dateStr: string) => {
    if (!hasSlotsForDate(dateStr)) return;
    setSelectedDateStr(dateStr);
    setSelectedSlotId(null);
  };
  const selectSlot = (slot: import("@/services/booking-service").TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlotId(slot.slot_id ?? slot.id);
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
          {/* <Image source={require("@/assets/icons/back.png")}
              style={{ width: 16, height: 16 }}
              resizeMode="contain" /> */}
          {isRTL ? (
            <MaterialIcons name="arrow-forward-ios" size={24} color={colors.text.primary} />
          ) : (
            <MaterialIcons name="arrow-back-ios" size={24} color={colors.text.primary} />
          )}
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t("book_service_appointment")}
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push("/notifications")}
        >
          <Image source={require("@/assets/images/notification.png")}
            style={{ width: 24, height: 24 }}
            resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {/* Date & Time Card */}
        <View style={[styles.calendarCard, { backgroundColor: colors.surface }]}>
          {isLoading ? (
            <View style={{ paddingVertical: 32, alignItems: "center" }}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <>
              <Text style={[
                styles.monthYear,
                { color: Colors.primary, marginBottom: 16, textAlign: isRTL ? "right" : "left" },
              ]}>
                {monthYearLabel}
              </Text>
              {/* Horizontal date row: Today, Mon 16, Tue 17, ... (RTL starts from right) */}
              <ScrollView
                ref={dateScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  { gap: 8, paddingBottom: 16, marginBottom: 8 },
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
                style={{ marginHorizontal: -4 }}
                onContentSizeChange={() => {
                  if (isRTL) {
                    dateScrollRef.current?.scrollToEnd({ animated: false });
                  }
                }}
              >
                {dateRowDays.map((day) => {
                  const selected = isSelectedDate(day.fullDate);
                  return (
                    <TouchableOpacity
                      key={day.fullDate}
                      onPress={() => selectDate(day.fullDate)}
                      style={[
                        styles.dateRowDay,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        selected && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateRowDayLabel,
                          { color: selected ? "#fff" : colors.text.secondary },
                          selected && { fontFamily: Fonts.CairoSemiBold },
                        ]}
                      >
                        {day.label}
                      </Text>
                      <Text
                        style={[
                          styles.dateRowDayNum,
                          { color: selected ? "#fff" : colors.text.primary },
                          selected && { fontFamily: Fonts.CairoBold },
                        ]}
                      >
                        {day.dateNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {/* Time slots - single grid, no categories */}
              <View style={[styles.timeSlotsGrid, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                {allSlots.length > 0 ? (
                  allSlots.map((slot, index) => {
                    const sid = slot.slot_id ?? slot.id;
                    const isSelected = selectedSlotId === sid;
                    const isDisabled = !slot.available;
                    return (
                      <TouchableOpacity
                        key={slot.id ?? index}
                        style={[
                          styles.timeSlot,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          isSelected && styles.timeSlotSelected,
                          isDisabled && styles.timeSlotDisabled,
                        ]}
                        onPress={() => selectSlot(slot)}
                        disabled={isDisabled}
                      >
                        <Text
                          style={[
                            styles.timeSlotText,
                            { color: isDisabled ? colors.text.light : colors.text.primary },
                            isSelected && styles.timeSlotTextSelected,
                            isDisabled && styles.timeSlotTextDisabled,
                          ]}
                        >
                          {formatTimeDisplay(slot.time)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={{
                    color: colors.text.secondary,
                    padding: 10,
                    textAlign: isRTL ? "right" : "left",
                    width: "100%",
                    fontFamily: Fonts.CairoMedium,
                  }}>
                    {t("no_slots_available")}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>

      </ScrollView>

      {/* Confirm button – calls POST /service-orders */}
      <View style={[styles.swipeContainer, { backgroundColor: colors.appBackground }]}>
        <Pressable
          style={[styles.swipeTrack, { width: "80%", alignSelf: "center" }]}
          onPress={triggerConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? (
            <ActivityIndicator size="small" color={Colors.white} style={{ flex: 1 }} />
          ) : (
            <View style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              alignItems: "center",
              flex: 1,
            }}>
              <Text style={styles.swipeText}>
                {t("swipe_to_confirm_booking")}
              </Text>
              {/* <View
                style={[
                  styles.swipeHandle,
                  !isRTL ? { left: "-24%" } : { right: "-28%" },
                ]}
              >
                <Ionicons
                  name={!isRTL ? "chevron-forward" : "chevron-back"}
                  size={20}
                  color={Colors.primary}
                />
              </View> */}
            </View>
          )}
        </Pressable>

        {/* Booking Status Legend */}
        <View
          style={[
            styles.legendContainer,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <View style={[styles.legendItem, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.legendDot, styles.legendDotBooked]} />
            <Text style={[styles.legendText, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
              {t("booked")}
            </Text>
          </View>
          <View style={[styles.legendItem, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.legendDot, styles.legendDotSelected]} />
            <Text style={[styles.legendText, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
              {t("selected")}
            </Text>
          </View>
          <View style={[styles.legendItem, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.legendDot, styles.legendDotAvailable]} />
            <Text style={[styles.legendText, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
              {t("available")}
            </Text>
          </View>
        </View>
      </View>

      {showBookingConfirmation && (
        <View style={styles.bookingOverlay}>
          <View style={[styles.bookingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.bookingIconWrapper}>
              <View style={styles.bookingIconCircleOuter}>
                <View style={styles.bookingIconCircleInner}>
                  <Image source={require("@/assets/images/success_booking.png")}
                    style={{ width: 100, height: 100 }} resizeMode="contain" />
                  {/* <Ionicons name="checkmark" size={40} color={Colors.white} /> */}
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
