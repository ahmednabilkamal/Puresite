import type { ThemeColors } from "@/hooks/use-theme-colors";

/**
 * Moyasar CreditCard / StcPay use react-native's useColorScheme (system only) for input text
 * color, not the app's theme preference. Pass these styles so text + placeholder + field background
 * match the active theme; otherwise in dark (in-app) on a light OS, placeholders are easy to miss.
 */
export function getMoyasarFormStyle(
  colors: ThemeColors,
  appColorScheme: "light" | "dark" | null
): {
  textInputs: {
    borderWidth: number;
    borderColor: string;
    color: string;
    backgroundColor: string;
  };
  textInputsPlaceholderColor: string;
} {
  const isDark = appColorScheme === "dark";
  return {
    textInputs: {
      borderWidth: 1.25,
      borderColor: colors.border,
      color: colors.text.primary,
      backgroundColor: colors.surface,
    },
    textInputsPlaceholderColor: isDark ? "#9CA3AF" : colors.text.secondary,
  };
}
