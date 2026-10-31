import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: Colors.onboardingBackground,
  },
  glowContainer: {
    position: "absolute",
    top: -180,
    // right: -180,
    width: 520,
    height: "50%",
  },
  glow: {
    width: "100%",
    height: "100%",
    opacity: 0.4,
  },

  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradientContainer: {
    position: "absolute",
    width: "100%",
    height: SCREEN_HEIGHT * 0.4 + 250,
  },
  radialGradient1: {
    position: "absolute",
    top: 0,
    right: -150,
    width: 500,
    height: "20%",
    borderRadius: 200,
    opacity: 1,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  textHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.52,
    marginTop: 0,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  paginationDot: {
    width: 28,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paginationDotActive: {
    width: 32,
    backgroundColor: Colors.primary,
  },
  slideInfo: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.CairoBold,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 44,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.white,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  bottomText: {
    fontSize: 14,
    fontFamily: Fonts.CairoMedium,
    color: Colors.white,
    textAlign: "center",
    lineHeight: 20,
    // opacity: 0.8,
    marginBottom: 0,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: Colors.primary,
  },
  blurView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: Colors.onboardingBackground,
    opacity: 0.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default styles;
