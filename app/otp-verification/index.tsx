import { ThemedText } from "@/components/themed-text";
import { CustomButton } from "@/components/ui/custom-button";
import { authService } from "@/services/auth-service";
import { carService } from "@/services/car-service";
import { useAuthStore } from "@/store/auth-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import styles from "./styles";

export default function OTPVerificationScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? "";
  const isRTL = i18n.language === "ar";
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 5 || !email) return;

    setIsLoading(true);
    try {
      const res = await authService.verifyEmailOtp(email, code);

      if (res?.user && res?.token) {
        await setAuth(res.user, res.token);
        Toast.show({
          type: "success",
          text1: t("success"),
          text2: t("registration_success"),
        });
        const cars = await carService.getCars();
        if (cars.length === 0) {
          router.replace("/car-details" as any);
        } else {
          router.replace("/(tabs)/home" as any);
        }
      } else {
        router.replace("/login" as any);
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      const errorMessage =
        error.response?.status === 429
          ? t("too_many_attempts")
          : (error.response?.data?.message || error.message || t("verification_failed"));
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;

    try {
      await authService.sendEmailOtp(email);
      setTimer(30);
      setOtp(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("code_resent"),
      });
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error.response?.status === 429
          ? t("too_many_attempts")
          : (error.response?.data?.message || error.message || t("resend_failed"));
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: errorMessage,
      });
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
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, isRTL && styles.backButtonRTL]}
            hitSlop={12}
          >
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={colors.primary}
            />
            <ThemedText style={[styles.backButtonText, { color: colors.primary }]}>{t("back")}</ThemedText>
          </Pressable>
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.content}>
            <ThemedText style={[styles.title, { color: colors.text.primary }]}>
              {t("confirm_email")}
            </ThemedText>
            {email ? (
              <ThemedText style={[styles.emailText, { color: colors.text.secondary }]}>{email}</ThemedText>
            ) : null}
            <ThemedText style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t("enter_verification_code")}
            </ThemedText>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text.primary },
                    digit && [styles.otpInputFilled, { borderColor: colors.primary, backgroundColor: colors.primary + "15" }],
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <View
              style={[
                styles.resendContainer,
                { alignItems: isRTL ? "flex-end" : "flex-start" },
              ]}
            >
              <ThemedText
                style={[
                  styles.resendText,
                  { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                ]}
              >
                {t("didnt_receive_code")}{" "}
                {timer > 0 ? (
                  <ThemedText style={[styles.timerText, { color: colors.primary }]}>
                    {t("resend_after")} 00:
                    {timer.toString().padStart(2, "0")} {t("seconds")}
                  </ThemedText>
                ) : (
                  <Pressable onPress={handleResend}>
                    <ThemedText style={[styles.resendLink, { color: colors.primary }]}>
                      {t("resend_code")}
                    </ThemedText>
                  </Pressable>
                )}
              </ThemedText>
            </View>

            <CustomButton
              title={t("next")}
              onPress={handleVerify}
              style={styles.verifyButton}
              isLoading={isLoading}
            // disabled={otp.join("").length !== 5}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
