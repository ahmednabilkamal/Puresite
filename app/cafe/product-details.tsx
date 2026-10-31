import SaudiRiyal from "@/components/saudi_riyal";
import { API_CONFIG } from "@/constants/api";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { CafeOption, CafeOptionGroup, CafeProduct, cafeService } from "@/services/cafe-service";
import { useCafeStore } from "@/store/cafe-store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ProductDetailsSkeleton } from "./ProductDetailsSkeleton";

const { width } = Dimensions.get('window');

export default function CafeProductDetailsScreen() {
    const colors = useThemeColors();
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams();
    const isRTL = i18n.language === "ar";

    const [product, setProduct] = useState<CafeProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<Map<number, CafeOption>>(new Map());
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);

    const cartItems = useCafeStore((state) => state.items);
    const addItem = useCafeStore((state) => state.addItem);


    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (params.productId) {
                const data = await cafeService.getProductDetails(params.productId as string);
                setProduct(data);

                // If no options have been selected yet, default-select
                // the first option of every option group (if any)
                if (!data.option_groups || data.option_groups.length === 0) {
                    return;
                }

                setSelectedOptions((prev) => {
                    // If user already selected something, keep their choices
                    if (prev.size > 0) return prev;

                    const defaults = new Map<number, CafeOption>();
                    data.option_groups?.forEach((group) => {
                        if (group.options && group.options.length > 0) {
                            defaults.set(group.id, group.options[0]);
                        }
                    });
                    return defaults;
                });
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to load product" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // We intentionally do not add fetchData as a dependency to avoid
        // re-fetching on every render; params.productId is stable for this screen.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOptionSelect = (group: CafeOptionGroup, option: CafeOption) => {
        const newOptions = new Map(selectedOptions);
        // For radio/select, we replace the previous selection for this group
        // For checkbox, we would handle multiple (not implemented in this simplified version)
        newOptions.set(group.id, option);
        setSelectedOptions(newOptions);
    };

    const handleAddToCart = async () => {
        // if (!product || isOrdering) return;

        // try {
        //     setIsOrdering(true);

        //     const optionsArray = Array.from(selectedOptions.values());

        //     const payload: CreateOrderPayload = {
        //         items: [
        //             {
        //                 product_id: product.id,
        //                 qty: quantity,
        //                 options: optionsArray.map((opt) => opt.id),
        //                 // note can be added here in the future
        //             },
        //         ],
        //         pickup_method: "branch",
        //     };

        //     await cafeService.createOrder(payload);

        //     // Show confirmation overlay instead of navigating back immediately
        //     setShowConfirmation(true);
        // } catch (error) {
        //     console.error("Error creating cafe order:", error);
        //     Toast.show({
        //         type: "error",
        //         text1: t("error"),
        //         text2: t("cafe_order_failed"),
        //     });
        // } finally {
        //     setIsOrdering(false);
        // }
        if (!product) return;

        const optionsArray = Array.from(selectedOptions.values());
        addItem(product, quantity, optionsArray);

        Toast.show({
            type: 'success',
            text1: t('added_to_cart'),
            text2: `${product.name} x${quantity}`,
            props: {
                duration: 800,
            },
        });
        router.back();
    };

    const calculateTotal = () => {
        if (!product) return 0;
        let total = parseFloat(product.price);
        selectedOptions.forEach(opt => {
            total += parseFloat(opt.price_adjustment);
        });
        return total * quantity;
    };

    const getImageUrl = (imagePath?: string) => {
        if (!imagePath) return { uri: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600" };
        if (imagePath.startsWith("http")) return { uri: imagePath };
        return { uri: `${API_CONFIG.BASE_URL.replace("/api", "")}${imagePath}` };
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
                <ProductDetailsSkeleton />
            </SafeAreaView>
        );
    }

    if (!product) return null;

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
                    {/* <Image source={require("@/assets/icons/back.png")}
                        style={{ width: 16, height: 16 }}
                        resizeMode="contain" /> */}
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


            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={getImageUrl(product.image_path)}
                        style={styles.productImage}
                    />
                </View>

                {/* Title & Quantity */}
                <View style={[styles.titleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <View style={{ flex: 1, alignItems: isRTL ? "flex-end" : "flex-start" }}>
                        <Text style={[styles.productName, { color: colors.text.primary }]}>{product.name}</Text>
                    </View>

                    <View style={[styles.quantityContainer, { flexDirection: isRTL ? "row" : "row-reverse", backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <TouchableOpacity
                            onPress={() => setQuantity(q => q + 1)}
                            style={styles.quantityCircle}
                            activeOpacity={0.5}
                        >
                            <LinearGradient
                                colors={["#59092680", Colors.cafe]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.quantityGradient}
                            >
                                <Ionicons name="add" size={18} color={Colors.white} />
                            </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.quantityValueWrapper}>
                            <Text style={[styles.quantityText, { color: colors.text.primary }]}>{quantity}</Text>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={() => setQuantity(q => Math.max(1, q - 1))}
                            style={[styles.quantityCircleMinus, { borderColor: colors.border, backgroundColor: colors.surface }]}
                        >
                            <Ionicons name="remove" size={16} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionContainer}>
                    <Text style={[styles.optionGroupTitle, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
                        {t("description")}
                    </Text>
                    <Text style={[styles.descriptionText, { textAlign: isRTL ? "right" : "left", color: colors.text.secondary }]}>
                        {product.description}
                    </Text>
                </View>

                {/* Options */}
                {product.option_groups?.map(group => (
                    <View key={group.id} style={[styles.optionGroup, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <Text style={[styles.optionGroupTitle, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
                            {group.name}
                        </Text>
                        <View style={[styles.optionsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                            {group.options.map(option => {
                                const isSelected =
                                    selectedOptions.get(group.id)?.id === option.id;
                                return (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => handleOptionSelect(group, option)}
                                        style={[
                                            styles.optionChip,
                                            { backgroundColor: isSelected ? Colors.cafe + "15" : colors.surface, borderColor: isSelected ? Colors.cafe + "40" : colors.border },
                                        ]}
                                    >
                                        <Text style={[styles.optionText, { color: isSelected ? Colors.cafe : colors.text.primary }]}>
                                            {option.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: colors.surface }]}>
                <View style={[styles.footerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
                        <Text style={[styles.totalLabel, { color: colors.text.primary }]}>{t("total_price")}</Text>
                        <Text style={[styles.totalValue, { color: colors.text.primary }]}>
                            <SaudiRiyal width={18} height={18} color={colors.text.primary} /> {calculateTotal().toFixed(2)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addToCartButton, { backgroundColor: Colors.cafe }]}
                        onPress={handleAddToCart}
                        disabled={isOrdering}
                    >
                        <Text style={styles.addToCartText}>{t("add_to_cart")}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {showConfirmation && (
                <View style={styles.confirmOverlay}>
                    <View style={[styles.confirmCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.confirmIconWrapper}>
                            <View style={styles.confirmIconOuter}>
                                <View style={styles.confirmIconInner}>
                                    <Ionicons name="checkmark" size={40} color={Colors.white} />
                                </View>
                            </View>
                        </View>
                        <Text style={[styles.confirmTitle, { color: colors.text.primary }]}>
                            {t("cafe_order_confirmed_title")}
                        </Text>
                        <Text style={[styles.confirmSubtitle, { color: colors.text.secondary }]}>
                            {t("cafe_order_confirmed_message")}
                        </Text>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => {
                                setShowConfirmation(false);
                                router.push("/(tabs)/home");
                            }}
                        >
                            <Text style={styles.confirmButtonText}>
                                {t("back_to_home")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appBackground,
    },
    cartCountBadge: {
        backgroundColor: Colors.white,
        minWidth: 20,
        // height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },
    cartCountText: {
        fontFamily: Fonts.CairoSemiBold,
        fontSize: 14,
        color: Colors.apple,
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        // backgroundColor: Colors.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: "Cairo-Bold",
        color: Colors.text.primary,
    },
    scrollContent: {
        paddingBottom: 140,
    },
    imageContainer: {
        width: width,
        height: width * 0.8,
        alignSelf: "center",
        // marginTop: 12,
        marginBottom: 32,
        // backgroundColor: Colors.white,
        // borderRadius: width * 0.4,
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.08,
        // shadowRadius: 10,
        // overflow: "hidden",
    },
    productImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    titleRow: {
        paddingHorizontal: 24,
        marginBottom: 24,
        alignItems: "center",
        justifyContent: "space-between",
    },
    productName: {
        fontSize: 20,
        fontFamily: Fonts.CairoBold,
        color: Colors.apple,
        fontWeight: "700",
    },
    quantityContainer: {
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        borderColor: "#ebebeb",
        borderWidth: 1,
    },
    quantityCircle: {
        width: 28,
        height: 28,
        borderRadius: 16,
        // borderWidth: 1,
        // borderColor: Colors.border,
        // justifyContent: "center",
        // alignItems: "center",
        // backgroundColor: Colors.white,
    },
    quantityCircleMinus: {
        width: 28,
        height: 28,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.white,
    },
    quantityGradient: {
        flex: 1,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    quantityValueWrapper: {
        minWidth: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    quantityText: {
        fontSize: 16,
        fontFamily: "Cairo-Bold",
        color: Colors.text.primary,
    },
    optionGroup: {
        marginBottom: 24,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        // justifyContent: "space-between",
    },
    optionGroupTitle: {
        fontSize: 19,
        fontFamily: Fonts.CairoSemiBold,
        color: Colors.apple,
        fontWeight: "700",
        marginBottom: 12,
    },
    optionsRow: {
        flexWrap: "wrap",
        gap: 12,
        marginHorizontal: 20
    },
    optionChip: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 200,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    optionChipSelected: {
        backgroundColor: "#f7f3ed",
        borderColor: "#f7f3ed",
    },
    optionText: {
        fontSize: 12,
        fontFamily: Fonts.AlmaraiRegular,
        color: Colors.apple,
        fontWeight: "400",

    },
    optionTextSelected: {
        color: Colors.primary,
        fontFamily: Fonts.AlmaraiRegular,
        fontSize: 12,
        fontWeight: "400",
    },
    descriptionContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    descriptionText: {
        fontSize: 12,
        fontFamily: Fonts.CairoSemiBold,
        color: Colors.subtitle,
        lineHeight: 22,
        fontWeight: "600",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        padding: 24,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        // elevation: 10,
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: -1.5 },
        // shadowOpacity: 0.1,
        // shadowRadius: 0,
    },
    footerRow: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    totalLabel: {
        fontSize: 12,
        fontFamily: Fonts.CairoMedium,
        color: Colors.subtitle,
        fontWeight: "500",
    },
    totalValue: {
        fontSize: 25,
        fontFamily: Fonts.CairoBold,
        color: Colors.apple,
        fontWeight: "700",
    },
    addToCartButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        elevation: 2,
        width: "70%",
    },
    addToCartText: {
        color: Colors.white,
        fontFamily: Fonts.CairoMedium,
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
    confirmOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    confirmCard: {
        width: "100%",
        backgroundColor: Colors.white,
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
        alignItems: "center",
    },
    confirmIconWrapper: {
        marginBottom: 24,
    },
    confirmIconOuter: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#E3FCEC",
        justifyContent: "center",
        alignItems: "center",
    },
    confirmIconInner: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#22C55E",
        justifyContent: "center",
        alignItems: "center",
    },
    confirmTitle: {
        fontSize: 20,
        fontFamily: Fonts.CairoBold,
        color: Colors.apple,
        marginBottom: 8,
        textAlign: "center",
    },
    confirmSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.CairoMedium,
        color: Colors.subtitle,
        marginBottom: 24,
        lineHeight: 20,
        textAlign: "center",
    },
    confirmButton: {
        width: "100%",
        backgroundColor: Colors.primary,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmButtonText: {
        fontSize: 16,
        fontFamily: Fonts.CairoBold,
        color: Colors.white,
    },
});