import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

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
  cartButtonContainer: {
    width: 40,
    height: 20,
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
    marginTop: 4,
  },
  categoriesContainer: {
    paddingVertical: 16,
    backgroundColor: Colors.appBackground,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  categoryPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontFamily: Fonts.AlmaraiRegular,
    fontSize: 12,
    color: Colors.apple,
  },
  categoryTextSelected: {
    color: Colors.white,
  },
  productsGrid: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100, // Space for floating button
  },
  productCard: {
    width: (width - 52) / 2, // 20px padding * 2 + 12px gap
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginBottom: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: 12,
    backgroundColor: Colors.appBackground,
    borderRadius: 18,
    padding: 4,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontFamily: Fonts.CairoSemiBold,
    fontSize: 14,
    color: Colors.apple,
  },
  priceRow: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  productPrice: {
    fontFamily: Fonts.CairoSemiBold,
    fontSize: 12,
    color: Colors.apple,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  addButtonGradient: {
    flex: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  cartButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  cartButtonText: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    color: Colors.white,
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
});

export default styles;