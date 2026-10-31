import { Colors } from "@/constants/colors";
import { ThemeColors, useThemeColors } from "@/hooks/use-theme-colors";
import { Fonts } from "@/constants/fonts";
import {
  bookingService,
  TransactionInvoice,
} from "@/services/booking-service";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionInvoiceScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isRTL = i18n.language === "ar";
  const serviceOrderId = typeof params.id === "string" ? params.id : params.id?.[0];

  const [data, setData] = useState<TransactionInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = useCallback(async () => {
    if (!serviceOrderId) {
      setError(t("missing_order_id"));
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const result = await bookingService.getTransactionByServiceOrderId(serviceOrderId);
      setData(result);
    } catch (err) {
      console.error("Transaction fetch error:", err);
      setError((err as Error)?.message ?? t("failed_to_load_invoice") ?? "Failed to load invoice");
    } finally {
      setIsLoading(false);
    }
  }, [serviceOrderId, t]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  if (!serviceOrderId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }, isRTL && styles.containerRTL]} edges={["top"]}>
        <View style={[styles.header, isRTL && styles.headerRTL, { backgroundColor: colors.appBackground }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <MaterialIcons
              name={isRTL ? "arrow-forward-ios" : "arrow-back-ios"}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isRTL && styles.headerTitleRTL, { color: colors.text.primary }]}>{t("invoice")}</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.centered}>
          <Text style={[styles.errorText, isRTL && styles.textRTL, { color: colors.text.secondary }]}>{t("missing_order_id")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
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



        <Text style={[styles.headerTitle, { maxWidth: "80%", textAlign: 'center', color: colors.text.primary }]} numberOfLines={2}  >
          {t("invoice")}
        </Text>
        <View style={styles.headerButton} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, isRTL && styles.textRTL, { color: colors.text.secondary }]}>{error}</Text>
        </View>
      ) : data ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, isRTL && styles.scrollContentRTL]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title & Date */}
          <View style={[styles.card, styles.invoiceHeader, isRTL && styles.cardRTL, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.invoiceTitle, isRTL && styles.textRTL, { color: colors.text.primary }]}>{data.title ?? t("invoice")}</Text>
            {data.date_formatted != null && (
              <Text style={[styles.invoiceDate, isRTL ? styles.textRight : styles.textLeft, { color: colors.text.secondary }]}>
                {data.date_formatted}
              </Text>
            )}
            {data.order_id != null && (
              <Text style={[styles.invoiceOrderId, isRTL ? styles.textRight : styles.textLeft, { color: colors.text.primary }]}>
                {t("order_number")}#{data.order_id}
              </Text>
            )}
          </View>

          {/* Customer */}
          {data.customer && (
            <View style={[styles.card, isRTL && styles.cardRTL, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, isRTL ? styles.textRight : styles.textLeft, { color: colors.text.primary }]}>
                {t("customer")}
              </Text>
              {data.customer.name ? (
                <Row isRTL={isRTL} label={t("name")} value={data.customer.name} colors={colors} />
              ) : null}
              {data.customer.phone ? (
                <Row isRTL={isRTL} label={t("phone_number")} value={data.customer.phone} colors={colors} />
              ) : null}
              {data.customer.email ? (
                <Row isRTL={isRTL} label={t("email")} value={data.customer.email} colors={colors} />
              ) : null}
            </View>
          )}

          {/* Order details */}
          {data.order_details && (
            <View style={[styles.card, isRTL && styles.cardRTL, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, isRTL ? styles.textRight : styles.textLeft, { color: colors.text.primary }]}>
                {t("order_details")}
              </Text>
              <Row isRTL={isRTL} label={t("status")} value={data.order_details.status} colors={colors} />
              <Row isRTL={isRTL} label={t("payment_status")} value={data.order_details.payment_status} colors={colors} />
              {data.order_details.scheduled_at ? (
                <Row isRTL={isRTL} label={t("scheduled_at")} value={data.order_details.scheduled_at} colors={colors} />
              ) : null}
              {data.order_details.ticket_code ? (
                <Row isRTL={isRTL} label={t("ticket_code")} value={data.order_details.ticket_code} colors={colors} />
              ) : null}
              {data.order_details.is_fast_track != null && (
                <Row isRTL={isRTL} label={t("fast_track")} value={data.order_details.is_fast_track ? t("yes") : t("no")} colors={colors} />
              )}
            </View>
          )}

          {/* Line items */}
          {data.line_items && data.line_items.length > 0 && (
            <View style={[styles.card, isRTL && styles.cardRTL, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, isRTL ? styles.textRight : styles.textLeft, { color: colors.text.primary }]}>
                {t("items")}
              </Text>
              {data.line_items.map((item, idx) => (
                <View key={idx} style={[styles.lineItem, isRTL && styles.rowReverse, { borderBottomColor: colors.border }]}>
                  <View style={styles.lineItemDescWrap}>
                    <Text style={[styles.lineItemDesc, isRTL ? styles.textRight : styles.textLeft, { color: colors.text.primary }]}>{item.description}</Text>
                    {item.detail ? (
                      <Text style={[styles.lineItemDetail, isRTL ? styles.textRight : styles.textLeft, { color: colors.text.secondary }]}>{item.detail}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.lineItemQty, isRTL ? styles.textLeft : styles.textRight, { color: colors.text.secondary }]}>{item.qty}</Text>
                  <Text style={[styles.lineItemPrice, isRTL ? styles.textLeft : styles.textRight, { color: colors.text.secondary }]}>
                    {item.unit_price} {data.currency ?? "SAR"}
                  </Text>
                  <Text style={[styles.lineItemTotal, isRTL ? styles.textLeft : styles.textRight, { color: colors.text.primary }]}>
                    {item.total_price} {data.currency ?? "SAR"}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Addons */}
          {data.addons && data.addons.length > 0 && (
            <View style={[styles.card, isRTL && styles.cardRTL, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, isRTL ? styles.textRight : styles.textLeft, { color: colors.text.primary }]}>
                {t("addons")}
              </Text>
              {data.addons.map((item, idx) => (
                <View key={idx} style={[styles.lineItem, isRTL && styles.rowReverse, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.lineItemDesc, styles.lineItemDescFlex, isRTL ? styles.textRight : styles.textLeft, { color: colors.text.primary }]}>{item.name}</Text>
                  <Text style={[styles.lineItemQty, isRTL ? styles.textLeft : styles.textRight, { color: colors.text.secondary }]}>{item.qty}</Text>
                  <Text style={[styles.lineItemPrice, isRTL ? styles.textLeft : styles.textRight, { color: colors.text.secondary }]}>
                    {item.unit_price} {data.currency ?? "SAR"}
                  </Text>
                  <Text style={[styles.lineItemTotal, isRTL ? styles.textLeft : styles.textRight, { color: colors.text.primary }]}>
                    {item.total_price} {data.currency ?? "SAR"}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Totals */}
          <View style={[styles.card, isRTL && styles.cardRTL, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {data.subtotal != null && (
              <Row isRTL={isRTL} label={t("subtotal")} value={`${data.subtotal} ${data.currency ?? "SAR"}`} colors={colors} />
            )}
            {data.discount_total != null && Number(data.discount_total) !== 0 && (
              <Row isRTL={isRTL} label={t("discount")} value={`${data.discount_total} ${data.currency ?? "SAR"}`} colors={colors} />
            )}
            {data.total != null && (
              <View style={[styles.totalRow, isRTL && styles.rowReverse]}>
                <Text style={[styles.totalLabel, isRTL ? styles.textRight : styles.textLeft, { color: colors.text.primary }]}>{t("total")}</Text>
                <Text style={[styles.totalValue, isRTL ? styles.textLeft : styles.textRight, { color: colors.primary }]}>
                  {data.total} {data.currency ?? "SAR"}
                </Text>
              </View>
            )}
            {data.payment_reference ? (
              <Row isRTL={isRTL} label={t("payment_reference")} value={data.payment_reference} colors={colors} />
            ) : null}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function Row({ label, value, isRTL, colors }: { label: string; value: string; isRTL: boolean; colors: ThemeColors }) {
  return (
    <View style={[styles.row, isRTL && styles.rowReverse, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, isRTL ? styles.textRight : styles.textLeft, isRTL && styles.textRTL, { color: colors.text.secondary }]}>{label}</Text>
      <Text style={[styles.rowValue, isRTL ? styles.textLeft : styles.textRight, { color: colors.text.primary }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.appBackground,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  textRTL: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  textLeft: {
    textAlign: "left",
  },
  textRight: {
    textAlign: "right",
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  scrollContentRTL: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRTL: {
    alignItems: "stretch",
  },
  invoiceHeader: {
    alignItems: "center",
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  invoiceDate: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  invoiceOrderId: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.text.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
    flex: 1,
    marginEnd: 12,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.text.primary,
    flex: 1,
  },
  lineItem: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    alignItems: "center",
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  lineItemDescWrap: {
    flex: 1,
  },
  lineItemDesc: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.text.primary,
  },
  lineItemDescFlex: {
    flex: 1,
  },
  lineItemDetail: {
    fontSize: 12,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  lineItemQty: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
    width: 32,
  },
  lineItemPrice: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
    width: 72,
  },
  lineItemTotal: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.text.primary,
    width: 72,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    // marginTop: 8,
    // borderTopWidth: 2,
    // borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: Fonts.CairoBold,
    color: Colors.primary,
  },
});
