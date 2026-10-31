import { Colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Fonts } from "@/constants/fonts";
import { MOYASAR_BASE_URL, MOYASAR_PUBLISHABLE_KEY } from "@/constants/payment";
import { paymentService } from "@/services/payment-service";
import { getMoyasarFormStyle } from "@/utils/moyasar-form-style";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CreditCard,
  CreditCardConfig,
  PaymentConfig,
  PaymentResponse,
  PaymentStatus,
} from "react-native-moyasar-sdk";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function AddCardScreen() {
  const colors = useThemeColors();
  const appColorScheme = useColorScheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moyasarFormStyle = useMemo(
    () => getMoyasarFormStyle(colors, appColorScheme),
    [colors, appColorScheme]
  );

  const paymentConfig = useMemo(
    () =>
      new PaymentConfig({
        publishableApiKey: MOYASAR_PUBLISHABLE_KEY,
        baseUrl: MOYASAR_BASE_URL,
        amount: 100,
        currency: "SAR",
        merchantCountryCode: "SA",
        description: t("add_card_description") ?? "Save card for future payments (1 SAR verification)",
        metadata: { save_card: "true" },
        supportedNetworks: ["mada", "visa", "mastercard", "amex"],
        creditCard: new CreditCardConfig({ saveCard: true, manual: false }),
      }),
    [t]
  );

  const onPaymentResult = async (paymentResult: import("react-native-moyasar-sdk").PaymentResult) => {
    setError(null);
    if (paymentResult instanceof PaymentResponse) {
      if (paymentResult.status === PaymentStatus.paid) {
        const paymentId = (paymentResult as PaymentResponse & { id?: string }).id;
        if (!paymentId) {
          setError(t("payment_failed"));
          return;
        }

        setIsLoading(true);
        try {
          await paymentService.saveCardFromPayment(paymentId);
          Toast.show({
            type: "success",
            text1: t("success"),
            text2: t("card_saved") ?? "Card saved successfully",
          });
          router.back();
        } catch (err) {
          setError(
            (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
              ?.message ?? (err as Error)?.message ?? t("payment_failed")
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        setError(t("payment_failed"));
      }
    } else {
      setError(t("payment_failed"));
    }
  };

  const handleTryAgain = () => {
    setError(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <MaterialIcons
            name={isRTL ? "arrow-forward-ios" : "arrow-back-ios"}
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("add_card")}</Text>
        <View style={styles.headerButton} />
      </View>

      <Text style={[styles.description, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
        {t("add_card_description")}
      </Text>

      {isLoading && (
        <View
          style={[StyleSheet.absoluteFill, styles.loadingOverlay, { backgroundColor: colors.appBackground + "E6" }]}
          pointerEvents="auto"
          onStartShouldSetResponder={() => true}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>{t("saving")}</Text>
        </View>
      )}

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.errorIconWrap}>
            <MaterialIcons name="error-outline" size={48} color={Colors.statusCancelled} />
          </View>
          <Text style={[styles.errorTitle, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}>
            {t("add_card_failed")}
          </Text>
          <Text style={[styles.errorMessage, { color: colors.text.secondary, textAlign: isRTL ? "right" : "left" }]}>
            {error}
          </Text>
          <View style={[styles.errorActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <TouchableOpacity
              style={[styles.errorButton, styles.tryAgainButton, { backgroundColor: colors.primary }]}
              onPress={handleTryAgain}
            >
              <Text style={styles.errorButtonText}>{t("try_again")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.errorButton, styles.backButton, { borderColor: colors.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.backButtonText, { color: colors.text.primary }]}>{t("back")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <CreditCard
            paymentConfig={paymentConfig}
            onPaymentResult={onPaymentResult}
            style={moyasarFormStyle}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.apple,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
    marginHorizontal: 20,
    marginBottom: 20,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  loadingOverlay: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.CairoMedium,
  },
  errorContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  errorIconWrap: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: Fonts.CairoSemiBold,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    marginBottom: 24,
    lineHeight: 20,
  },
  errorActions: {
    gap: 12,
  },
  errorButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  tryAgainButton: {},
  backButton: {
    borderWidth: 1,
  },
  errorButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.white,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
  },
});
