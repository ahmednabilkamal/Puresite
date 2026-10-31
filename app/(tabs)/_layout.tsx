import { CustomTabBar } from "@/components/ui/custom-tab-bar";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: t("home"),
        }}
      />
      {/* <Tabs.Screen
        name="home/styles"
        options={{
          href: null,
        }}
      /> */}

      <Tabs.Screen
        name="cafe/index"
        options={{
          title: t("cafe"),
        }}
      />

      <Tabs.Screen
        name="bookings/index"
        options={{
          title: t("orders"),
        }}
      />
      {/* <Tabs.Screen
        name="bookings/styles"
        options={{
          href: null,
        }}
      /> */}

      <Tabs.Screen
        name="tracking/index"
        options={{
          title: t("tracking"),
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: t("profile"),
        }}
      />
      {/* <Tabs.Screen
        name="profile/styles"
        options={{
          href: null,
        }}
      /> */}

      <Tabs.Screen
        name="settings/index"
        options={{
          href: null,
        }}
      />
      {/* <Tabs.Screen
        name="settings/styles"
        options={{
          href: null,
        }}
      /> */}

      {/* <Tabs.Screen
        name="saved/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="saved/styles"
        options={{
          href: null,
        }}
      /> */}
    </Tabs>
  );
}
