import { create } from "zustand";
import { storage } from "../utils/storage";

const THEME_STORAGE_KEY = "theme_preference";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",

  setPreference: async (preference: ThemePreference) => {
    await storage.setItem(THEME_STORAGE_KEY, preference);
    set({ preference });
  },

  initialize: async () => {
    const saved = await storage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      set({ preference: saved });
    }
  },
}));
