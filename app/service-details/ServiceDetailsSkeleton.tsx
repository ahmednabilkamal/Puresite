import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import styles from "./styles";

export function ServiceDetailsSkeleton() {
  const colors = useThemeColors();
  const router = useRouter();
  const { t, i18n } = useTranslation();
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
        <Skeleton width={120} height={20} borderRadius={6} style={{ flex: 1, marginHorizontal: 8 }} />
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.appBackground }]}
      >
        <View style={[styles.imageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Skeleton width="100%" height={250} borderRadius={0} />
        </View>

        <Skeleton width="70%" height={18} borderRadius={6} style={[styles.serviceTitle, { marginBottom: 12 }]} />

        <View style={[styles.metaContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.metaItem, { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.surface }]}>
            <Skeleton width={60} height={14} borderRadius={6} />
          </View>
          <View style={[styles.metaItem, { marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0, flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.surface }]}>
            <Skeleton width={80} height={14} borderRadius={6} />
          </View>
        </View>

        <Skeleton width="100%" height={12} borderRadius={6} style={{ marginHorizontal: 20, marginBottom: 8 }} />
        <Skeleton width="90%" height={12} borderRadius={6} style={{ marginHorizontal: 20, marginBottom: 8 }} />
        <Skeleton width="60%" height={12} borderRadius={6} style={{ marginHorizontal: 20, marginBottom: 24 }} />

        <View style={[styles.vipCard, { backgroundColor: colors.serviceBg ?? colors.primary + "15", borderColor: colors.primary + "40" }]}>
          <View style={[styles.vipContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }} />
            <View style={styles.vipTextContainer}>
              <Skeleton width={100} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
              <Skeleton width={140} height={12} borderRadius={6} />
            </View>
            <Skeleton width={44} height={24} borderRadius={12} />
          </View>
        </View>

        <View style={styles.carSizeSection}>
          <Skeleton width={180} height={18} borderRadius={6} style={{ marginBottom: 12 }} />
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap" }}>
            <Skeleton width={80} height={40} borderRadius={20} style={{ marginEnd: 12, marginBottom: 12 }} />
            <Skeleton width={90} height={40} borderRadius={20} style={{ marginEnd: 12, marginBottom: 12 }} />
            <Skeleton width={70} height={40} borderRadius={20} style={{ marginBottom: 12 }} />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={[styles.footerContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View>
            <Skeleton width={60} height={12} borderRadius={6} style={{ marginBottom: 6 }} />
            <Skeleton width={80} height={22} borderRadius={6} />
          </View>
          <Skeleton width={140} height={48} borderRadius={12} style={{ marginLeft: isRTL ? 0 : 32, marginRight: isRTL ? 32 : 0 }} />
        </View>
      </View>
    </>
  );
}
