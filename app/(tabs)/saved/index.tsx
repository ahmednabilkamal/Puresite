import { ProjectItem } from "@/components/ProjectItem";
import {
  FilterBottomSheet,
  FilterBottomSheetRef,
} from "@/components/ui/filter-bottom-sheet";
import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./styles";

const FAVORITE_PROJECTS = (t: any) => [
  {
    id: "1",
    title: t("clinic_management_title"),
    description: t("clinic_management_desc"),
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    tags: [
      { text: t("health_tech_tag"), color: "#E1F5FE", textColor: "#039BE5" },
      { text: t("riyadh_saudi_tag"), color: "#E8F5E9", textColor: "#43A047" },
    ],
    investmentSize: t("investment_amount_val"),
    opportunityType: t("partial_partnership"),
    projectStatus: t("completed"),
  },
  {
    id: "2",
    title: t("clinic_management_title"),
    description: t("clinic_management_desc"),
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    tags: [
      { text: t("health_tech_tag"), color: "#E1F5FE", textColor: "#039BE5" },
      { text: t("riyadh_saudi_tag"), color: "#E8F5E9", textColor: "#43A047" },
    ],
    investmentSize: t("investment_amount_val"),
    opportunityType: t("partial_partnership"),
    projectStatus: t("completed"),
  },
];

export default function SavedScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";
  const filterSheetRef = useRef<FilterBottomSheetRef>(null);

  const favorites = FAVORITE_PROJECTS(t);

  return (
    <View style={[styles.container, { backgroundColor: colors.appBackground }]}>
      <FlatList
        data={favorites}
        renderItem={({ item }) => <ProjectItem item={item} isFavorite={true} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View
              style={[
                styles.header,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("favorite_projects")}</Text>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push("/notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#002347"
                />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View
              style={[
                styles.searchContainer,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <View
                style={[
                  styles.searchBar,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <Ionicons name="search-outline" size={20} color="#999" />
                <TextInput
                  placeholder={t("search_here")}
                  style={[
                    styles.searchInput,
                    { textAlign: isRTL ? "right" : "left" },
                    isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                  ]}
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => filterSheetRef.current?.open()}
              >
                <Ionicons name="filter-sharp" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </>
        }
      />
      <FilterBottomSheet ref={filterSheetRef} />
    </View>
  );
}
