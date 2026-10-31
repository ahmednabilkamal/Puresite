/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Dark mode aligned with Vue (spa.css).
 */

import { Platform } from "react-native";
import { Colors as AppColors, Theme as AppTheme } from "./colors";

const tintColorLight = AppColors.primary;
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: AppColors.text.primary,
    background: AppColors.background,
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: AppTheme.dark.text.primary,
    background: AppTheme.dark.background,
    tint: tintColorDark,
    icon: AppTheme.dark.text.secondary,
    tabIconDefault: AppTheme.dark.text.secondary,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
