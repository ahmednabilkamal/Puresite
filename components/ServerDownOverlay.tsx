import { API_CONFIG } from "@/constants/api";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useServerStatusStore } from "@/store/server-status-store";
import apiClient from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NetworkLogger from "react-native-network-logger";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ServerDownOverlay() {
  const isServerDown = useServerStatusStore((s) => s.isServerDown);
  const clearServerDown = useServerStatusStore((s) => s.clearServerDown);
  const colors = useThemeColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showLogger, setShowLogger] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await apiClient.get(API_CONFIG.ENDPOINTS.BANNERS);
      clearServerDown();
    } catch {
      // Still down, keep overlay visible
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Modal
      visible={isServerDown}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: colors.appBackground,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.statusCancelledBg },
            ]}
          >
            <Ionicons
              name="cloud-offline-outline"
              size={64}
              color={colors.statusCancelled}
            />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t("something_went_wrong")}
          </Text>
          <Text
            style={[styles.message, { color: colors.text.secondary }]}
          >
            {t("server_unavailable")}
          </Text>
          <Pressable
            onPress={handleRetry}
            disabled={isRetrying}
            style={({ pressed }) => [
              styles.retryButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.retryText}>{t("retry")}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setShowLogger(true)}
            style={({ pressed }) => [
              styles.loggerButton,
              {
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.loggerText, { color: colors.text.primary }]}>Logs</Text>
          </Pressable>
        </View>

        <Modal
          visible={showLogger}
          animationType="slide"
          onRequestClose={() => setShowLogger(false)}
        >
          <View style={[styles.loggerContainer, { backgroundColor: colors.appBackground }]}>
            <View style={styles.loggerHeader}>
              <Pressable
                onPress={() => setShowLogger(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={[styles.closeLoggerText, { color: colors.text.primary }]}>
                  Close Logger
                </Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <NetworkLogger />
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: Fonts.CairoBold,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: Fonts.CairoRegular,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
  },
  retryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.CairoBold,
  },
  loggerButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    minWidth: 160,
    alignItems: "center",
  },
  loggerText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.CairoBold,
  },
  loggerContainer: {
    flex: 1,
    paddingTop: 50,
  },
  loggerHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeLoggerText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
