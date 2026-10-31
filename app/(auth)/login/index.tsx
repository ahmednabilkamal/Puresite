import { ThemedText } from "@/components/themed-text";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomInput } from "@/components/ui/custom-input";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { getStoredPushToken, registerForPushNotificationsAsync } from "@/utils/push-notifications";
import { DEVICE_PUSH_TOKEN_KEY, storage } from "@/utils/storage";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import styles from "./styles";

export default function LoginScreen() {
  const colors = useThemeColors();
  const isFocused = useIsFocused();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [pushToken, setPushToken] = useState<string>("");

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = t("email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("email_invalid");
    }

    if (!password) {
      newErrors.password = t("password_required");
    } else if (password.length < 6) {
      newErrors.password = t("password_too_short");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    getPushToken()
  }, [isFocused]);


  const getPushToken = async () => {
    let token = await getStoredPushToken();
    if (!token) {
      token = await registerForPushNotificationsAsync();
      if (token) { await storage.setItem(DEVICE_PUSH_TOKEN_KEY, token); console.log("token", token); }
      else {
        console.log("hhh");

      }
    }
    if (token) setPushToken(token);
  };
  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const tokenToSend = pushToken || (await getStoredPushToken()) || "";
      const response = await authService.login(email, password, tokenToSend);
      await setAuth(response.user, response.token);
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("login_success"),
      });
      router.replace("/(tabs)/home" as any);
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.status === 429
          ? t("too_many_attempts")
          : (error.response?.data?.message || error.message || t("login_failed"));
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    router.replace("/(tabs)/home" as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.appBackground }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="cover"
            />

            <ThemedText style={[styles.welcomeText, { color: colors.text.primary }]}>{t("welcome")}</ThemedText>
            <ThemedText style={[styles.subtitleText, { color: colors.text.secondary }]}>
              {t("login_to_workspace")}
            </ThemedText>
          </View>

          <View style={styles.form}>
            <CustomInput
              label={t("email")}
              placeholder={t("email")}
              keyboardType="email-address"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              autoCapitalize="none"
              error={errors.email}
              textContentType="emailAddress"
            />
            <CustomInput
              label={t("password")}
              placeholder={t("password")}
              secureTextEntry
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={errors.password}
            />

            <CustomButton
              title={t("login")}
              onPress={handleLogin}
              style={styles.loginButton}
              isLoading={isLoading}
            />

            <Pressable
              style={styles.guestLink}
              onPress={handleContinueAsGuest}
              disabled={isLoading}
            >
              <ThemedText style={[styles.guestLinkText, { color: colors.primary }]}>
                {t("continue_as_guest")}
              </ThemedText>
            </Pressable>

            <View
              style={[
                styles.footer,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <ThemedText style={[styles.footerText, { color: colors.text.secondary }]}>
                {t("dont_have_account")}
              </ThemedText>
              <Pressable onPress={() => router.push("/register")}>
                <ThemedText style={[styles.footerLink, { color: colors.primary }]}>
                  {t("register")}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
