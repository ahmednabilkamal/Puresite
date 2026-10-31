import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CategoryItemProps {
  item: {
    id: string;
    name: string;
    icon: string | null;
  };
  isActive: boolean;
  onPress: (id: string) => void;
}

export const CategoryItem = ({
  item,
  isActive,
  onPress,
}: CategoryItemProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        isActive && styles.activeCategoryItem,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
      onPress={() => onPress(item.id)}
    >
      {item.icon && (
        <Image
          source={{ uri: item.icon }}
          style={[
            styles.categoryIcon,
            isRTL ? { marginLeft: 8 } : { marginRight: 8 },
          ]}
        />
      )}
      <Text
        style={[styles.categoryText, isActive && styles.activeCategoryText]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

interface Tag {
  text: string;
  color: string;
  textColor: string;
}

interface ProjectItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: string;
    tags: Tag[];
    investmentSize: string;
    opportunityType: string;
    projectStatus: string;
  };
  isFavorite?: boolean;
}

export const ProjectItem = ({ item, isFavorite = false }: ProjectItemProps) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/project-details", params: { id: item.id } })
      }
      activeOpacity={0.9}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <TouchableOpacity
          style={[styles.favoriteButton, isRTL ? { left: 15 } : { right: 15 }]}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <View
          style={[
            styles.tagsContainer,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          {item.tags.map((tag, index) => (
            <View
              key={index}
              style={[styles.tag, { backgroundColor: tag.color }]}
            >
              <Text style={[styles.tagText, { color: tag.textColor }]}>
                {tag.text}
              </Text>
            </View>
          ))}
        </View>
        <Text
          style={[styles.cardTitle, { textAlign: isRTL ? "right" : "left" }]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.cardDescription,
            { textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {item.description}
        </Text>
        <View
          style={[
            styles.detailsContainer,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t("investment_size")}</Text>
            <Text style={styles.detailValue}>{item.investmentSize}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t("opportunity_type")}</Text>
            <Text style={styles.detailValue}>{item.opportunityType}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t("project_status")}</Text>
            <Text style={styles.detailValue}>{item.projectStatus}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardImageContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 15,
  },
  tagsContainer: {
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: Fonts.AlmaraiRegular,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginBottom: 15,
  },
  detailsContainer: {
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 15,
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.placeholder,
    marginBottom: 4,
    textAlign: "center",
  },
  detailValue: {
    fontSize: 12,
    fontFamily: Fonts.CairoMedium,
    color: Colors.placeholder,
    opacity: 0.5,
    textAlign: "center",
  },
  categoryItem: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  activeCategoryItem: {
    backgroundColor: "#DCE788",
    borderColor: "#DCE788",
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.text.primary,
  },
  activeCategoryText: {
    color: "#FFFFFF",
  },
});
