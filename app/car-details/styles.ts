import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Dimensions, StyleSheet } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginTop: SCREEN_HEIGHT * 0.1,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 50,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.CairoRegular,
    color: Colors.subtitle,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    width: "100%",
  },
  colorSection: {
    marginTop: 8,
  },
  colorLabel: {
    fontSize: 14,
    fontFamily: Fonts.CairoMedium,
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  nextButton: {
    marginTop: 20,
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
  },
});

export default styles;
