import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

/** Redirects to bookings (orders) tab */
export default function TrackingScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(tabs)/bookings");
  }, [router]);
  return <View style={{ flex: 1 }} />;
}
