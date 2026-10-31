import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { useThemeStore, type ResolvedTheme } from "@/store/theme-store";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 * Returns the effective theme: user preference, or system when preference is "system".
 */
export function useColorScheme(): ResolvedTheme | null {
  const [hasHydrated, setHasHydrated] = useState(false);
  const systemScheme = useRNColorScheme();
  const preference = useThemeStore((s) => s.preference);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return "light";

  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return systemScheme ?? "light";
}
