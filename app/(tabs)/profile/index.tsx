import {
  ChangePasswordSheet,
  ChangePasswordSheetRef,
} from "@/components/ui/change-password-sheet";
import {
  LanguageSheet,
  LanguageSheetRef,
} from "@/components/ui/language-sheet";
import {
  ThemeSheet,
  ThemeSheetRef,
} from "@/components/ui/theme-sheet";
import { API_CONFIG } from "@/constants/api";
import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { authService } from "@/services/auth-service";
import { Car, carService } from "@/services/car-service";
import { paymentService } from "@/services/payment-service";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore, type ThemePreference } from "@/store/theme-store";
// import { applyNativeLayoutDirection, isAppRTL } from "@/utils/rtl";
import { storage } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import * as Updates from "expo-updates";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import styles from "./styles";

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const changePasswordSheetRef = useRef<ChangePasswordSheetRef>(null);
  const languageSheetRef = useRef<LanguageSheetRef>(null);
  const themeSheetRef = useRef<ThemeSheetRef>(null);
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);

  const [cars, setCars] = useState<Car[]>([]);
  const [savedCards, setSavedCards] = useState<{ id: number; last_four: string; brand?: string }[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNameEditModal, setShowNameEditModal] = useState(false);
  const [nameEditValue, setNameEditValue] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated, fetchMe]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCars();
    requestPermissions();
    if (user?.avatar_url) {
      setProfileImage(user.avatar_url);
    }
  }, [isAuthenticated, user?.avatar_url]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;
      fetchSavedCards();
    }, [isAuthenticated])
  );

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
  };

  const fetchCars = async () => {
    try {
      setIsLoadingCars(true);
      const fetchedCars = await carService.getCars();
      setCars(fetchedCars);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setIsLoadingCars(false);
    }
  };

  const fetchSavedCards = async () => {
    try {
      setIsLoadingCards(true);
      const cards = await paymentService.getSavedCards();
      setSavedCards(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      setSavedCards([]);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/(auth)/login" as any);
    } catch (error) {
      console.error("Logout error:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("logout_failed") || "Failed to logout",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user initials (first and second character)
  const getUserInitials = (name?: string): string => {
    if (!name) return "U";
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return "U";
    if (trimmedName.length === 1) return trimmedName[0].toUpperCase();
    // Get first character and second character (or first character of second word)
    const words = trimmedName.split(" ").filter(w => w.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return trimmedName.substring(0, 2).toUpperCase();
  };

  const userInitials = getUserInitials(user?.name);

  const getAvatarUri = (uri: string | null | undefined) => {
    if (!uri) return undefined;
    if (uri.startsWith("http") || uri.startsWith("file:")) return uri;
    return `${API_CONFIG.BASE_URL.replace("/api/v1", "").replace(/\/$/, "")}${uri.startsWith("/") ? uri : `/${uri}`}`;
  };
  const avatarSource = getAvatarUri(profileImage || user?.avatar_url || undefined);

  const handleOpenNameEdit = () => {
    setNameEditValue(user?.name ?? "");
    setShowNameEditModal(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameEditValue.trim();
    if (!trimmed) {
      Toast.show({ type: "error", text1: t("error"), text2: t("name_required") });
      return;
    }
    try {
      setIsUpdatingName(true);
      const updatedUser = await authService.updateMe({ name: trimmed });
      await updateUser(updatedUser);
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("profile_updated_successfully"),
      });
      setShowNameEditModal(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t("failed_to_load_service");
      Toast.show({ type: "error", text1: t("error"), text2: msg });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "";
    // Format phone number for display
    return phone;
  };

  const handleImagePicker = () => {
    Alert.alert(
      t("select_image"),
      t("choose_option"),
      [
        {
          text: t("camera"),
          onPress: openCamera,
        },
        {
          text: t("photo_library"),
          onPress: openImageLibrary,
        },
        {
          text: t("cancel"),
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const uploadAvatar = async (base64: string, localUri: string) => {
    try {
      setIsUploadingAvatar(true);
      const updatedUser = await authService.updateAvatar(base64);
      await updateUser(updatedUser);
      setProfileImage(updatedUser.avatar_url || localUri);
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("profile_image_updated"),
      });
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      const msg = err.response?.data?.message || err.message || t("failed_to_load_service");
      Toast.show({ type: "error", text1: t("error"), text2: msg });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64 = asset.base64;
        if (base64) {
          await uploadAvatar(base64, asset.uri);
        } else {
          setProfileImage(asset.uri);
          Toast.show({
            type: "error",
            text1: t("error"),
            text2: t("failed_to_load_service"),
          });
        }
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("camera_error"),
      });
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64 = asset.base64;
        if (base64) {
          await uploadAvatar(base64, asset.uri);
        } else {
          setProfileImage(asset.uri);
          Toast.show({
            type: "error",
            text1: t("error"),
            text2: t("failed_to_load_service"),
          });
        }
      }
    } catch (error) {
      console.error("Error opening image library:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("library_error"),
      });
    }
  };

  const themeLabelKey = (pref: ThemePreference) =>
    pref === "light" ? "theme_light" : pref === "dark" ? "theme_dark" : "theme_system";

  const handleThemeSelect = async (preference: ThemePreference) => {
    await setThemePreference(preference);
  };

  const handleLanguageChange = async (lang: "ar" | "en") => {
    try {
      if (i18n.language === lang) return;
      await storage.setItem("language", lang);
      await i18n.changeLanguage(lang);
      setTimeout(() => {
        Updates.reloadAsync().catch((err) => {
          console.error("Reload failed:", err);
        });
      }, 500);
      // await applyNativeLayoutDirection(isAppRTL(i18n));
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]} edges={["top"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              marginBottom: 8,
              textAlign: "center",
              color: colors.text.primary,
            }}
          >
            {t("login")}
          </Text>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 24,
              textAlign: "center",
              color: colors.text.secondary,
            }}
          >
            {t("login_to_workspace")}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/login" as any)}
            style={{
              backgroundColor: Colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: Colors.white, fontWeight: "600", fontSize: 16 }}>
              {t("login")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <View
            style={[styles.backButton, { backgroundColor: colors.surface }]}
          />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            {t("personal_profile")}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {avatarSource ? (
              <Image
                source={{ uri: avatarSource }}
                style={[styles.avatar, { borderColor: colors.primary }]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarInitials]}>
                <Text style={styles.avatarText}>{userInitials}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.cameraIcon,
                { backgroundColor: colors.surface, borderColor: colors.primary },
                isRTL ? { left: undefined, right: 0 } : { right: undefined, left: 0 },
              ]}
              onPress={handleImagePicker}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="camera" size={16} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text.primary }]}>
            {user?.name}
          </Text>
          {/* <Text style={styles.memberSince}>
            {t("member_since")} {getMemberSinceYear()}
          </Text> */}
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
            ]}
          >
            {t("personal_information")}
          </Text>

          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            {/* First Name */}
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row", borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {t("first_name")}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                  ]}
                >
                  {user?.name?.split(" ")[0]}
                </Text>
              </View>
              <TouchableOpacity style={styles.editIcon} onPress={handleOpenNameEdit}>
                <Image source={require("@/assets/images/edit.png")}
                  resizeMode="cover" style={{ width: 20, height: 20 }} />
              </TouchableOpacity>
            </View>

            {/* Name edit modal */}
            <Modal
              visible={showNameEditModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowNameEditModal(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 24,
                }}
                onPress={() => setShowNameEditModal(false)}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 20,
                    width: "100%",
                    maxWidth: 340,
                  }}
                >
                  <Text style={[styles.infoLabel, { marginBottom: 8, textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                    {t("first_name")}
                  </Text>
                  <TextInput
                    value={nameEditValue}
                    onChangeText={setNameEditValue}
                    placeholder={t("enter_name")}
                    placeholderTextColor={colors.text.secondary}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      fontSize: 16,
                      color: colors.text.primary,
                      textAlign: isRTL ? "right" : "left",
                    }}
                    editable={!isUpdatingName}
                  />
                  <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 12, marginTop: 16 }}>
                    <TouchableOpacity
                      onPress={() => setShowNameEditModal(false)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: colors.border,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: colors.text.primary }}>{t("cancel")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveName}
                      disabled={isUpdatingName}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: Colors.primary,
                        alignItems: "center",
                      }}
                    >
                      {isUpdatingName ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Text style={{ color: Colors.white, fontWeight: "600" }}>{t("save")}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>

            {/* Email */}
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row", borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {t("email")}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                  ]}
                >
                  {user?.email || "—"}
                </Text>
              </View>
            </View>

            {/* Phone Number */}
            <View
              style={[
                styles.infoRow,
                { flexDirection: isRTL ? "row-reverse" : "row", borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {t("phone_number")}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                  ]}
                >
                  {formatPhoneNumber(user?.phone)}
                </Text>
              </View>
              {/* <TouchableOpacity style={styles.editIcon}>
                <Image source={require("@/assets/images/edit.png")}
                  resizeMode="cover" style={{ width: 20, height: 20 }} />
              </TouchableOpacity> */}
            </View>

            {/* Payment Methods */}
            <TouchableOpacity
              style={[
                styles.infoRow2,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={() => router.push("/saved-cards" as any)}
            >
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {t("payment_methods")}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                  ]}
                >
                  {isLoadingCards
                    ? t("loading")
                    : savedCards.length === 0
                      ? t("no_saved_cards")
                      : savedCards.length === 1
                        ? `**** ${savedCards[0].last_four} (${savedCards[0].brand || "card"})`
                        : t("saved_cards_count", { count: savedCards.length }) ||
                        `${savedCards.length} ${t("saved_cards")}`}
                </Text>
              </View>
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* My Cars Section */}
        <View style={styles.section}>
          <View
            style={[
              styles.sectionHeader,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { textAlign: isRTL ? "right" : "left", marginBottom: 0, color: colors.text.primary },
              ]}
            >
              {t("my_cars")}
            </Text>
            <TouchableOpacity
              style={[
                styles.addVehicleButton,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={() => router.push("/car-details")}
            >
              <Image source={require("@/assets/images/add.png")}
                resizeMode="cover" style={{ width: 24, height: 24 }} />
              <Text style={styles.addVehicleText}>
                {t("add_vehicle")}
              </Text>
            </TouchableOpacity>
          </View>

          {isLoadingCars ? (
            <ActivityIndicator
              size="small"
              color={Colors.primary}
              style={styles.loadingIndicator}
            />
          ) : cars.length === 0 ? (
            <View style={[styles.emptyCarsContainer, { backgroundColor: colors.surface }]}>
              <Text
                style={[
                  styles.emptyCarsText,
                  { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                ]}
              >
                {t("no_cars")}
              </Text>
            </View>
          ) : (
            <View style={styles.carsList}>
              {cars.map((car) => (
                <View
                  key={car.id}
                  style={[
                    styles.carCard,
                    { backgroundColor: colors.surface, flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <View style={[styles.carIcon, { backgroundColor: colors.appBackground }]}>
                    <Ionicons
                      name="car-outline"
                      size={24}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.carInfo}>
                    <Text
                      style={[
                        styles.carModel,
                        { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                      ]}
                    >
                      {car.car_model}
                    </Text>
                    <Text
                      style={[
                        styles.carPlate,
                        { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                      ]}
                    >
                      {car.plate_number}
                    </Text>
                  </View>
                  <View style={[styles.carActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <TouchableOpacity
                      style={styles.carEditIcon}
                      onPress={() => {
                        router.push({
                          pathname: "/car-details",
                          params: { carId: car.id, carModel: car.car_model, plateNumber: car.plate_number },
                        } as any);
                      }}
                    >
                      <Image source={require("@/assets/images/edit.png")}
                        resizeMode="cover" style={{ width: 20, height: 20 }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.carEditIcon}
                      onPress={() => {
                        Alert.alert(
                          t("delete_car") || "Delete Car",
                          t("delete_car_confirm") || "Are you sure you want to delete this car?",
                          [
                            { text: t("cancel") || "Cancel", style: "cancel" },
                            {
                              text: t("delete") || "Delete",
                              style: "destructive",
                              onPress: async () => {
                                try {
                                  await carService.deleteCar(car.id);
                                  setCars((prev) => prev.filter((c) => c.id !== car.id));
                                  const selectedId = await storage.getItem("selected_car_id");
                                  if (selectedId === car.id) {
                                    await storage.removeItem("selected_car_id");
                                  }
                                  Toast.show({ type: "success", text1: t("success"), text2: t("car_deleted_successfully") || "Car deleted successfully" });
                                } catch {
                                  Toast.show({ type: "error", text1: t("error"), text2: t("failed_to_delete_car") || "Failed to delete car" });
                                }
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Support & Legal Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
            ]}
          >
            {t("support_and_legal")}
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[
                styles.settingRow2,
                { flexDirection: isRTL ? "row-reverse" : "row", borderBottomColor: colors.border },
              ]}
              onPress={() => router.push("/tickets" as any)}
            >
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
                  {t("support_tickets")}
                </Text>
                <Text style={[styles.settingSubtitle, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                  {t("support_tickets_desc")}
                </Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingRow2,
                { flexDirection: isRTL ? "row-reverse" : "row", borderBottomColor: colors.border },
              ]}
              onPress={() => router.push("/legal/terms" as any)}
            >
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
                  {t("terms_of_use")}
                </Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingRow2,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={() => router.push("/legal/privacy" as any)}
            >
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
                  {t("privacy_policy")}
                </Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Application Settings Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
            ]}
          >
            {t("application_settings")}
          </Text>

          <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
            {/* Notifications */}
            <View
              style={[
                styles.settingRow,
                { flexDirection: isRTL ? "row-reverse" : "row", borderBottomColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={styles.settingContent}
                activeOpacity={1}
                onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <Text
                  style={[
                    styles.settingLabel,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                  ]}
                >
                  {t("notifications")}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {t("manage_app_alerts")}
                </Text>
              </TouchableOpacity>
              <View style={{ padding: 5 }}>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => {
                    setNotificationsEnabled(value);
                  }}
                  trackColor={{
                    false: "#E9E9EA",
                    true: Colors.switchColor,
                  }}
                  thumbColor={Colors.white}
                  ios_backgroundColor="#E9E9EA"
                />
              </View>
            </View>

            {/* Change Password */}
            <TouchableOpacity
              style={[
                styles.settingRow2,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={() => {
                if (changePasswordSheetRef.current) {
                  changePasswordSheetRef.current.open();
                } else {
                  console.warn("ChangePasswordSheet ref is not available");
                }
              }}
            >
              <View style={styles.settingContent}>
                <Text
                  style={[
                    styles.settingLabel,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                  ]}
                >
                  {t("change_password")}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {t("update_account_password")}
                </Text>
              </View>
              <Image
                source={require("@/assets/images/edit.png")}
                resizeMode="cover"
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>

            {/* Language */}
            <TouchableOpacity
              style={[
                styles.settingRow2,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={() => languageSheetRef.current?.open()}
            >
              <View style={styles.settingContent}>
                <Text
                  style={[
                    styles.settingLabel,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                  ]}
                >
                  {t("language_and_preferences")}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {i18n.language === "ar" ? "العربية" : "English"}
                </Text>
              </View>
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>

            {/* Appearance / Theme */}
            <TouchableOpacity
              style={[
                styles.settingRow2,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={() => themeSheetRef.current?.open()}
            >
              <View style={styles.settingContent}>
                <Text
                  style={[
                    styles.settingLabel,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.primary },
                  ]}
                >
                  {t("theme_appearance")}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {t(themeLabelKey(themePreference))}
                </Text>
              </View>
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>

            {/* Danger Area */}
            <TouchableOpacity
              style={[
                styles.settingRow2,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              onPress={() => router.push("/danger-area" as any)}
            >
              <View style={styles.settingContent}>
                <Text
                  style={[
                    styles.settingLabel,
                    { textAlign: isRTL ? "right" : "left", color: Colors.error },
                  ]}
                >
                  {t("danger_area")}
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    { textAlign: isRTL ? "right" : "left", color: colors.text.secondary },
                  ]}
                >
                  {t("delete_account")}
                </Text>
              </View>
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={20}
                color={Colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: colors.surface, flexDirection: isRTL ? "row-reverse" : "row" },
            isLoggingOut && { opacity: 0.6 },
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={Colors.logoutText} />
          ) : (
            <>
              <Text style={styles.logoutText}>{t("logout")}</Text>
              <Image source={require("@/assets/images/logout.png")}
                resizeMode="cover" style={{ width: 24, height: 24 }} />
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <ChangePasswordSheet ref={changePasswordSheetRef} />
      <LanguageSheet
        ref={languageSheetRef}
        onSelectLanguage={handleLanguageChange}
      />
      <ThemeSheet
        ref={themeSheetRef}
        currentPreference={themePreference}
        onSelectTheme={handleThemeSelect}
      />
    </SafeAreaView>
  );
}
