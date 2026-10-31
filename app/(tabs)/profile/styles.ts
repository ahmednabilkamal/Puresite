import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarInitials: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontFamily: Fonts.CairoBold,
    color: Colors.white,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  userName: {
    fontSize: 18,
    fontFamily: Fonts.CairoBold,
    color: Colors.apple,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.apple,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoRow2: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.subtitle,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.apple,
  },
  editIcon: {
    padding: 8,
  },
  addVehicleButton: {
    alignItems: "center",
    gap: 4,
  },
  addVehicleText: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.primary,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  emptyCarsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  emptyCarsText: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
  },
  carsList: {
    gap: 12,
  },
  carCard: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  carIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  carInfo: {
    flex: 1,
  },
  carModel: {
    fontSize: 16,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  carPlate: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
    color: Colors.text.secondary,
  },
  carActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  carEditIcon: {
    padding: 8,
  },
  settingsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  settingRow: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingRow2: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: Fonts.CairoBold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.settingsSubtitle,
  },
  logoutButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.CairoBold,
    color: Colors.logoutText,
  },
  switchThumb: {
    width: 24,
    height: 16,
    borderRadius: 9,
    padding: 2,
    justifyContent: "center",
  },
});
