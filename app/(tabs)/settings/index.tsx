import {
  ChangePasswordSheet,
  ChangePasswordSheetRef,
} from "@/components/ui/change-password-sheet";
import {
  ThemeSheet,
  ThemeSheetRef,
} from "@/components/ui/theme-sheet";
import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore, type ThemePreference } from "@/store/theme-store";
import * as Updates from "expo-updates";
// import { applyNativeLayoutDirection, isAppRTL } from "@/utils/rtl";
import { storage } from "@/utils/storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";
import styles from "./styles";

const CustomSwitch = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
}) => {
  const progress = useDerivedValue(() => {
    return withSpring(value ? 1 : 0, {
      damping: 20,
      stiffness: 150,
    });
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ["#E9E9EA", Colors.greenSwitch]
    );
    return {
      backgroundColor,
    };
  });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: progress.value * 14 }],
    };
  });

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View
        style={[
          {
            width: 32,
            height: 18,
            borderRadius: 9,
            padding: 2,
            justifyContent: "center",
          },
          animatedContainerStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 1,
              elevation: 2,
            },
            animatedThumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

function themeLabelKey(pref: ThemePreference): string {
  if (pref === "light") return "theme_light";
  if (pref === "dark") return "theme_dark";
  return "theme_system";
}

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const changePasswordSheetRef = useRef<ChangePasswordSheetRef>(null);
  const themeSheetRef = useRef<ThemeSheetRef>(null);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleThemeSelect = async (preference: ThemePreference) => {
    await setThemePreference(preference);
  };

  const handleLanguageChange = async () => {
    try {
      const nextLang = i18n.language === "ar" ? "en" : "ar"; await storage.setItem("language", nextLang);
      await i18n.changeLanguage(nextLang);
      // Small delay to ensure storage is settled before restart
      setTimeout(() => {
        Updates.reloadAsync().catch((err) => {
          console.error("Reload failed:", err);
        });
      }, 500);
      // await applyNativeLayoutDirection(isAppRTL(i18n));
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  // Get user initials (first and second character)
  const getUserInitials = (name?: string): string => {
    if (!name) return "U";
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return "U";
    if (trimmedName.length === 1) return trimmedName[0].toUpperCase();
    // Get first character and second character (or first character of second word)
    const words = trimmedName.split(" ").filter(w => w.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return trimmedName.substring(0, 2).toUpperCase();
  };

  const userInitials = getUserInitials(user?.name);

  const SettingRow = ({
    icon,
    label,
    onPress,
    showChevron = true,
    showSwitch = false,
    isLast = false,
    iconColor,
    textColor,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
    showChevron?: boolean;
    showSwitch?: boolean;
    isLast?: boolean;
    iconColor?: string;
    textColor?: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.optionRow,
        { flexDirection: isRTL ? "row" : "row-reverse" },
        isLast && { borderBottomWidth: 0 },
      ]}
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={0.7}
    >
      {showSwitch ? (
        <CustomSwitch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      ) : showChevron ? (
        <Ionicons
          name={isRTL ? "chevron-back" : "chevron-forward"}
          size={18}
          color={iconColor ?? colors.placeholder}
        />
      ) : (
        <View style={{ width: 18 }} />
      )}

      <View
        style={[
          styles.optionLeft,
          { flexDirection: isRTL ? "row" : "row-reverse" },
        ]}
      >
        <Text
          style={[
            styles.optionText,
            { textAlign: isRTL ? "left" : "right", color: textColor ?? colors.placeholder },
            isRTL ? { marginLeft: 10 } : { marginRight: 10 },
          ]}
        >
          {label}
        </Text>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icon as any}
            size={22}
            color={iconColor ?? colors.placeholder}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.appBackground }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("settings")}</Text>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View
          style={[
            styles.profileSection,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <View style={[styles.profileImage, styles.profileImageInitials]}>
            <Text style={styles.profileImageText}>{userInitials}</Text>
          </View>
          <View
            style={[
              styles.profileInfo,
              isRTL ? { marginRight: 15 } : { marginLeft: 15 },
              { alignItems: isRTL ? "flex-end" : "flex-start" },
            ]}
          >
            <Text style={[styles.userName, { color: colors.text.primary }]}>{user?.name || "User"}</Text>
            <Text style={[styles.userEmail, { color: colors.text.secondary }]}>{user?.email || user?.phone || ""}</Text>
          </View>
        </View>

        {/* Personal Account Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
            ]}
          >
            {t("personal_account")}
          </Text>
          <View style={[styles.optionsCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="key-outline"
              label={t("change_password")}
              onPress={() => changePasswordSheetRef.current?.open()}
            />
            <SettingRow
              icon="alert-octagon-outline"
              label={t("danger_area")}
              onPress={() => router.push("/danger-area")}
              iconColor={Colors.red}
              textColor={Colors.red}
              isLast={true}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
            ]}
          >
            {t("notifications_and_alerts")}
          </Text>
          <View style={[styles.optionsCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="bell-outline"
              label={t("enable_disable_notifications")}
              showChevron={false}
              showSwitch={true}
              isLast={true}
            />
          </View>
        </View>

        {/* Appearance / Theme Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
            ]}
          >
            {t("theme_appearance")}
          </Text>
          <View style={[styles.optionsCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="theme-light-dark"
              label={t(themeLabelKey(themePreference))}
              onPress={() => themeSheetRef.current?.open()}
              isLast={true}
            />
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
            ]}
          >
            {t("language_and_preferences")}
          </Text>
          <View style={[styles.optionsCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="translate"
              label={i18n.language === "ar" ? "English" : "اللغة العربية"}
              onPress={handleLanguageChange}
              isLast={true}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
            ]}
          >
            {t("support_and_help")}
          </Text>
          <View style={[styles.optionsCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="ticket-confirmation-outline"
              label={t("technical_support")}
              onPress={() => router.push("/tickets")}
            />
            <SettingRow
              icon="notifications-outline"
              label="Push notification test"
              onPress={() => router.push("/notification-test")}
            />
            <SettingRow
              icon="phone-outline"
              label={t("contact_customer_service")}
            />

            <SettingRow icon="frequently-asked-questions" label={t("faqs")} />

            <SettingRow
              icon="alert-circle-outline"
              label={t("report_problem")}
              isLast={true}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
            ]}
          >
            {t("about_app")}
          </Text>
          <View style={[styles.optionsCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="key-outline"
              label={t("terms_and_privacy")}
              isLast={true}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[
            styles.logoutContainer,
            { flexDirection: isRTL ? "row-reverse" : "row" },
            isLoggingOut && { opacity: 0.6 },
          ]}
          activeOpacity={0.7}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={Colors.red} />
          ) : (
            <>
              <MaterialCommunityIcons name="logout" size={24} color={Colors.red} />
              <Text
                style={[
                  styles.logoutText,
                  isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                ]}
              >
                {t("logout")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <ChangePasswordSheet ref={changePasswordSheetRef} />
      <ThemeSheet
        ref={themeSheetRef}
        currentPreference={themePreference}
        onSelectTheme={handleThemeSelect}
      />
    </View>
  );
}
