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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: 8,
    marginBottom: 16,
  },
  backButtonRTL: {
    alignSelf: "flex-end",
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoRegular,
    color: Colors.primary,
  },
  header: {
    alignItems: "center",
    marginTop: SCREEN_HEIGHT * 0.1,
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    alignItems: "center",
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
    marginBottom: 40,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.subtitle,
    textAlign: "center",
    marginBottom: 8,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  otpInput: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    textAlign: "center",
    fontSize: 24,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  resendContainer: {
    marginBottom: 32,
    width: "100%",
  },
  resendText: {
    fontSize: 12,
    fontFamily: Fonts.CairoRegular,
    color: Colors.subtitle,
    // lineHeight: 20,
  },
  timerText: {
    color: Colors.primary,
    fontFamily: Fonts.AlmaraiRegular,
    fontSize: 12,
    fontWeight: "400",
  },
  resendLink: {
    color: Colors.primary,
    fontFamily: Fonts.AlmaraiRegular,
    fontSize: 12,
    fontWeight: "400",
  },
  verifyButton: {
    width: "100%",
  },
});

export default styles;
