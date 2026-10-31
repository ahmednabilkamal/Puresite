import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import styles from "./styles";

export function CafeSkeleton() {
  const colors = useThemeColors();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <>
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          {isRTL ? (
            <MaterialIcons name="arrow-forward-ios" size={24} color={colors.text.primary} />
          ) : (
            <MaterialIcons name="arrow-back-ios" size={24} color={colors.text.primary} />
          )}
        </TouchableOpacity>
        <Skeleton width={80} height={22} borderRadius={6} style={{ flex: 1, marginHorizontal: 8 }} />
        <Skeleton width={40} height={40} borderRadius={20} style={styles.headerButton} />
      </View>

      <View style={[styles.categoriesContainer, { backgroundColor: colors.appBackground }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoriesScroll, { flexDirection: isRTL ? "row-reverse" : "row" }]}
        >
          <Skeleton width={60} height={40} borderRadius={22} style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }} />
          <Skeleton width={90} height={40} borderRadius={22} style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }} />
          <Skeleton width={70} height={40} borderRadius={22} style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }} />
          <Skeleton width={85} height={40} borderRadius={22} />
        </ScrollView>
      </View>

      <View style={[styles.productsGrid, { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }]}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={i}
            style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.imageContainer, { backgroundColor: colors.appBackground }]}>
              <Skeleton width="100%" height="100%" borderRadius={18} />
            </View>
            <Skeleton width="70%" height={14} borderRadius={6} style={{ marginBottom: 8 }} />
            <View style={[styles.priceRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Skeleton width={50} height={12} borderRadius={6} />
              <Skeleton width={32} height={32} borderRadius={16} />
            </View>
          </View>
        ))}
      </View>
    </>
  );
}
