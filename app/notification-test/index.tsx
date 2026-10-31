import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Fonts } from "@/constants/fonts";
import { getStoredPushToken } from "@/utils/push-notifications";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export default function NotificationTestScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";
  const [token, setToken] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const loadToken = useCallback(async () => {
    const stored = await getStoredPushToken();
    setToken(stored);
  }, []);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  const sendTestNotification = useCallback(async () => {
    if (!token) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: "No push token. Use a physical device and allow notifications.",
      });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          sound: "default",
          title: "Test notification",
          body: "You received this from the in-app test. Sound and app icon use app defaults.",
          data: { screen: "/(tabs)/home" },
        }),
      });
      const data = await res.json();
      if (data.data?.status === "ok") {
        Toast.show({
          type: "success",
          text1: "Sent",
          text2: "Check your device for the notification.",
        });
      } else {
        const err = data.data?.message ?? JSON.stringify(data);
        Toast.show({ type: "error", text1: "Send failed", text2: err });
      }
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: (e as Error).message,
      });
    } finally {
      setSending(false);
    }
  }, [token, t]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]} edges={["top"]}>
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons
            name={isRTL ? "arrow-forward-ios" : "arrow-back-ios"}
            size={24}
            color={Colors.apple}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Push notification test</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
          Device token (sent to your backend on login/register)
        </Text>
        <View style={styles.tokenBox}>
          <Text selectable style={[styles.tokenText, { textAlign: isRTL ? "right" : "left" }]}>
            {token || "No token — use a physical device and allow notifications."}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, sending && styles.buttonDisabled]}
          onPress={sendTestNotification}
          disabled={sending || !token}
        >
          {sending ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Send test notification</Text>
          )}
        </TouchableOpacity>
        <Text style={[styles.hint, { textAlign: isRTL ? "right" : "left" }]}>
          Sends a notification with title, body, and default sound. App icon is your launcher icon.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.appBackground },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.apple,
  },
  content: { padding: 20 },
  label: {
    fontSize: 14,
    fontFamily: Fonts.CairoMedium,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  tokenBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#eee",
  },
  tokenText: {
    fontSize: 12,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.white,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
  },
});
