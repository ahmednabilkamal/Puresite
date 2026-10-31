import SaudiRiyal from "@/components/saudi_riyal";
import { API_CONFIG } from "@/constants/api";
import { Colors } from "@/constants/colors";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { CafeCategory, CafeProduct, cafeService } from "@/services/cafe-service";
import { useCafeStore } from "@/store/cafe-store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CafeSkeleton } from "./CafeSkeleton";
import styles from "./styles";

export default function CafeScreen() {
    const colors = useThemeColors();
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const isRTL = i18n.language === "ar";
    const cartItems = useCafeStore((state) => state.items);

    const [categories, setCategories] = useState<CafeCategory[]>([]);
    const [products, setProducts] = useState<CafeProduct[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [cats, prods] = await Promise.all([
                cafeService.getCategories(),
                cafeService.getProducts()
            ]);
            setCategories(cats);
            setProducts(prods);
            setCategories(cats);
            setProducts(prods);
            // Default to "All" (null) instead of first category:
            // if (cats.length > 0) {
            //     setSelectedCategory(cats[0].id);
            // }
        } catch (error) {
            console.error("Error fetching cafe data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = selectedCategory
        ? products.filter(p => p.cafe_category_id === selectedCategory)
        : products;

    const getImageUrl = (imagePath?: string) => {
        if (!imagePath) return { uri: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400" };
        if (imagePath.startsWith("http")) return { uri: imagePath };
        return { uri: `${API_CONFIG.BASE_URL.replace("/api", "")}${imagePath}` };
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
            <View
                style={[
                    styles.header,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
            >

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.back()}
                >
                    {isRTL ? (
                        <MaterialIcons name="arrow-forward-ios" size={24} color={colors.text.primary} />
                    ) : (
                        <MaterialIcons name="arrow-back-ios" size={24} color={colors.text.primary} />
                    )}
                </TouchableOpacity>

                <Image source={require("@/assets/images/janbiyah.png")} style={{ width: 100, }} resizeMode="contain" />

                {/* <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                    {t("drinks")}
                </Text> */}

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.push("/cafe/cart")}
                >
                    <View style={[styles.cartCountBadge, {
                        marginRight: isRTL ? 0 : 20, marginLeft: isRTL ? 20 : 0,
                        position: 'absolute',
                        top: -8,
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: colors.surface,
                    }]}>
                        <Text style={[styles.cartCountText, { color: colors.text.primary }]}>{cartItems.length}</Text>
                    </View>
                    <Ionicons name="cart-outline" size={24} color={colors.cafe} />
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={[styles.categoriesContainer, { backgroundColor: colors.appBackground }]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.categoriesScroll, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                >
                    <TouchableOpacity
                        onPress={() => setSelectedCategory(null)}
                        style={[
                            styles.categoryPill,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            selectedCategory === null && [
                                styles.categoryPillSelected,
                                { overflow: "hidden", backgroundColor: "transparent", borderColor: "transparent" },
                            ],
                        ]}
                    >
                        {selectedCategory === null && (
                            <LinearGradient
                                colors={["#59092680", Colors.cafe]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
                            />
                        )}
                        <Text style={[
                            styles.categoryText,
                            { color: colors.text.primary },
                            selectedCategory === null && styles.categoryTextSelected
                        ]}>
                            {t("all")}
                        </Text>
                    </TouchableOpacity>

                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setSelectedCategory(cat.id)}
                            style={[
                                styles.categoryPill,
                                {
                                    backgroundColor: selectedCategory === cat.id ? colors.primary : colors.surface,
                                    borderColor: selectedCategory === cat.id ? colors.primary : colors.border,
                                },
                            ]}
                        >
                            <Text style={[
                                styles.categoryText,
                                {
                                    color: selectedCategory === cat.id ? colors.white : colors.text.primary,
                                },
                            ]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Products Grid */}
            {isLoading ? (
                <CafeSkeleton />
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.productsGrid}
                    columnWrapperStyle={{ justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.productCard, { backgroundColor: colors.surface }]}
                            onPress={() => router.push({
                                pathname: "/cafe/product-details",
                                params: { productId: item.id }
                            })}
                        >
                            <View style={[styles.imageContainer, { backgroundColor: colors.appBackground }]}>
                                <Image source={getImageUrl(item.image_path)} style={styles.productImage} />
                            </View>
                            <View style={[styles.productInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                <Text style={[styles.productName, { color: colors.text.primary }]} numberOfLines={1}>{item.name}</Text>
                                <View style={[styles.priceRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <Text style={[styles.productPrice, { color: colors.text.primary }]}>
                                        <SaudiRiyal width={12} height={12} color={colors.text.primary} /> {" " + item.price + " "}
                                    </Text>
                                    <View style={styles.addButton}>
                                        <LinearGradient
                                            colors={["#59092680", Colors.cafe]}
                                            start={{ x: 0, y: 0.8 }}
                                            end={{ x: 1, y: 0.8 }}
                                            style={styles.addButtonGradient}
                                        >
                                            <Ionicons
                                                name={isRTL ? "arrow-back" : "arrow-forward"}
                                                size={16}
                                                color={Colors.white}
                                            />
                                        </LinearGradient>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* Floating Cart Button */}
            {/* {cartItems.length > 0 && (
                <View style={styles.floatingButtonContainer}>
                    <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => router.push("/cafe/cart")}
                    >
                        <View style={styles.cartCountBadge}>
                            <Text style={styles.cartCountText}>{cartItems.length}</Text>
                        </View>
                        <Text style={styles.cartButtonText}>{t("view_cart")}</Text>
                    </TouchableOpacity>
                </View>
            )} */}
        </SafeAreaView>
    );
}