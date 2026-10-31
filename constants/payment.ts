/**
 * Moyasar payment configuration.
 * Set MOYASAR_PUBLISHABLE_KEY in your environment or replace the placeholder.
 * For staging: use pk_test_* and baseUrl "https://apimig.moyasar.com"
 */
export const MOYASAR_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_MOYASAR_PUBLISHABLE_KEY ??
  "pk_live_grBHoybiqCefwKTeWuriLNHYj9JQ9t2E9S9QbfJa";
export const MOYASAR_BASE_URL =
  process.env.EXPO_PUBLIC_MOYASAR_BASE_URL ?? "https://api.moyasar.com";

export const MOYASAR_APPLE_PAY_MERCHANT_ID =
  process.env.EXPO_PUBLIC_MOYASAR_APPLE_PAY_MERCHANT_ID ??
  "merchant.com.afsc.PureSite";

export const MOYASAR_APPLE_PAY_LABEL =
  process.env.EXPO_PUBLIC_MOYASAR_APPLE_PAY_LABEL ?? "Pure Site";
