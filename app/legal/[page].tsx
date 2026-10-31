import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { pageService } from "@/services/page-service";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const ALLOWED_PAGES = ["terms", "privacy"] as const;

export default function LegalPageScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ page?: string }>();
  const isRTL = i18n.language === "ar";
  const pageParam = typeof params.page === "string" ? params.page : params.page?.[0];
  const page = ALLOWED_PAGES.includes(pageParam as any) ? (pageParam as "terms" | "privacy") : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    if (!page) {
      setError(t("ticket_not_found") || "Page not found");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const locale = i18n.language === "ar" ? "ar" : "en";
      const data = await pageService.getPage(page, locale);
      setTitle(data.title || (page === "terms" ? t("terms_of_use") : t("privacy_policy")));
      setContent(data.content || "");
    } catch (err) {
      console.error("Legal page fetch error:", err);
      setError((err as Error)?.message ?? t("failed_to_load_ticket") ?? "Failed to load page");
    } finally {
      setIsLoading(false);
    }
  }, [page, i18n.language, t]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  if (!page) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]} edges={["top"]}>
        <View style={[styles.header, isRTL && styles.headerRTL, { backgroundColor: colors.appBackground }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("terms_of_use")}</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>{t("ticket_not_found")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayTitle = title || (page === "terms" ? t("terms_of_use") : t("privacy_policy"));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]} edges={["top"]}>
      <View style={[styles.header, isRTL && styles.headerRTL, { backgroundColor: colors.appBackground }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, styles.headerTitleFlex, { color: colors.text.primary }]} numberOfLines={1}>
          {displayTitle}
        </Text>
        <View style={styles.headerButton} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>{t("loading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.text.secondary, textAlign: isRTL ? "right" : "left" }]}>{error}</Text>
        </View>
      ) : content ? (
        <WebView
          source={{
            html: `
              <!DOCTYPE html>
              <html dir="${isRTL ? "rtl" : "ltr"}">
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 16px; font-size: 16px; line-height: 1.5; color: #333; margin: 0; }
                    p { margin-bottom: 0.75em; }
                    h2 { font-size: 1.125rem; margin-top: 1.25em; margin-bottom: 0.5em; }
                    ul, ol { padding-left: 1.5rem; margin-bottom: 0.75em; }
                    a { color: ${Colors.primary}; }
                  </style>
                </head>
                <body>${content}</body>
              </html>
            `,
          }}
          style={styles.webView}
          scrollEnabled
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.text.secondary, textAlign: isRTL ? "right" : "left", fontFamily: Fonts.CairoRegular }]}>
            {t("no_content")}
          </Text>
        </View>
      )}
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  headerRTL: {
    flexDirection: "row-reverse",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: Fonts.CairoBold,
  },
  headerTitleFlex: {
    flex: 1,
    marginHorizontal: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
  },
  errorText: {
    fontSize: 14,
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
