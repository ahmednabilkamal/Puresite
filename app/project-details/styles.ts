import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerButtons: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    marginTop: -30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEF0F2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.CairoBold,
    color: "#002347",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    color: "#002347",
    width: "40%",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: Fonts.CairoMedium,
    color: "#5C6F81",
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#002347",
    marginTop: 8,
    marginHorizontal: 10,
  },
  listText: {
    fontSize: 14,
    fontFamily: Fonts.CairoMedium,
    color: "#5C6F81",
    flex: 1,
    lineHeight: 22,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: Fonts.CairoMedium,
    color: "#5C6F81",
    lineHeight: 24,
  },
  bottomButtonContainer: {
    padding: 20,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  contactButton: {
    backgroundColor: "#67A6B8",
    borderRadius: 10,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  contactButtonText: {
    fontSize: 18,
    fontFamily: Fonts.CairoBold,
    color: "#FFFFFF",
  },
});
