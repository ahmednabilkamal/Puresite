import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  NotificationItem,
  notificationService,
} from "@/services/notification-service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import styles from "./styles";

function formatNotificationTime(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-GB", { calendar: "gregory" });
  } catch {
    return createdAt;
  }
}

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await notificationService.getNotifications();
      setNotifications(list);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("notifications_load_failed"),
      });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isRead = item.read_at != null;
    const subtitle = item.message ?? item.body ?? "";
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { flexDirection: isRTL ? "row-reverse" : "row", borderBottomColor: colors.border },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="notifications" size={24} color="#67A6B8" />
        </View>
        <View
          style={[
            styles.contentContainer,
            { alignItems: isRTL ? "flex-end" : "flex-start" },
          ]}
        >
          <Text style={[styles.title, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
            {item.title}
          </Text>
          {subtitle ? (
            <Text style={[styles.time, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
              {subtitle}
            </Text>
          ) : null}
          <Text style={[styles.time, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
            {formatNotificationTime(item.created_at)}
          </Text>
        </View>
        {!isRead ? (
          <View style={styles.unreadDot} />
        ) : (
          <View style={{ width: 8 }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { flexDirection: isRTL ? "row-reverse" : "row", borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("notifications")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && { flex: 1, justifyContent: "center" },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                color: colors.text.secondary,
                fontFamily: "Cairo-Regular",
                marginTop: 24,
              }}
            >
              {t("no_notifications")}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
