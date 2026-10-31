import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  header: {
    // flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    // backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.CairoBold,
    color: Colors.apple,
    textAlign: "center",
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.text.light,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.apple,
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: Colors.white,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 3,
    borderWidth: 1,
    borderColor: Colors.white,
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.CairoBold,
    color: Colors.white,
  },
  serviceInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 8,
    marginBottom: 16,
  },
  serviceTextContainer: {
    // flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  serviceDateTime: {
    fontSize: 12,
    fontFamily: Fonts.CairoMedium,
    color: Colors.subtitle,
  },
  completedIcon: {
    // marginLeft: 12,
    // marginRight: 12,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    borderColor: Colors.bookingButtonText,
    borderWidth: 1,
  },
  bookAgainButton: {
    backgroundColor: Colors.white,
  },
  bookAgainText: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    fontWeight: "600",
    color: Colors.primary,
  },
  viewDetailsButton: {
    backgroundColor: Colors.bookingButton,
  },
  viewDetailsText: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.apple,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.CairoMedium,
    color: Colors.text.light,
    marginTop: 16,
  },
});

export default styles;
