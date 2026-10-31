import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function AuthLayout() {
  const { i18n } = useTranslation();
  const isRTL = i18n.resolvedLanguage?.startsWith("ar") ?? i18n.language?.startsWith("ar");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
        animation: isRTL ? "slide_from_left" : "slide_from_right",
      }}
    >
      <Stack.Screen name="login/index" />
      <Stack.Screen name="register/index" />
    </Stack>
  );
}
