import CardBrandIcon from "@/components/CardBrandIcon";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { paymentService, type SavedCard } from "@/services/payment-service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function SavedCardsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  const [cards, setCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);

  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await paymentService.getSavedCards();
      setCards(data);
    } catch (err) {
      console.error("Error loading cards:", err);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("failed_to_load_service"),
      });
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  const handleDeleteCard = (card: SavedCard) => {
    Alert.alert(
      t("delete") || "Delete",
      t("delete_card_confirm") || `Remove card **** ${card.last_four}?`,
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            setDeletingCardId(card.id);
            try {
              await paymentService.deleteSavedCard(card.id);
              setCards((prev) => prev.filter((c) => c.id !== card.id));
              Toast.show({
                type: "success",
                text1: t("success"),
                text2: t("card_deleted") ?? "Card removed",
              });
            } catch (err: any) {
              const msg =
                err.response?.data?.message || err.message || t("failed_to_load_service");
              Toast.show({ type: "error", text1: t("error"), text2: msg });
            } finally {
              setDeletingCardId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]} edges={["top"]}>
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t("saved_cards")}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.loader}
          />
        ) : cards.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Ionicons
              name="card-outline"
              size={48}
              color={colors.text.secondary}
              style={{ marginBottom: 12 }}
            />
            <Text
              style={[
                styles.emptyText,
                { color: colors.text.secondary, textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {t("no_saved_cards")}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { flexDirection: isRTL ? "row-reverse" : "row" }]}
              onPress={() => router.push("/add-card")}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
              <Text style={styles.addButtonText}>{t("add_card")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cardsList}>
              {cards.map((card) => (
                <View
                  key={card.id}
                  style={[
                    styles.cardRow,
                    {
                      backgroundColor: colors.surface,
                      flexDirection: isRTL ? "row-reverse" : "row",
                    },
                  ]}
                >
                  <View style={{ marginHorizontal: 12 }}>
                    <CardBrandIcon brand={card.brand} width={36} height={24} />
                  </View>
                  <Text
                    style={[
                      styles.cardText,
                      { flex: 1, color: colors.text.primary, textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    **** {card.last_four} ({card.brand || "card"})
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteCard(card)}
                    style={styles.deleteButton}
                    disabled={deletingCardId === card.id}
                  >
                    {deletingCardId === card.id ? (
                      <ActivityIndicator size="small" color={Colors.text.secondary} />
                    ) : (
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color={colors.text.secondary}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.addCardRow,
                {
                  backgroundColor: colors.surface,
                  flexDirection: isRTL ? "row-reverse" : "row",
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/add-card")}
            >
              <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
              <Text style={[styles.addCardText, { color: Colors.primary }]}>
                {t("add_card")}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
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
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.CairoRegular,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.white,
  },
  cardsList: {
    gap: 12,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  cardText: {
    fontSize: 16,
    fontFamily: Fonts.CairoRegular,
  },
  deleteButton: {
    padding: 8,
  },
  addCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  addCardText: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
  },
});
