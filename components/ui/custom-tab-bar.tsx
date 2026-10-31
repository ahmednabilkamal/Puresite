import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import Icons - Inactive
const HomeIcon = require("@/assets/icons/mynaui_home.png");
const BookingsIcon = require("@/assets/icons/uil_calender.png");
const TrackingIcon = require("@/assets/icons/tracking.png");
const ProfileIcon = require("@/assets/icons/my_account.png");

// Import Icons - Active/Pressed
const HomeIconActive = require("@/assets/icons/pressed_home.png");
const BookingsIconActive = require("@/assets/icons/pressed_uil_calender.png");
const TrackingIconActive = require("@/assets/icons/active_tracking.png");
const ProfileIconActive = require("@/assets/icons/pressed_my_account.png");

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === "ar";

  const TAB_ITEMS = [
    {
      name: "home/index",
      label: t("home"),
      icon: HomeIcon,
      iconActive: HomeIconActive,
    },
    {
      name: "cafe/index",
      label: t("cafe"),
      icon: BookingsIcon,
      iconActive: BookingsIconActive,
    },
    {
      name: "bookings/index",
      label: t("orders"),
      icon: TrackingIcon,
      iconActive: TrackingIconActive,
    },
    // Tracking tab is currently disabled in the Tabs layout
    // {
    //   name: "tracking/index",
    //   label: t("tracking"),
    //   icon: TrackingIcon,
    //   iconActive: TrackingIconActive,
    // },
    {
      name: "profile/index",
      label: t("profile"),
      icon: ProfileIcon,
      iconActive: ProfileIconActive,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        {
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 10,
          height: Platform.OS === "ios" ? 70 + insets.bottom : 80,
          paddingEnd: !isRTL ? 0 : 20,
          paddingStart: !isRTL ? 20 : 0,
        },
      ]}
    >
      <View
        style={[
          styles.content,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        {TAB_ITEMS.map((item, index) => {
          // Find the route that matches this tab item
          const route = state.routes.find((r) => r.name === item.name);

          // If route doesn't exist (e.g. href: null or not registered), render dummy or skip?
          // Since we fixed the array, we expect these routes to exist. 
          // If a route is missing from navigation state (e.g. tracking/index not registered yet), we should handle gracefuly.
          if (!route) return null;

          const { options } = descriptors[route.key];

          // Determine if focused
          const isFocused = state.index === state.routes.indexOf(route);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,

            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const color = isFocused ? colors.primary : colors.text.light;
          const size = 24;
          const iconSource = isFocused ? item.iconActive : item.icon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <View
                  style={[
                    styles.iconContainer,
                  ]}
                >
                  <Image
                    source={iconSource}
                    style={{
                      width: size,
                      height: size,
                      tintColor: isFocused ? undefined : color,
                      resizeMode: 'contain',
                      opacity: isFocused ? 1 : 0.6,
                    }}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    { color: color, marginTop: 4 }
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              {/* No top indicator in new design */}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    height: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  tabLabel: {
    fontFamily: Fonts.CairoRegular,
    fontSize: 12,
    textAlign: 'center',
  },
});
