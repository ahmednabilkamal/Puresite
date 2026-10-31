import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
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
  nextButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginLink: {
    alignItems: "center",
    marginTop: 8,
  },
  loginLinkText: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  loginLinkHighlight: {
    color: Colors.primary,
    fontFamily: Fonts.CairoBold,
  },
});

export default styles;
