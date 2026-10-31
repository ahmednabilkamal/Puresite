import { Colors } from "@/constants/colors";
import { DEVICE_PUSH_TOKEN_KEY, storage } from "@/utils/storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Configure how notifications are presented when the app is in the foreground.
 * Title, body, and sound are shown/played. Call early in root _layout.
 */
export function setNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}

/**
 * Request permissions and return the Expo push token for this device.
 * Returns null on simulator, when permission is denied, or on error.
 * Use a physical device for push notifications.
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: Colors.primary,
      enableVibrate: true,
      sound: "default",
      enableLights: true,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    return null;
  }

  try {
    const tokenResult = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return tokenResult.data;
  } catch {
    return null;
  }
}

/**
 * Get the stored device push token (saved in splash). Use for debugging or test screens.
 */
export async function getStoredPushToken(): Promise<string | null> {
  return storage.getItem(DEVICE_PUSH_TOKEN_KEY);
}
