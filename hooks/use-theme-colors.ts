import { Theme } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type ThemeColors = (typeof Theme)["light"];

/**
 * Returns the current theme colors (light or dark) based on effective color scheme.
 */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? Theme.dark : Theme.light;
}
