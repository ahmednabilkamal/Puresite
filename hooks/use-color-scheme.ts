import { useColorScheme as useRNColorScheme } from "react-native";
import { useThemeStore, type ResolvedTheme } from "@/store/theme-store";

/**
 * Returns the effective theme: user preference, or system when preference is "system".
 */
export function useColorScheme(): ResolvedTheme | null {
  const systemScheme = useRNColorScheme();
  const preference = useThemeStore((s) => s.preference);

  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return systemScheme;
}
