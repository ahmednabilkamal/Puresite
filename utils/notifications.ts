import * as Notifications from "expo-notifications";
import { DEVICE_PUSH_TOKEN_KEY, storage } from "@/utils/storage";

export async function registerNotificationsOnAppOpen(): Promise<string | null> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await storage.setItem(DEVICE_PUSH_TOKEN_KEY, token);
    console.log("Expo push token:", token);
    return token;
  } catch {
    return null;
  }
}

