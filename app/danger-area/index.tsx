import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import styles from "./styles";

export default function DangerAreaScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;
    try {
      setIsDeletingAccount(true);
      await authService.deleteAccount();
      await logout();
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("account_deleted_successfully") || "Account deleted successfully",
      });
      router.replace("/(auth)/login" as any);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        t("delete_account_failed") ||
        "Failed to delete account";
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: message,
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      t("delete_account") || "Delete Account",
      t("delete_account_confirm") ||
        "Are you sure you want to permanently delete your account?",
      [
        { text: t("cancel") || "Cancel", style: "cancel" },
        {
          text: t("delete") || "Delete",
          style: "destructive",
          onPress: handleDeleteAccount,
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.appBackground }]}
      edges={["top"]}
    >
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={22}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t("danger_area")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: Colors.red }]}>
        <Text style={[styles.title, { color: Colors.red }]}>
          {t("delete_account")}
        </Text>
        <Text style={[styles.description, { color: colors.text.secondary }]}>
          {t("danger_area_description")}
        </Text>

        <TouchableOpacity
          style={[styles.deleteButton, isDeletingAccount && { opacity: 0.6 }]}
          onPress={confirmDelete}
          disabled={isDeletingAccount}
          activeOpacity={0.8}
        >
          {isDeletingAccount ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={Colors.white} />
              <Text style={styles.deleteButtonText}>{t("delete_account")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
