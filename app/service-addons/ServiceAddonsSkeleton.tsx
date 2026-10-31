import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColors } from "@/hooks/use-theme-colors";
import React from "react";
import { ScrollView, View } from "react-native";
import styles from "./styles";

export function ServiceAddonsSkeleton() {
  const colors = useThemeColors();

  return (
    <>
      <View style={styles.stickyHeaderContainer}>
        <View style={[styles.mainServiceCard, { backgroundColor: colors.surface, flexDirection: "row", alignItems: "center" }]}>
          <Skeleton width={70} height={70} borderRadius={12} />
          <View style={[styles.mainServiceContent, { marginHorizontal: 16, flex: 1 }]}>
            <Skeleton width="80%" height={16} borderRadius={6} style={{ marginBottom: 4 }} />
            <Skeleton width={60} height={14} borderRadius={6} style={{ marginBottom: 4 }} />
            <Skeleton width={70} height={12} borderRadius={6} />
          </View>
          <Skeleton width={24} height={24} borderRadius={12} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Skeleton width={140} height={14} borderRadius={6} style={[styles.sectionTitle, { marginBottom: 12 }]} />

        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.addonCard, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: "row", alignItems: "center", marginBottom: 12 }]}
          >
            <Skeleton width={60} height={60} borderRadius={10} />
            <View style={[styles.addonContent, { paddingHorizontal: 12, flex: 1 }]}>
              <Skeleton width="75%" height={14} borderRadius={6} style={{ marginBottom: 8 }} />
              <View style={[styles.addonPriceRow, { flexDirection: "row", gap: 8 }]}>
                <Skeleton width={50} height={13} borderRadius={6} />
                <Skeleton width={60} height={11} borderRadius={6} />
              </View>
            </View>
            <Skeleton width={32} height={32} borderRadius={16} />
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <View style={[styles.footerContent, { flexDirection: "row" }]}>
          <View style={[styles.totalContainer, { alignItems: "flex-start" }]}>
            <Skeleton width={70} height={11} borderRadius={6} style={{ marginBottom: 6 }} />
            <Skeleton width={90} height={22} borderRadius={6} />
          </View>
          <Skeleton width={160} height={48} borderRadius={14} />
        </View>
      </View>
    </>
  );
}
