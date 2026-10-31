import SaudiRiyal from "@/components/saudi_riyal";
import { API_CONFIG } from "@/constants/api";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cafeService } from "@/services/cafe-service";
import { useCafeStore } from "@/store/cafe-store";
import { storage } from "@/utils/storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function CafeCartScreen() {
    const colors = useThemeColors();
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const isRTL = i18n.language === "ar";
    const { items, getTotalPrice, updateQuantity, removeItem, clearCart } = useCafeStore();

    const [deliveryMethod, setDeliveryMethod] = useState<'branch' | 'parking'>('parking');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

    const handleCheckout = async () => {
        if (items.length === 0) return;

        setIsProcessing(true);
        try {
            const selectedCarId = await storage.getItem("selected_car_id");
            const carId = selectedCarId ? Number(selectedCarId) : undefined;
            if (carId == null || !Number.isFinite(carId) || carId <= 0) {
                Toast.show({
                    type: "error",
                    text1: t("error"),
                    text2: t("please_select_car") || "Please select a car",
                });
                setIsProcessing(false);
                return;
            }

            const payload = {
                car_id: carId,
                items: items.map(item => ({
                    product_id: item.product.id,
                    qty: item.quantity,
                    options: item.selectedOptions.map(opt => opt.id),
                    note: ""
                })),
                pickup_method: deliveryMethod,
            };

            const response = await cafeService.createOrder(payload);
            const orderId = response?.data?.id ?? response?.id;
            const totalFromApi = response?.data?.total;
            const totalAmount = totalFromApi != null ? String(totalFromApi) : getTotalPrice().toFixed(2);
            if (orderId != null) {
                setCreatedOrderId(orderId);
                clearCart();
                router.replace({
                    pathname: "/booking-payment",
                    params: {
                        orderId: String(orderId),
                        totalAmount,
                        orderType: "cafe",
                    },
                });
            } else {
                setShowSuccessModal(true);
            }
        } catch (error: any) {
            console.error("Checkout error:", error);
            Toast.show({
                type: "error",
                text1: t("error"),
                text2: error.response?.data?.message || t("checkout_failed"),
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const getImageUrl = (imagePath?: string) => {
        if (!imagePath) return { uri: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200" };
        if (imagePath.startsWith("http")) return { uri: imagePath };
        return { uri: `${API_CONFIG.BASE_URL.replace("/api", "")}${imagePath}` };
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
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

                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("cart")}</Text>
                <TouchableOpacity onPress={clearCart} disabled={items.length === 0}>
                    <Ionicons name="trash-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {items.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 100 }}>
                        <Ionicons name="cart-outline" size={64} color={colors.text.secondary} />
                        <Text style={{ marginTop: 20, fontFamily: "Cairo-Bold", color: colors.text.secondary }}>
                            {t("empty_cart")}
                        </Text>
                    </View>
                ) : (
                    items.map((item) => (
                        <View key={item.cartId} style={[styles.cartItem, { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.surface }]}>
                            <Image source={getImageUrl(item.product.image_path)} style={[styles.itemImage, { backgroundColor: colors.border }]} resizeMode="cover" />

                            <View style={[styles.itemContent, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                <Text style={[styles.itemName, { color: colors.text.primary }]} numberOfLines={1}>{item.product.name}</Text>
                                <Text style={[styles.itemOptions, { color: colors.text.secondary }]} numberOfLines={1}>
                                    {item.selectedOptions.map(o => o.name).join(", ")}
                                </Text>
                                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                                    {(parseFloat(item.product.price) + item.selectedOptions.reduce((s, o) => s + parseFloat(o.price_adjustment), 0)).toFixed(2)} {t("currency")}
                                </Text>
                            </View>

                            <View style={styles.quantityControl}>
                                <TouchableOpacity
                                    onPress={() => item.quantity > 1 ? updateQuantity(item.cartId, item.quantity - 1) : removeItem(item.cartId)}
                                    style={[styles.qtyBtn, { backgroundColor: colors.primary + "20" }]}
                                >
                                    <Ionicons name="remove" size={16} color={colors.primary} />
                                </TouchableOpacity>
                                <Text style={[styles.qtyText, { color: colors.text.primary }]}>{item.quantity}</Text>
                                <TouchableOpacity
                                    onPress={() => updateQuantity(item.cartId, item.quantity + 1)}
                                    style={[styles.qtyBtn, { backgroundColor: colors.primary + "20" }]}
                                >
                                    <Ionicons name="add" size={16} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

                {items.length > 0 && (
                    <View style={styles.deliverySection}>
                        <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left", color: colors.text.primary }]}>
                            {t("receiving_method")}
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.deliveryOption,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: deliveryMethod === 'parking' ? colors.primary : colors.border,
                                },
                                deliveryMethod === 'parking' && { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
                                { flexDirection: isRTL ? "row-reverse" : "row" },
                            ]}
                            onPress={() => setDeliveryMethod('parking')}
                        >
                            <Ionicons name="car-outline" size={24} color={deliveryMethod === 'parking' ? colors.primary : colors.text.secondary} />
                            <View style={{ flex: 1, marginHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                <Text style={[styles.deliveryTitle, { color: colors.text.primary }]}>{t("deliver_to_parking")}</Text>
                            </View>
                            <View style={[styles.radio, { borderColor: colors.border }, deliveryMethod === 'parking' && { borderColor: colors.primary, backgroundColor: colors.primary }]} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.deliveryOption,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: deliveryMethod === 'branch' ? colors.primary : colors.border,
                                },
                                deliveryMethod === 'branch' && { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
                                { flexDirection: isRTL ? "row-reverse" : "row" },
                            ]}
                            onPress={() => setDeliveryMethod('branch')}
                        >
                            <Ionicons name="storefront-outline" size={24} color={deliveryMethod === 'branch' ? colors.primary : colors.text.secondary} />
                            <View style={{ flex: 1, marginHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                <Text style={[styles.deliveryTitle, { color: colors.text.primary }]}>{t("pickup_branch")}</Text>
                            </View>
                            <View style={[styles.radio, { borderColor: colors.border }, deliveryMethod === 'branch' && { borderColor: colors.primary, backgroundColor: colors.primary }]} />
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>

            {/* Footer */}
            {items.length > 0 && (
                <View style={[styles.footer, { backgroundColor: colors.surface }]}>
                    <View style={[styles.footerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
                            <Text style={[styles.totalLabel, { color: colors.text.primary }]}>{t("total_price")}</Text>
                            <Text style={[styles.totalValue, { color: colors.text.primary }]}><SaudiRiyal color={colors.text.primary} /> {getTotalPrice().toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.checkoutButton, isProcessing && { opacity: 0.7 }]}
                            onPress={handleCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.checkoutText}>{t("checkout")}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark" size={40} color={Colors.white} />
                        </View>
                        <Text style={[styles.successTitle, { color: colors.text.primary }]}>{t('cafe_order_confirmed_title')}</Text>
                        <Text style={[styles.successMessage, { color: colors.text.secondary }]}>
                            {t('cafe_order_confirmed_message')}
                        </Text>

                        {/* <TouchableOpacity
                            style={[styles.homeButton, { marginBottom: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: '#D28F3D' }]}
                            onPress={() => {
                                setShowSuccessModal(false);
                                if (createdOrderId) {
                                    router.push(`/cafe/orders/${createdOrderId}`);
                                }
                            }}
                        >
                            <Text style={[styles.homeButtonText, { color: '#D28F3D' }]}>{t('view_order_details')}</Text>
                        </TouchableOpacity> */}

                        <TouchableOpacity
                            style={[styles.homeButton, { backgroundColor: colors.primary }]}
                            onPress={() => {
                                setShowSuccessModal(false);
                                router.dismissAll();
                                router.push("/(tabs)/home");
                            }}
                        >
                            <Text style={styles.homeButtonText}>{t('back_to_home')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appBackground,
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
        fontFamily: Fonts.CairoBold,
        color: Colors.text.primary,
        marginTop: 4,
    },
    clearText: { color: Colors.error, fontFamily: Fonts.CairoBold, fontSize: 14 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    cartItem: {
        backgroundColor: Colors.white, padding: 12, borderRadius: 16, marginBottom: 16, alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F0F0F0' },
    itemContent: { flex: 1, marginHorizontal: 12 },
    itemName: { fontSize: 16, fontFamily: Fonts.CairoBold, color: Colors.text.primary, marginBottom: 4 },
    itemOptions: { fontSize: 12, fontFamily: Fonts.CairoRegular, color: Colors.text.secondary, marginBottom: 4 },
    itemPrice: { fontSize: 14, fontFamily: Fonts.CairoBold, color: "#D28F3D" },
    quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    qtyBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FEF6E9', justifyContent: 'center', alignItems: 'center' },
    qtyText: { fontFamily: Fonts.CairoBold, fontSize: 14 },

    deliverySection: { marginTop: 24 },
    sectionTitle: { fontSize: 16, fontFamily: Fonts.CairoBold, color: Colors.text.primary, marginBottom: 12 },
    deliveryOption: {
        backgroundColor: Colors.white, padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center',
        borderWidth: 1, borderColor: '#EEEEEE'
    },
    deliveryOptionSelected: { borderColor: "#D28F3D", backgroundColor: '#FEF6E9' },
    deliveryTitle: { fontFamily: Fonts.CairoBold, fontSize: 14, color: Colors.text.primary },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#DDD' },
    radioSelected: { borderColor: "#D28F3D", backgroundColor: "#D28F3D" },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, padding: 24,
        borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 10,
    },
    footerRow: { alignItems: 'center', justifyContent: 'space-between' },
    totalLabel: { fontSize: 12, fontFamily: Fonts.CairoRegular, color: Colors.text.secondary },
    totalValue: { fontSize: 25, fontFamily: Fonts.CairoBold, color: Colors.text.primary },
    checkoutButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        elevation: 2,
        width: "65%"
    },
    checkoutText: { color: Colors.white, fontFamily: Fonts.CairoBold, fontSize: 16, textAlign: 'center' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.white, width: '100%', padding: 24, borderRadius: 24, alignItems: 'center' },
    successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 22, fontFamily: Fonts.CairoBold, color: Colors.text.primary, marginBottom: 10, textAlign: 'center' },
    successMessage: { fontSize: 14, fontFamily: Fonts.CairoRegular, color: Colors.text.secondary, textAlign: 'center', marginBottom: 24 },
    homeButton: { backgroundColor: "#D28F3D", width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
    homeButtonText: { color: Colors.white, fontFamily: Fonts.CairoBold, fontSize: 16 }
});