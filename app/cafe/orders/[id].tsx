import Saudi_riyal from "@/components/saudi_riyal";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { getImageUrl } from "@/constants/api";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { CafeOrder, cafeService } from "@/services/cafe-service";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "gregory",
    });
  } catch {
    return dateStr;
  }
}

function getStatusInfo(status: string): { color: string; bgColor: string } {
  switch (status?.toLowerCase()) {
    case "pending":
      return { color: Colors.statusPending, bgColor: Colors.statusPendingBg };
    case "preparing":
    case "ready":
      return { color: Colors.statusInProgress, bgColor: Colors.statusInProgressBg };
    case "completed":
    case "picked_up":
      return { color: Colors.statusCompleted, bgColor: Colors.statusCompletedBg };
    case "cancelled":
      return { color: Colors.statusCancelled, bgColor: Colors.statusCancelledBg };
    default:
      return { color: Colors.statusPending, bgColor: Colors.statusPendingBg };
  }
}

export default function CafeOrderDetailsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isRTL = i18n.language === "ar";
  const orderId = typeof params.id === "string" ? params.id : params.id?.[0];

  const [order, setOrder] = useState<CafeOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await cafeService.getOrderDetails(Number(orderId));
      setOrder(data);
    } catch (err) {
      console.error("Cafe order fetch error:", err);
      setError((err as Error)?.message ?? t("failed_to_load_service"));
      Toast.show({ type: "error", text1: t("error"), text2: t("failed_to_load_service") });
    } finally {
      setIsLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return t("pending");
      case "completed":
        return t("completed");
      case "cancelled":
        return t("cancelled");
      case "preparing":
        return t("preparing");
      case "ready":
        return t("ready");
      case "picked_up":
        return t("picked_up");
      default:
        return status;
    }
  };

  const getPickupLabel = (method: string) =>
    method === "parking" ? t("deliver_to_parking") : t("pickup_branch");

  if (!orderId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons
              name={isRTL ? "arrow-forward-ios" : "arrow-back-ios"}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("order_details")}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centered}>
          <Text style={{ color: colors.text.secondary }}>{t("missing_order_id")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons
              name={isRTL ? "arrow-forward-ios" : "arrow-back-ios"}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("order_details")}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons
              name={isRTL ? "arrow-forward-ios" : "arrow-back-ios"}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("order_details")}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centered}>
          <Text style={{ color: colors.text.secondary }}>{error ?? t("failed_to_load_service")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]} edges={["top"]}>
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons
            name={isRTL ? "arrow-forward-ios" : "arrow-back-ios"}
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("order_details")}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order summary card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.cardRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>{t("order_number")}</Text>
            <Text style={[styles.value, { color: colors.text.primary }]}>#{order.id}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.cardRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>{t("status")}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusInfo(order.cafe_status).bgColor }]}>
              <Text style={[styles.statusText, { color: getStatusInfo(order.cafe_status).color }]}>
                {getStatusLabel(order.cafe_status)}
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.cardRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>{t("order_date")}</Text>
            <Text style={[styles.value, { color: colors.text.primary }]}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.cardRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>{t("delivery_method")}</Text>
            <Text style={[styles.value, { color: colors.text.primary }]}>{getPickupLabel(order.pickup_method)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.cardRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>{t("total")}</Text>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6 }}>
              {order.is_free ? (
                <View style={[styles.statusBadge, { backgroundColor: Colors.statusCompletedBg }]}>
                  <Text style={[styles.statusText, { color: Colors.statusCompleted }]}>{t("free")}</Text>
                </View>
              ) : (
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                 <Saudi_riyal width={16} height={16} color={colors.primary} /> {order.total} 

                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={[styles.itemsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.itemsSectionTitle, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}>
            {t("items")}
          </Text>
          {[...(order.items ?? [])]
            .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
            .map((item, idx) => {
              const name = item.product_name ?? item.product?.name ?? "";
              const qty = item.quantity ?? item.qty ?? 0;
              const unitPrice = item.price ?? item.unit_price ?? "";
              const totalPrice = item.total_price;
              const opts = item.options;
              const optsStr = Array.isArray(opts)
                ? opts.map((o) => (typeof o === "string" ? o : (o as { name?: string }).name ?? String(o))).filter(Boolean).join(", ")
                : "";
              const imagePath = item.image_path ?? item.product?.image_path;
              const hasOptions = optsStr.length > 0;
              return (
                <View
                  key={item.id ?? idx}
                  style={[styles.itemCard, { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.appBackground ?? "#F5F5F5", borderColor: colors.border }]}
                >
                  <View style={[styles.itemThumbWrap, { backgroundColor: colors.border + "80" }]}>
                    {imagePath ? (
                      <Image
                        source={{ uri: getImageUrl(imagePath) }}
                        style={styles.itemThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.itemThumbPlaceholder}>
                        <Ionicons name="cafe-outline" size={28} color={colors.text.light} />
                      </View>
                    )}
                  </View>
                  <View style={[styles.itemBody, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                    <View style={[styles.itemHeadRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                      <Text
                        style={[styles.itemName, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}
                        numberOfLines={2}
                      >
                        {name}
                      </Text>
                      <View style={[styles.qtyBadge, { backgroundColor: colors.primary + "18" }]}>
                        <Text style={[styles.qtyBadgeText, { color: colors.primary }]}>×{qty}</Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.itemPriceLine, { color: colors.text.secondary, textAlign: isRTL ? "right" : "left" }]}
                    >
                      {unitPrice} {t("currency")}
                      {qty > 1 ? ` × ${qty}` : ""}
                    </Text>
                    {hasOptions ? (
                      <View style={[styles.optionsWrap, { flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap" }]}>
                        <Text style={[styles.optionsLabel, { color: colors.text.light }]}>{t("customizations") ?? "Customizations"}: </Text>
                        <Text style={[styles.optionsText, { color: colors.text.secondary }]}>{optsStr}</Text>
                      </View>
                    ) : null}
                    {totalPrice != null && totalPrice !== "" && qty > 1 ? (
                      <View style={[styles.itemTotalRow, { flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4 }]}>
                        <Saudi_riyal width={12} height={12} color={colors.primary} />
                        <Text style={[styles.itemTotalLine, { color: colors.text.primary }]}>
                          {totalPrice} {t("currency")}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.CairoSemiBold,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardRow: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
  },
  value: {
    fontSize: 15,
    fontFamily: Fonts.CairoSemiBold,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: Fonts.CairoBold,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 13,
    fontFamily: Fonts.CairoSemiBold,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.CairoSemiBold,
    marginBottom: 12,
  },
  itemsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  itemsSectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.CairoSemiBold,
    marginBottom: 14,
  },
  itemCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  itemThumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
  },
  itemThumb: {
    width: "100%",
    height: "100%",
  },
  itemThumbPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemHeadRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemName: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
    flex: 1,
  },
  qtyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  qtyBadgeText: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
  },
  itemPriceLine: {
    fontSize: 13,
    fontFamily: Fonts.CairoRegular,
    marginTop: 4,
  },
  optionsWrap: {
    marginTop: 6,
    alignItems: "flex-start",
  },
  optionsLabel: {
    fontSize: 12,
    fontFamily: Fonts.CairoMedium,
  },
  optionsText: {
    fontSize: 12,
    fontFamily: Fonts.CairoRegular,
    flex: 1,
  },
  itemTotalRow: {
    marginTop: 4,
  },
  itemTotalLine: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
  },
});
