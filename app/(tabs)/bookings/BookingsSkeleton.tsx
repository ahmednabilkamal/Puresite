import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColors } from "@/hooks/use-theme-colors";
import React from "react";
import { View } from "react-native";
import styles from "./styles";

export function BookingsSkeleton() {
  const colors = useThemeColors();

  return (
    <View style={styles.listContent}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 16 }]}
          >
            <View style={[styles.serviceInfoContainer, { flexDirection: "row", marginBottom: 12 }]}>
              <Skeleton width={44} height={44} borderRadius={10} style={{ marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <Skeleton width="75%" height={14} borderRadius={6} style={{ marginBottom: 6 }} />
                <Skeleton width="55%" height={12} borderRadius={6} style={{ marginBottom: 4 }} />
                <Skeleton width="45%" height={12} borderRadius={6} />
              </View>
            </View>
            <View style={[styles.actionButtonsContainer, { flexDirection: "row", gap: 12 }]}>
              <Skeleton width="48%" height={44} borderRadius={5} />
              <Skeleton width="48%" height={44} borderRadius={5} />
            </View>
          </View>
        ))}
    </View>
  );
}
