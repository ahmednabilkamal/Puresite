import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.CairoBold,
    color: Colors.placeholder,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#67A3B1",
  },
  profileImageInitials: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageText: {
    fontSize: 24,
    fontFamily: Fonts.CairoBold,
    color: Colors.white,
  },
  profileInfo: {
    alignItems: "flex-end",
  },
  userName: {
    fontSize: 20,
    fontFamily: Fonts.CairoBold,
    color: Colors.placeholder,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.inputPlaceholder,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.CairoRegular,
    color: Colors.inputPlaceholder,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  optionsCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    // overflow: "hidden",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.03,
    // shadowRadius: 10,
    // elevation: 1,
  },
  optionRow: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  optionLeft: {
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    fontSize: 12,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.placeholder,
  },
  logoutContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    marginBottom: 40,
    marginHorizontal: 20,
    // gap: 10,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: Fonts.CairoRegular,
    color: Colors.red,
    marginEnd: 10,
  },
});
