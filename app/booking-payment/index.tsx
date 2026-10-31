import { API_CONFIG } from "@/constants/api";
import { Fonts } from "@/constants/fonts";
import {
  MOYASAR_APPLE_PAY_LABEL,
  MOYASAR_APPLE_PAY_MERCHANT_ID,
  MOYASAR_BASE_URL,
  MOYASAR_PUBLISHABLE_KEY,
} from "@/constants/payment";
import { bookingService } from "@/services/booking-service";
import CardBrandIcon from "@/components/CardBrandIcon";
import { paymentService, type SavedCard } from "@/services/payment-service";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ApplePay,
  ApplePayConfig,
  CreditCard,
  CreditCardConfig,
  PaymentConfig,
  PaymentResponse,
  PaymentStatus,
  StcPay,
} from "react-native-moyasar-sdk";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import Toast from "react-native-toast-message";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAuthStore } from "@/store/auth-store";
import { getMoyasarFormStyle } from "@/utils/moyasar-form-style";

type PaymentMethod = "credit" | "stc";
type CardSource = "saved" | "new";

export default function BookingPaymentScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const appColorScheme = useColorScheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId?: string;
    ticketCode?: string;
    totalAmount?: string;
    orderType?: string;
  }>();
  const isRTL = i18n.language === "ar";

  const orderId = typeof params.orderId === "string" ? params.orderId : params.orderId?.[0];
  const ticketCode = typeof params.ticketCode === "string" ? params.ticketCode : params.ticketCode?.[0];
  const totalAmount = typeof params.totalAmount === "string" ? params.totalAmount : params.totalAmount?.[0];
  const orderType = typeof params.orderType === "string" ? params.orderType : params.orderType?.[0];
  const isCafeOrder = orderType === "cafe";
  const user = useAuthStore((s) => s.user);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [cardSource, setCardSource] = useState<CardSource>("new");
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<number | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [savedCardsLoading, setSavedCardsLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);

  const apiBaseUrl = API_CONFIG.BASE_URL.replace("/api/v1", "").replace("/api", "");
  const successUrlPattern = `${apiBaseUrl}/payment/success`;
  const failureUrlPattern = `${apiBaseUrl}/payment/failure`;

  const fetchSavedCards = useCallback(async () => {
    try {
      setSavedCardsLoading(true);
      const cards = await paymentService.getSavedCards();
      setSavedCards(cards);
      if (cards.length > 0 && cardSource === "saved" && !selectedSavedCardId) {
        setSelectedSavedCardId(cards[0].id);
      }
    } catch (err) {
      console.error("Fetch saved cards error:", err);
    } finally {
      setSavedCardsLoading(false);
    }
  }, [cardSource, selectedSavedCardId]);

  useEffect(() => {
    fetchSavedCards();
  }, [fetchSavedCards]);

  const moyasarFormStyle = useMemo(
    () => getMoyasarFormStyle(colors, appColorScheme),
    [colors, appColorScheme]
  );

  const paymentConfig = useMemo(() => {
    if (!orderId) return null;
    const totalStr = totalAmount ?? "0";
    const totalNum = parseFloat(totalStr);
    const amountHalalas = Math.round(Number.isFinite(totalNum) ? totalNum * 100 : 0);
    if (amountHalalas <= 0) return null;
    const metadata: Record<string, string> = {
      order_type: isCafeOrder ? "cafe_order" : "service_order",
      order_id: String(orderId),
      ticket_code: ticketCode ?? "",
    };
    if (user?.id) metadata.user_id = String(user.id);
    return new PaymentConfig({
      publishableApiKey: MOYASAR_PUBLISHABLE_KEY,
      baseUrl: MOYASAR_BASE_URL,
      amount: amountHalalas,
      currency: "SAR",
      merchantCountryCode: "SA",
      description: `${t("payment")} - ${ticketCode ?? `#${orderId}`}`,
      metadata,
      supportedNetworks: ["mada", "visa", "mastercard", "amex"],
      applePay: new ApplePayConfig({
        merchantId: MOYASAR_APPLE_PAY_MERCHANT_ID,
        label: MOYASAR_APPLE_PAY_LABEL,
        manual: false,
        saveCard: false,
      }),
      creditCard: new CreditCardConfig({ saveCard: false, manual: false }),
    });
  }, [orderId, ticketCode, totalAmount, t, isCafeOrder, user?.id]);

  const handlePayWithSavedCard = async () => {
    if (!orderId || !selectedSavedCardId || isPaymentLoading) return;
    setIsPaymentLoading(true);
    try {
      const orderTypeParam = isCafeOrder ? "cafe_order" : "service_order";
      const result = await paymentService.initiatePayment({
        orderType: orderTypeParam,
        orderId: Number(orderId),
        saved_card_id: selectedSavedCardId,
      });

      if (result.status === "paid") {
        setShowPaymentSuccess(true);
      } else if (result.payment_url) {
        setWebViewUrl(result.payment_url);
        setShowWebView(true);
      } else {
        Toast.show({ type: "error", text1: t("error"), text2: t("payment_failed") });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (err as { message?: string })?.message ?? t("payment_failed");
      Toast.show({ type: "error", text1: t("error"), text2: msg });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleWebViewNavigation = (navState: { url?: string }) => {
    const url = navState.url ?? "";
    if (url.includes(successUrlPattern) || url.includes("/payment/success")) {
      setShowWebView(false);
      setWebViewUrl(null);
      setShowPaymentSuccess(true);
    } else if (url.includes(failureUrlPattern) || url.includes("/payment/failure")) {
      setShowWebView(false);
      setWebViewUrl(null);
      Toast.show({ type: "error", text1: t("error"), text2: t("payment_failed") });
    }
  };

  const handleDeleteCard = async (id: number) => {
    try {
      await paymentService.deleteSavedCard(id);
      setSavedCards((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (selectedSavedCardId === id) {
          setSelectedSavedCardId(remaining[0]?.id ?? null);
        }
        return remaining;
      });
      Toast.show({ type: "success", text1: t("success"), text2: "Card removed" });
    } catch {
      Toast.show({ type: "error", text1: t("error"), text2: t("payment_failed") });
    }
  };

  const onPaymentResult = async (
    paymentResult: import("react-native-moyasar-sdk").PaymentResult,
    selectedMethod: "credit" | "stc" | "apple",
  ) => {
    if (paymentResult instanceof PaymentResponse) {
      if (paymentResult.status === PaymentStatus.paid) {
        setIsPaymentLoading(false);

        if (!isCafeOrder) {
          const serviceOrderId = orderId ? Number(orderId) : 0;
          const amount = parseFloat(totalAmount ?? "0") || 0;
          const transactionId =
            (paymentResult as PaymentResponse & { id?: string }).id ??
            `TXN-${orderId}-${Date.now()}`;
          try {
            await bookingService.submitTransaction({
              service_order_id: serviceOrderId,
              transaction_id: transactionId,
              amount,
              currency: "SAR",
              payment_method:
                selectedMethod === "credit"
                  ? "credit_card"
                  : selectedMethod === "apple"
                    ? "apple_pay"
                    : "stc_pay",
              payment_gateway: "moyasar",
            });
          } catch (err) {
            console.error("Transaction API error:", err);
            Toast.show({
              type: "error",
              text1: t("error"),
              text2: t("transaction_record_failed") ?? "Payment succeeded but recording failed.",
            });
          }
        }
        setShowPaymentSuccess(true);
      } else if (paymentResult.status === PaymentStatus.failed) {
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("payment_failed"),
        });
        setTimeout(() => setIsPaymentLoading(false), 800);
      } else {
        setTimeout(() => setIsPaymentLoading(false), 800);
      }
    } else {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("payment_failed"),
      });
      setTimeout(() => setIsPaymentLoading(false), 800);
    }
  };

  if (!orderId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <MaterialIcons
              name={isRTL ? "arrow-forward-ios" : "arrow-back-ios"}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("payment")}</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.text.secondary, fontSize: 16, fontFamily: Fonts.CairoMedium }}>{t("failed_to_load_service")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <MaterialIcons
            name={isRTL ? "arrow-forward-ios" : "arrow-back-ios"}
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("payment")}</Text>
        <View style={styles.headerButton} />
      </View>

      {paymentConfig ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Order Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.summaryRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>
                {t("order_number")}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text.primary }]}>
                {ticketCode ?? `#${orderId}`}
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={[styles.summaryRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>{t("total")}</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                {totalAmount ?? "0"} SAR
              </Text>
            </View>
          </View>

          {/* Payment Method Section */}
          <Text style={[styles.sectionTitle, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}>
            {t("payment_methods")}
          </Text>

          {/* Saved cards / Use new card */}
          <View style={styles.savedCardsSection}>
            <Text style={[styles.sectionLabel, { color: colors.text.secondary, textAlign: isRTL ? "right" : "left" }]}>
              {t("saved_cards")}
            </Text>
            {savedCardsLoading ? (
              <View style={[styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : savedCards.length > 0 ? (
              <View style={styles.cardsList}>
                {savedCards.map((card) => (
                  <Pressable
                    key={card.id}
                    style={[
                      styles.cardRow,
                      { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.surface, borderColor: colors.border },
                      selectedSavedCardId === card.id && cardSource === "saved" && { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
                    ]}
                    onPress={() => {
                      setCardSource("saved");
                      setSelectedSavedCardId(card.id);
                    }}
                  >
                    <View style={{ marginHorizontal: 12 }}>
                      <CardBrandIcon brand={card.brand} width={36} height={24} />
                    </View>
                    <Text style={[styles.cardText, { flex: 1, color: colors.text.primary }]}>
                      **** {card.last_four} ({card.brand || "card"})
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteCard(card.id)}
                      style={{ padding: 8 }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </Pressable>
                ))}
                <Pressable
                  style={[
                    styles.cardRow,
                    { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.surface, borderColor: colors.border },
                    cardSource === "new" && { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
                  ]}
                  onPress={() => setCardSource("new")}
                >
                  <Ionicons name="add-circle-outline" size={24} color={colors.primary} style={{ marginHorizontal: 12 }} />
                  <Text style={[styles.cardText, { color: colors.text.primary }]}>{t("use_new_card")}</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={[styles.noCardsText, { color: colors.text.secondary, textAlign: isRTL ? "right" : "left" }]}>
                {t("no_saved_cards")}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.addCardButton, { flexDirection: isRTL ? "row-reverse" : "row" }]}
              onPress={() => router.push("/add-card")}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={[styles.addCardButtonText, { color: colors.primary }]}>{t("add_card")}</Text>
            </TouchableOpacity>
          </View>

          {/* Pay with saved card button */}
          {cardSource === "saved" && savedCards.length > 0 && selectedSavedCardId && (
            <TouchableOpacity
              style={[styles.paySavedButton, isPaymentLoading && styles.paySavedButtonDisabled]}
              onPress={handlePayWithSavedCard}
              disabled={isPaymentLoading}
              activeOpacity={0.8}
            >
              {isPaymentLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.paySavedButtonText}>{t("checkout")}</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Credit card / STC form - shown when "Use new card" */}
          {cardSource === "new" && (
            <>
              <View style={[styles.directPayDivider, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <View style={[styles.directPayDividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.directPayDividerText, { color: colors.text.secondary }]}>
                  {isRTL ? "أو الدفع مباشرة" : "Or pay directly"}
                </Text>
                <View style={[styles.directPayDividerLine, { backgroundColor: colors.border }]} />
              </View>

              {isPaymentLoading && (
                <View
                  style={StyleSheet.absoluteFill}
                  pointerEvents="auto"
                  onStartShouldSetResponder={() => true}
                />
              )}

              <View style={styles.methodsList}>
                {Platform.OS === "ios" && (
                  <View style={styles.applePaySection}>
                    <ApplePay
                      paymentConfig={paymentConfig}
                      onPaymentResult={(result) => onPaymentResult(result, "apple")}
                      style={{
                        width: "100%",
                        height: 52,
                        cornerRadius: 12,
                      }}
                    />
                    <View style={[styles.directPayDivider, { flexDirection: isRTL ? "row-reverse" : "row", marginBottom: 4 }]}>
                      <View style={[styles.directPayDividerLine, { backgroundColor: colors.border }]} />
                      <Text style={[styles.directPayDividerText, { color: colors.text.secondary }]}>
                        {isRTL ? "أو استخدم بطاقة" : "Or use card or STC"}
                      </Text>
                      <View style={[styles.directPayDividerLine, { backgroundColor: colors.border }]} />
                    </View>
                  </View>
                )}

                <Pressable
                  style={[
                    styles.methodOption,
                    { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: isRTL ? "row-reverse" : "row" },
                    paymentMethod === "credit" && { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
                    isPaymentLoading && styles.tabButtonDisabled,
                  ]}
                  onPress={() => !isPaymentLoading && setPaymentMethod("credit")}
                  disabled={isPaymentLoading}
                >
                  <View style={[styles.methodOptionLeft, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <View style={[styles.methodIconsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                      <CardBrandIcon brand="visa" width={30} height={20} />
                      <CardBrandIcon brand="mastercard" width={30} height={20} />
                    </View>
                    <Text style={[styles.methodOptionLabel, { color: colors.text.primary }]}>
                      {t("credit_card")}
                    </Text>
                  </View>
                  <Ionicons
                    name={paymentMethod === "credit" ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={paymentMethod === "credit" ? colors.primary : colors.text.secondary}
                  />
                </Pressable>

                <Pressable
                  style={[
                    styles.methodOption,
                    { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: isRTL ? "row-reverse" : "row" },
                    paymentMethod === "stc" && { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
                    isPaymentLoading && styles.tabButtonDisabled,
                  ]}
                  onPress={() => !isPaymentLoading && setPaymentMethod("stc")}
                  disabled={isPaymentLoading}
                >
                  <View style={[styles.methodOptionLeft, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <View style={[styles.stcBadge, { borderColor: colors.border }]}>
                      <Text style={[styles.stcBadgeText, { color: colors.text.primary }]}>stc</Text>
                    </View>
                    <Text style={[styles.methodOptionLabel, { color: colors.text.primary }]}>
                      {t("stc_pay")}
                    </Text>
                  </View>
                  <Ionicons
                    name={paymentMethod === "stc" ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={paymentMethod === "stc" ? colors.primary : colors.text.secondary}
                  />
                </Pressable>
              </View>

              <View style={styles.formCard}>
                {paymentMethod === "credit" ? (
                  <CreditCard
                    paymentConfig={paymentConfig}
                    onPaymentResult={(result) => onPaymentResult(result, "credit")}
                    style={moyasarFormStyle}
                  />
                ) : (
                  <StcPay
                    paymentConfig={paymentConfig}
                    onPaymentResult={(result) => onPaymentResult(result, "stc")}
                    style={moyasarFormStyle}
                  />
                )}
              </View>
            </>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.text.secondary }}>{t("invalid_amount")}</Text>
        </View>
      )}

      {/* WebView modal for 3DS */}
      <Modal visible={showWebView} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={[styles.webViewHeader, { flexDirection: isRTL ? "row-reverse" : "row", borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setShowWebView(false);
                setWebViewUrl(null);
              }}
            >
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.webViewHeaderTitle, { color: colors.text.primary }]}>{t("payment")}</Text>
          </View>
          {webViewUrl && (
            <WebView
              source={{ uri: webViewUrl }}
              style={{ flex: 1 }}
              onNavigationStateChange={handleWebViewNavigation}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Success Modal */}
      {showPaymentSuccess && (
        <View style={styles.bookingOverlay}>
          <View style={[styles.bookingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.bookingIconWrapper}>
              <View style={styles.bookingIconCircleOuter}>
                <View style={styles.bookingIconCircleInner}>
                  <Image
                    source={require("@/assets/images/success_booking.png")}
                    style={{ width: 100, height: 100 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
            <Text style={[styles.bookingTitle, { textAlign: "center", color: colors.text.primary }]}>
              {t("booking_confirmed_title")}
            </Text>
            <Text style={[styles.bookingSubtitle, { textAlign: "center", color: colors.text.secondary }]}>
              {isCafeOrder ? t("cafe_order_confirmed_message") : t("booking_confirmed_message")}
            </Text>
            {orderId ? (
              <TouchableOpacity
                style={styles.bookingActionButton}
                onPress={() => {
                  setShowPaymentSuccess(false);
                  if (isCafeOrder) {
                    router.dismissTo(`/cafe/orders/${orderId}` as any);
                  } else {
                    router.dismissTo(`/booking-details?id=${orderId}` as any);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.bookingActionButtonText}>
                  {t("view_order")}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.bookingActionButton}
                onPress={() => {
                  setShowPaymentSuccess(false);
                  router.dismissTo("/(tabs)/home");
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.bookingActionButtonText}>
                  {t("back_to_home")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.CairoSemiBold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
  },
  summaryValue: {
    fontSize: 15,
    fontFamily: Fonts.CairoSemiBold,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  totalAmount: {
    fontSize: 22,
    fontFamily: Fonts.CairoBold,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.CairoSemiBold,
    marginBottom: 12,
  },
  savedCardsSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: Fonts.CairoMedium,
    marginBottom: 10,
  },
  cardsList: {
    gap: 10,
  },
  loadingCard: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  cardRow: {
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: 15,
    fontFamily: Fonts.CairoSemiBold,
  },
  noCardsText: {
    fontSize: 13,
    fontFamily: Fonts.CairoRegular,
    marginVertical: 10,
  },
  addCardButton: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 10,
  },
  addCardButtonText: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    marginHorizontal: 8,
  },
  paySavedButton: {
    backgroundColor: "#D28F3D",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#D28F3D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  paySavedButtonDisabled: {
    opacity: 0.7,
  },
  paySavedButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoBold,
    color: "#fff",
  },
  directPayDivider: {
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  directPayDividerLine: {
    flex: 1,
    height: 1,
  },
  directPayDividerText: {
    fontSize: 13,
    fontFamily: Fonts.CairoRegular,
  },
  methodsList: {
    gap: 10,
    marginBottom: 14,
  },
  applePaySection: {
    gap: 12,
    marginBottom: 2,
  },
  methodOption: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  methodOptionLeft: {
    alignItems: "center",
    gap: 10,
  },
  methodOptionLabel: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
  },
  methodIconsRow: {
    alignItems: "center",
    gap: 6,
  },
  stcBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stcBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.CairoBold,
    textTransform: "lowercase",
  },
  tabRow: {
    paddingBottom: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tabButtonDisabled: {
    opacity: 0.6,
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
  },
  tabButtonTextActive: {
    color: "#fff",
  },
  tabButtonTextDisabled: {
    opacity: 0.8,
  },
  formCard: {
    paddingTop: 8,
  },
  webViewHeader: {
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  webViewHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: Fonts.CairoSemiBold,
    textAlign: "center",
  },
  bookingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  bookingCard: {
    width: "100%",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  bookingIconWrapper: {
    marginBottom: 24,
  },
  bookingIconCircleOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E3FCEC",
    justifyContent: "center",
    alignItems: "center",
  },
  bookingIconCircleInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  bookingTitle: {
    fontSize: 24,
    fontFamily: Fonts.CairoBold,
    marginBottom: 8,
  },
  bookingSubtitle: {
    fontSize: 15,
    fontFamily: Fonts.AlmaraiRegular,
    marginBottom: 24,
    lineHeight: 22,
  },
  bookingActionButton: {
    width: "100%",
    backgroundColor: "#D28F3D",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingActionButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoMedium,
    color: "#fff",
  },
});
