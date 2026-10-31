import { FontAssets } from "@/constants/fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nManager, InteractionManager, LogBox, Modal, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import NetworkLogger, {
  startNetworkLogging,
} from "react-native-network-logger";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { initLanguage } from "../utils/i18n";

import { ServerDownOverlay } from "@/components/ServerDownOverlay";
import { toastConfig } from "@/components/ui/toast-config";

import { setupInterceptors } from "@/utils/api";
import {
  registerForPushNotificationsAsync,
  setNotificationHandler,
} from "@/utils/push-notifications";
import * as Notifications from "expo-notifications";

LogBox.ignoreAllLogs();

// Configure how notifications appear when app is in foreground
setNotificationHandler();

// Start network logging
startNetworkLogging();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

// ... imports

export default function RootLayout() {
  const { i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts(FontAssets);
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  const { isAuthenticated, isLoading, initialize, logout } = useAuthStore();
  const initializeTheme = useThemeStore((s) => s.initialize);
  const segments = useSegments();
  const router = useRouter();
  const [showLogger, setShowLogger] = useState(false);
  const isRTL = i18n.resolvedLanguage?.startsWith("ar") ?? i18n.language?.startsWith("ar");
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const handledResponseId = useRef<string | null>(null);

  useEffect(() => {
    const bootstrapApp = async () => {
      // Keep the app layout LTR on real devices; per-screen RTL is handled manually.
      if (I18nManager.isRTL) {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        await Updates.reloadAsync();
        return;
      }

      await initLanguage();
      setIsI18nInitialized(true);
      initialize();
    };

    bootstrapApp().catch((error) => {
      console.error("App bootstrap failed:", error);
      setIsI18nInitialized(true);
      initialize();
    });
  }, [initialize]);

  useEffect(() => {
    initLanguage().then(() => {
      setIsI18nInitialized(true);
    });
    initializeTheme();

    // Setup API interceptors
    setupInterceptors({
      onUnauthenticated: () => {
        logout();
      },
    });

    initialize();
  }, [initialize, initializeTheme, logout]);

  useEffect(() => {
    if (isLoading || !isI18nInitialized || !loaded) return;

    const firstSegment = segments[0] as string;
    const secondSegment = segments[1] as string;

    // Check if we're in auth screens (login or register)
    // Handle both route group structure: ["(auth)", "login"] or ["(auth)", "register"]
    // and direct structure: ["login"] or ["register"]
    const isAuthScreen =
      (firstSegment === "(auth)" && (secondSegment === "login" || secondSegment === "register")) ||
      firstSegment === "login" ||
      firstSegment === "register";

    const inAuthGroup =
      isAuthScreen ||
      firstSegment === "splash" ||
      firstSegment === "onboarding" ||
      firstSegment === "otp-verification" ||
      firstSegment === "car-details" ||
      firstSegment === "index" ||
      firstSegment === "(auth)"; // Allow entire auth group

    const inTabsGroup = firstSegment === "(tabs)";

    if (!isAuthenticated && !inAuthGroup && !inTabsGroup) {
      // Redirect to login if not authenticated and trying to access app
      router.replace("/login");
    } else if (isAuthenticated && isAuthScreen) {
      // Redirect to tabs if authenticated and trying to access auth screens
      router.replace("/(tabs)/home" as any);
    }
  }, [isAuthenticated, segments, isLoading, isI18nInitialized, loaded, router]);

  useEffect(() => {
    if (loaded && isI18nInitialized && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isI18nInitialized, isLoading]);

  // Register for push notifications when user is authenticated (token sent in login/register)
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    registerForPushNotificationsAsync().then((token) => {
      if (token) __DEV__ && console.log("Expo push token:", token);
    });
  }, [isAuthenticated, isLoading]);

  // Listen for incoming notifications (title, body, sound from Expo push)
  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((n) => {
      __DEV__ && console.log("Notification received:", n.request.content.title, n.request.content.body, n.request.content.data);
    });
    return () => received.remove();
  }, []);

  // Handle notification tap (foreground, background, and cold start) — navigate as soon as app is ready
  useEffect(() => {
    const response = lastNotificationResponse;
    if (!response?.notification?.request?.content?.data || !router) return;
    if (!loaded || !isI18nInitialized || isLoading || !isAuthenticated) return;

    const id = response.notification.request.identifier;
    if (handledResponseId.current === id) return;
    handledResponseId.current = id;

    const data = response.notification.request.content.data as Record<string, unknown>;
    const type = data.type as string | undefined;
    const dataId = data.id != null ? Number(data.id) : undefined;

    InteractionManager.runAfterInteractions(() => {
      if (type === "cafe" && dataId != null) {
        router.push(`/cafe/orders/${dataId}` as any);
      } else if (type === "service-order" && dataId != null) {
        router.push(`/booking-details?id=${dataId}` as any);
      } else if (data.screen && typeof data.screen === "string") {
        router.push(data.screen as any);
      }
      Notifications.clearLastNotificationResponseAsync();
    });
  }, [lastNotificationResponse, loaded, isI18nInitialized, isLoading, isAuthenticated, router]);

  if (!loaded || !isI18nInitialized || isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              animation: isRTL ? "slide_from_left" : "slide_from_right",
            }}
          >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="splash/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="otp-verification/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="car-details/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="project-details/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="notifications/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="notification-test/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="service-details/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="service-addons/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="addon-details/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="booking-date/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="booking-payment/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="add-card/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="saved-cards/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="cafe/index" options={{ headerShown: false }} />
          <Stack.Screen name="cafe/cart" options={{ headerShown: false }} />
          <Stack.Screen name="cafe/orders/index" options={{ headerShown: false }} />
          <Stack.Screen name="cafe/orders/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="cafe/product-details" options={{ headerShown: false }} />
          <Stack.Screen
            name="bookings/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="booking-details/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="transaction/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="tickets/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="tickets/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="legal/[page]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="danger-area/index"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          </Stack>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2147483647, pointerEvents: "box-none" }}>
            <Toast config={toastConfig} />
          </View>
          <ServerDownOverlay />

          {__DEV__ && (
            <>
              <Pressable
                onPress={() => setShowLogger(true)}
                style={{
                  position: "absolute",
                  bottom: 100,
                  right: 20,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  padding: 10,
                  borderRadius: 20,
                  zIndex: 9999,
                }}
              >
                <Text style={{ color: "white", fontSize: 10 }}>Logs</Text>
              </Pressable>
              <Modal
                visible={showLogger}
                animationType="slide"
                onRequestClose={() => setShowLogger(false)}
              >
                <View style={{ flex: 1, paddingTop: 50 }}>
                  <Pressable
                    onPress={() => setShowLogger(false)}
                    style={{
                      padding: 15,
                      backgroundColor: "#f0f0f0",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "bold" }}>Close Logger</Text>
                  </Pressable>
                  <NetworkLogger />
                </View>
              </Modal>
            </>
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
