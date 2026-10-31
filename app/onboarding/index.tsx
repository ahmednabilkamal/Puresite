import { GradientOverlay } from "@/components/gradient-overlay";
import { ThemedText } from "@/components/themed-text";
import { CustomButton } from "@/components/ui/custom-button";
import { Fonts } from "@/constants/fonts";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  image: any;
  title: string;
  subtitle: string;
  bottomText: string;
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      image: require("@/assets/images/onboarding-1.png"),
      title: t("onboarding_slide1_title"),
      subtitle: t("onboarding_slide1_subtitle"),
      bottomText: t("onboarding_slide1_bottom"),
    },
    {
      id: 2,
      image: require("@/assets/images/onboarding-2.png"),
      title: t("onboarding_slide2_title"),
      subtitle: t("onboarding_slide2_subtitle"),
      bottomText: t("onboarding_slide2_bottom"),
    },
    {
      id: 3,
      image: require("@/assets/images/onboarding-3.png"),
      title: t("onboarding_slide3_title"),
      subtitle: t("onboarding_slide3_subtitle"),
      bottomText: t("onboarding_slide3_bottom"),
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleStartNow = async () => {
    const { storage } = await import("@/utils/storage");
    await storage.setItem("@onboarding_completed", "true");
    router.replace("/login");
  };

  const handlePrimaryAction = async () => {
    const isLastSlide = currentIndex === slides.length - 1;

    if (isLastSlide) {
      await handleStartNow();
      return;
    }

    flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <View style={styles.textHeader}>
          <ThemedText style={styles.title}>{item.title}</ThemedText>
          <ThemedText style={styles.subtitle}>{item.subtitle}</ThemedText>
        </View>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0F2A3F", "#123B5A", "#0B2A44"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <GradientOverlay />



      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id.toString()}
        style={[styles.flatList, { zIndex: 1 }]}
      />

      <View style={[styles.footer, { zIndex: 1 }]}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.slideInfo}>

          <ThemedText style={styles.bottomText}>
            {slides[currentIndex].bottomText}
          </ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title={currentIndex === slides.length - 1 ? "ابدا الان" : "التالي"}
            onPress={handlePrimaryAction}
            type="primary"
            style={styles.button}
            fontFamily={Fonts.CairoMedium}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
