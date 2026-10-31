import { ThemedView } from "@/components/themed-view";
import { DEVICE_PUSH_TOKEN_KEY, storage } from "@/utils/storage";
import { registerForPushNotificationsAsync } from "@/utils/push-notifications";
import { registerNotificationsOnAppOpen } from "@/utils/notifications";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import styles from "./styles";

export default function SplashScreen() {
  const router = useRouter();

  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });
    translateY.value = withTiming(0, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });

    let timer: ReturnType<typeof setTimeout>;

    const savePushToken = async () => {
      try {
        const token =
          (await registerNotificationsOnAppOpen()) ??
          (await registerForPushNotificationsAsync());
        if (token) await storage.setItem(DEVICE_PUSH_TOKEN_KEY, token);
      } catch {
        // ignore
      }
    };

    const checkOnboarding = async () => {
      savePushToken();
      const onboardingCompleted = await storage.getItem("@onboarding_completed");
      timer = setTimeout(() => {
        if (onboardingCompleted === "true") {
          router.replace("/login");
        } else {
          router.replace("/onboarding");
        }
      }, 3000);
    };

    checkOnboarding();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [opacity, scale, translateY, router]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </ThemedView>
  );
}
