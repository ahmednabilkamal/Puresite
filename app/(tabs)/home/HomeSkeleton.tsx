import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColors } from "@/hooks/use-theme-colors";
import React from "react";
import { Dimensions, View } from "react-native";
import styles from "./styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 80;

export function HomeSkeleton() {
  const colors = useThemeColors();
  return (
    <View style={styles.scrollContent}>
      {/* Header: avatar + greeting lines + notification button */}
      <View style={[styles.header, { flexDirection: "row" }]}>
        <View style={[styles.userInfo, { flexDirection: "row", alignItems: "center" }]}>
          <Skeleton width={50} height={50} borderRadius={25} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="70%" height={16} borderRadius={6} style={{ marginBottom: 8 }} />
            <Skeleton width="50%" height={12} borderRadius={6} />
          </View>
        </View>
        <Skeleton width={44} height={44} borderRadius={22} />
      </View>

      {/* Vehicle card */}
      <View style={[styles.vehicleCard, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: "row", alignItems: "center" }]}>
        <Skeleton width={46} height={46} borderRadius={10} />
        <View style={[styles.vehicleContent, { marginHorizontal: 12, flex: 1 }]}>
          <Skeleton width={100} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
          <Skeleton width="60%" height={12} borderRadius={6} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={12} borderRadius={6} />
        </View>
        <Skeleton width={32} height={32} borderRadius={8} />
      </View>

      {/* Promo banner placeholder */}
      <View style={[styles.bannerContainer, { marginHorizontal: 20, marginTop: 20 }]}>
        <Skeleton width={BANNER_WIDTH} height={120} borderRadius={16} />
      </View>

      {/* Banners horizontal strip */}
      <View style={[styles.bannersListContent, { flexDirection: "row", marginTop: 16 }]}>
        <Skeleton width={BANNER_WIDTH} height={180} borderRadius={16} style={{ marginRight: 16 }} />
        <Skeleton width={BANNER_WIDTH} height={180} borderRadius={16} />
      </View>

      {/* Popular services section */}
      <Skeleton width={160} height={20} borderRadius={6} style={[styles.sectionTitle, { marginTop: 25, marginBottom: 15 }]} />
      <View style={styles.servicesContainer}>
        <View style={[styles.serviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Skeleton width={72} height={72} borderRadius={20} style={{ marginBottom: 10 }} />
          <Skeleton width="80%" height={14} borderRadius={6} />
        </View>
        <View style={[styles.serviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Skeleton width={72} height={72} borderRadius={20} style={{ marginBottom: 10 }} />
          <Skeleton width="80%" height={14} borderRadius={6} />
        </View>
      </View>

      {/* Recent activity section */}
      <Skeleton width={140} height={20} borderRadius={6} style={[styles.sectionTitle, styles.activitySectionTitle]} />
      <View style={styles.listContent}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 16 }]}
          >
            <View style={[styles.serviceInfoContainer, { marginBottom: 12 }]}>
              <Skeleton width={44} height={44} borderRadius={10} style={{ marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <Skeleton width="70%" height={14} borderRadius={6} style={{ marginBottom: 6 }} />
                <Skeleton width="50%" height={12} borderRadius={6} />
              </View>
            </View>
            <View style={[styles.actionButtonsContainer, { flexDirection: "row", gap: 12 }]}>
              <Skeleton width="48%" height={44} borderRadius={5} />
              <Skeleton width="48%" height={44} borderRadius={5} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
