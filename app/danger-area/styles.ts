import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.CairoBold,
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.CairoBold,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.AlmaraiRegular,
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.CairoBold,
  },
});
