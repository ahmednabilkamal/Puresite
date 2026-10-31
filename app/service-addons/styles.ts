import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Main Service Header (Sticky)
  stickyHeaderContainer: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  mainServiceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  mainServiceImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  mainServiceContent: {
    flex: 1,
    marginHorizontal: 16,
    justifyContent: "center",
  },
  mainServiceTitle: {
    fontSize: 16,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  mainServicePrice: {
    fontSize: 14,
    fontFamily: Fonts.CairoBold,
    color: Colors.primary,
  },
  mainServiceDuration: {
    fontSize: 12,
    fontFamily: Fonts.CairoMedium,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Section Title
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
    marginBottom: 12,
    marginTop: 8,
    marginHorizontal: 4,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Addon Card
  addonCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  addonCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#FEFEFE",
    borderWidth: 1.5,
  },
  addonImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  addonContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  addonTitle: {
    fontSize: 14,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  addonPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addonPrice: {
    fontSize: 13,
    fontFamily: Fonts.CairoBold,
    color: Colors.primary,
  },
  addonDuration: {
    fontSize: 11,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
  },

  // Interaction
  actionRow: {
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonSelected: {
    backgroundColor: Colors.primary,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
  },
  totalPriceValue: {
    fontSize: 22,
    fontFamily: Fonts.CairoBold,
    color: Colors.primary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 15,
    fontFamily: Fonts.CairoBold,
    color: Colors.white,
  },

  // Keep legacy styles just in case but minimized usage
  header: {},
  headerButton: {},
  headerTitle: {},
  detailsLink: {},
  addButton: {},
  addButtonSelected: {},
  addButtonContent: {},
  addButtonText: {},
  addButtonTextSelected: {},
  serviceContent: {},
  serviceTitle: {},
  servicePrice: {},
  serviceDescription: {},
  serviceActions: {},
  serviceImage: {},
  serviceCard: {},
});

export default styles;
