import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { SupportTicket, ticketService } from "@/services/ticket-service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function TicketsScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const loadTickets = useCallback(async () => {
    try {
      const data = await ticketService.getTickets();
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("failed_to_load_tickets"),
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("fill_all_fields"),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await ticketService.createTicket(newTicket);
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("ticket_created"),
      });
      setShowNewTicketModal(false);
      setNewTicket({ subject: "", message: "", priority: "medium" });
      loadTickets();
    } catch (error) {
      console.error("Failed to create ticket:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("failed_to_create_ticket"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return { bg: "#EFF6FF", text: "#3B82F6" };
      case "in_progress":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "resolved":
        return { bg: "#D1FAE5", text: "#059669" };
      case "closed":
        return { bg: "#F3F4F6", text: "#6B7280" };
      default:
        return { bg: "#EFF6FF", text: "#3B82F6" };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderTicket = ({ item }: { item: SupportTicket }) => {
    const statusColors = getStatusColor(item.status);
    return (
      <TouchableOpacity
        style={[styles.ticketCard, { backgroundColor: colors.surface }]}
        onPress={() => router.push(`/tickets/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={[styles.ticketHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.ticketSubject, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}
              numberOfLines={1}
            >
              {item.subject}
            </Text>
            <Text style={[styles.ticketNumber, { textAlign: isRTL ? "right" : "left" }]}>
              {item.ticket_number}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {t(`ticket_status_${item.status}`)}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.ticketMessage, { color: colors.text.secondary, textAlign: isRTL ? "right" : "left" }]}
          numberOfLines={2}
        >
          {item.message}
        </Text>
        <View style={[styles.ticketFooter, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={styles.ticketDate}>{formatDate(item.created_at)}</Text>
          {item.replies_count && item.replies_count > 0 && (
            <View style={[styles.repliesCount, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Ionicons name="chatbubble-outline" size={14} color={Colors.placeholder} />
              <Text style={styles.repliesText}>
                {item.replies_count} {t("replies")}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="ticket-outline" size={64} color={Colors.placeholder} />
      <Text style={[styles.emptyText, { color: colors.text.secondary }]}>{t("no_tickets")}</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowNewTicketModal(true)}
      >
        <Text style={styles.emptyButtonText}>{t("create_first_ticket")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t("technical_support")}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors.primary }]}
          onPress={() => setShowNewTicketModal(true)}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* New Ticket Modal */}
      <Modal
        visible={showNewTicketModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNewTicketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                {t("new_ticket")}
              </Text>
              <TouchableOpacity onPress={() => setShowNewTicketModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}>
                {t("subject")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.appBackground,
                    color: colors.text.primary,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
                placeholder={t("ticket_subject_placeholder")}
                placeholderTextColor={Colors.placeholder}
                value={newTicket.subject}
                onChangeText={(text) => setNewTicket({ ...newTicket, subject: text })}
              />

              <Text style={[styles.inputLabel, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}>
                {t("message")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.appBackground,
                    color: colors.text.primary,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
                placeholder={t("ticket_message_placeholder")}
                placeholderTextColor={Colors.placeholder}
                value={newTicket.message}
                onChangeText={(text) => setNewTicket({ ...newTicket, message: text })}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <Text style={[styles.inputLabel, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}>
                {t("priority")}
              </Text>
              <View style={[styles.priorityContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                {(["low", "medium", "high"] as const).map((priority) => (
                  <Pressable
                    key={priority}
                    style={[
                      styles.priorityButton,
                      newTicket.priority === priority && styles.priorityButtonActive,
                    ]}
                    onPress={() => setNewTicket({ ...newTicket, priority })}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        newTicket.priority === priority && styles.priorityButtonTextActive,
                      ]}
                    >
                      {t(`priority_${priority}`)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.appBackground }]}
                onPress={() => setShowNewTicketModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>
                  {t("cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleCreateTicket}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>{t("submit")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.CairoBold,
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  ticketCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ticketHeader: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontFamily: Fonts.CairoBold,
    marginBottom: 2,
  },
  ticketNumber: {
    fontSize: 12,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.placeholder,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.CairoSemiBold,
  },
  ticketMessage: {
    fontSize: 14,
    fontFamily: Fonts.AlmaraiRegular,
    lineHeight: 20,
    marginBottom: 12,
  },
  ticketFooter: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketDate: {
    fontSize: 12,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.placeholder,
  },
  repliesCount: {
    alignItems: "center",
    gap: 4,
  },
  repliesText: {
    fontSize: 12,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.placeholder,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.CairoRegular,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyButtonText: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.CairoBold,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: Fonts.AlmaraiRegular,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
  },
  priorityContainer: {
    gap: 8,
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  priorityButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(217, 119, 6, 0.1)",
  },
  priorityButtonText: {
    fontSize: 14,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.placeholder,
  },
  priorityButtonTextActive: {
    color: Colors.primary,
  },
  modalFooter: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: Fonts.CairoSemiBold,
    color: Colors.white,
  },
});
