import { ThemedText } from "@/components/themed-text";
import { CustomButton } from "@/components/ui/custom-button";
import { CustomInput } from "@/components/ui/custom-input";
import { PhoneCountryCode } from "@/components/ui/phone-country-code";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { authService } from "@/services/auth-service";
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

export default function RegisterScreen() {
  const colors = useThemeColors();
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const normalizeSaudiPhone = (value: string): string | null => {
    const digits = value.replace(/\D/g, "");
    if (/^5\d{8}$/.test(digits)) return digits;
    if (/^05\d{8}$/.test(digits)) return digits.slice(1);
    if (/^9665\d{8}$/.test(digits)) return digits.slice(3);
    return null;
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const normalizedPhone = normalizeSaudiPhone(formData.phone);

    if (!formData.name) {
      newErrors.name = t("name_required");
    }
    if (!formData.email) {
      newErrors.email = t("email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("email_invalid");
    }
    if (!formData.phone) {
      newErrors.phone = t("phone_required");
    } else if (!normalizedPhone) {
      newErrors.phone = t("phone_invalid");
    }
    if (!formData.password) {
      newErrors.password = t("password_required");
    } else if (formData.password.length < 6) {
      newErrors.password = t("password_too_short");
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("passwords_dont_match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const ensurePushToken = async () => {
      let token = await getStoredPushToken();
      if (!token) {
        token = await registerForPushNotificationsAsync();
        if (token) await storage.setItem(DEVICE_PUSH_TOKEN_KEY, token);
      }
    };
    if (isFocused) ensurePushToken();
  }, [isFocused]);

  const handleRegister = async () => {
    if (!validate()) return;

    setErrors({});
    setIsLoading(true);
    try {
      const normalizedPhone = normalizeSaudiPhone(formData.phone);
      if (!normalizedPhone) {
        setErrors((prev) => ({ ...prev, phone: t("phone_invalid") }));
        setIsLoading(false);
        return;
      }

      // Ensure push token is in storage so auth-service can send it with register
      let token = await getStoredPushToken();
      if (!token) {
        token = await registerForPushNotificationsAsync();
        if (token) await storage.setItem(DEVICE_PUSH_TOKEN_KEY, token);
      }

      await authService.register({
        name: formData.name,
        email: formData.email,
        phone: normalizedPhone,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("code_sent_to_email"),
      });

      router.push({
        pathname: "/otp-verification",
        params: { email: formData.email },
      } as any);
    } catch (error: any) {
      const isRateLimited = error.response?.status === 429;
      const errorMessage = isRateLimited
        ? t("too_many_attempts")
        : (error.response?.data?.message || error.message || t("register_failed"));
      const errorDetails = error.response?.data?.errors;

      if (!isRateLimited && errorDetails && typeof errorDetails === "object") {
        const validationErrors: { [key: string]: string } = {};
        Object.keys(errorDetails).forEach((key) => {
          const val = errorDetails[key];
          validationErrors[key] = Array.isArray(val) ? val[0] : String(val ?? "");
        });
        setErrors(validationErrors);
      }

      Toast.show({
        type: "error",
        text1: t("error"),
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.appBackground }]} edges={[]}>
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
          </View>

          <View style={styles.content}>
            <ThemedText style={[styles.title, { color: colors.text.primary }]}>{t("create_account")}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t("create_account_subtitle")}
            </ThemedText>

            <View style={styles.form}>
              <CustomInput
                label={t("name")}
                placeholder={t("name")}
                value={formData.name}
                onChangeText={(val) => updateFormData("name", val)}
                error={errors.name}
              />
              <CustomInput
                label={t("email")}
                placeholder={t("email")}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(val) => updateFormData("email", val)}
                error={errors.email}
              />
              <CustomInput
                label={t("phone_number")}
                placeholder={t("phone_number")}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(val) => updateFormData("phone", val)}
                error={errors.phone}
                leftComponent={<PhoneCountryCode code="966" />}
                textContentType="telephoneNumber"
              // forceLTR={true}
              />
              <CustomInput
                label={t("password")}
                placeholder={t("password")}
                secureTextEntry
                value={formData.password}
                onChangeText={(val) => updateFormData("password", val)}
                error={errors.password}
              />
              <CustomInput
                label={t("confirm_password")}
                placeholder={t("confirm_password")}
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(val) => updateFormData("confirmPassword", val)}
                error={errors.confirmPassword}
              />

              <CustomButton
                title={t("next")}
                onPress={handleRegister}
                style={styles.nextButton}
                isLoading={isLoading}
              />

              <Pressable
                onPress={() => router.push("/login")}
                style={styles.loginLink}
              >
                <ThemedText style={[styles.loginLinkText, { color: colors.text.secondary }]}>
                  {t("already_have_account")}{" "}
                  <ThemedText style={[styles.loginLinkHighlight, { color: colors.primary }]}>
                    {t("login")}
                  </ThemedText>
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
