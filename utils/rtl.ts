import type { i18n as I18n } from "i18next";
import * as Updates from "expo-updates";
import { I18nManager, Platform } from "react-native";

/**
 * In-app direction must follow the chosen language, not the device locale.
 * Use the same check everywhere (i18n may report "ar" or "ar-XX" on real devices).
 */
export function isAppRTL(i18n: Pick<I18n, "language" | "resolvedLanguage">): boolean {
  const code = (i18n.resolvedLanguage || i18n.language || "").toLowerCase();
  return code.startsWith("ar");
}

/**
 * Keep React Native's native layout direction in sync with the active app language.
 * Mismatch (e.g. English system + Arabic in-app) is a common reason RTL looks fine in
 * Expo Go but wrong on a standalone build until I18nManager is aligned.
 * When a change is needed, reloads the JS bundle so the native value takes effect.
 */
export async function applyNativeLayoutDirection(rtl: boolean): Promise<void> {
  if (Platform.OS === "web") return;

  I18nManager.allowRTL(true);
  if (I18nManager.isRTL === rtl) return;

  I18nManager.forceRTL(rtl);
  try {
    await Updates.reloadAsync();
  } catch {
    // Updates may be disabled in some dev runs; direction still applies on next cold start
  }
}
