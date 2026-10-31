import { Skeleton } from "@/components/ui/skeleton";
import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
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
    fontSize: 22,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  imageContainer: {
    width,
    height: width * 0.8,
    alignSelf: "center",
    marginBottom: 32,
  },
  titleRow: {
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  descriptionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  optionGroup: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: 24,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  footerRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export function ProductDetailsSkeleton() {
  const colors = useThemeColors();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          {isRTL ? (
            <MaterialIcons name="arrow-forward-ios" size={24} color={Colors.apple} />
          ) : (
            <MaterialIcons name="arrow-back-ios" size={24} color={Colors.apple} />
          )}
        </TouchableOpacity>
        <Skeleton width={80} height={22} borderRadius={6} />
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Skeleton width="100%" height="100%" borderRadius={0} />
        </View>

        <View style={[styles.titleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Skeleton width="50%" height={20} borderRadius={6} style={{ flex: 1 }} />
          <Skeleton width={100} height={36} borderRadius={999} />
        </View>

        <View style={styles.descriptionContainer}>
          <Skeleton width={100} height={19} borderRadius={6} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={12} borderRadius={6} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={12} borderRadius={6} />
        </View>

        {[1, 2].map((i) => (
          <View key={i} style={styles.optionGroup}>
            <Skeleton width={120} height={19} borderRadius={6} style={{ marginBottom: 12 }} />
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: 12, marginHorizontal: 20 }}>
              <Skeleton width={80} height={40} borderRadius={200} />
              <Skeleton width={90} height={40} borderRadius={200} />
              <Skeleton width={70} height={40} borderRadius={200} />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface ?? Colors.white }]}>
        <View style={[styles.footerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
            <Skeleton width={70} height={12} borderRadius={6} style={{ marginBottom: 6 }} />
            <Skeleton width={100} height={25} borderRadius={6} />
          </View>
          <Skeleton width="70%" height={52} borderRadius={16} />
        </View>
      </View>
    </View>
  );
}
