import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

/** Redirects to bookings tab (cafe orders list) */
export default function CafeOrdersIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(tabs)/bookings");
  }, [router]);
  return <View style={{ flex: 1 }} />;
}
