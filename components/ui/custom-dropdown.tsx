import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  placeholder: string;
  options: Option[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  containerStyle?: any;
  triggerStyle?: any;
  error?: string;
  hideLabel?: boolean;
}

export const CustomDropdown = ({
  label,
  placeholder,
  options,
  onSelect,
  selectedValue,
  containerStyle,
  triggerStyle,
  error,
  hideLabel,
}: CustomDropdownProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <View style={[styles.container, containerStyle]}>
      {!hideLabel && (
        <ThemedText
          style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}
        >
          {label}
        </ThemedText>
      )}

      <Pressable
        onPress={() => setModalVisible(true)}
        style={[
          styles.dropdownTrigger,
          { flexDirection: isRTL ? "row-reverse" : "row" },
          error && styles.inputError,
          triggerStyle,
        ]}
      >
        <ThemedText
          style={[
            styles.triggerText,
            {
              textAlign: isRTL ? "right" : "left",
              color: selectedOption ? "#000" : Colors.inputPlaceholder,
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </ThemedText>
        <Ionicons name="chevron-down" size={20} color={Colors.text.light} />
      </Pressable>

      {error && (
        <ThemedText
          style={[styles.errorText, { textAlign: isRTL ? "right" : "left" }]}
        >
          {error}
        </ThemedText>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{label}</ThemedText>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.optionItem}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      { textAlign: isRTL ? "right" : "left" },
                      selectedValue === item.value && styles.selectedOptionText,
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.placeholder,
  },
  dropdownTrigger: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.AlmaraiRegular,
  },
  triggerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.AlmaraiRegular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "60%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.AlmaraiBold,
    color: Colors.text.primary,
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  optionText: {
    fontSize: 16,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.text.primary,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontFamily: Fonts.AlmaraiBold,
  },
});
