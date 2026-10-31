import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { SupportTicket, ticketService } from "@/services/ticket-service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function TicketDetailScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isRTL = i18n.language === "ar";
  const flatListRef = useRef<FlatList>(null);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const loadTicket = useCallback(async () => {
    if (!id) return;
    try {
      const data = await ticketService.getTicketById(id);
      setTicket(data);
    } catch (error) {
      console.error("Failed to load ticket:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("failed_to_load_ticket"),
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !ticket) return;

    setIsSendingReply(true);
    try {
      const updatedTicket = await ticketService.addReply(ticket.id.toString(), replyMessage);
      setTicket(updatedTicket);
      setReplyMessage("");
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Failed to send reply:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("failed_to_send_reply"),
      });
    } finally {
      setIsSendingReply(false);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isOriginal = index === 0;
    const isAdmin = isOriginal ? false : item.is_admin_reply;

    return (
      <View
        style={[
          styles.messageContainer,
          isAdmin ? styles.adminMessage : styles.userMessage,
          { alignItems: isRTL ? (isAdmin ? "flex-start" : "flex-end") : (isAdmin ? "flex-start" : "flex-end") },
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isAdmin ? `${Colors.primary}20` : colors.surface,
              marginLeft: isAdmin ? 0 : 40,
              marginRight: isAdmin ? 40 : 0,
            },
          ]}
        >
          <View style={[styles.messageHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <MaterialCommunityIcons
              name={isAdmin ? "face-agent" : "account"}
              size={16}
              color={isAdmin ? Colors.primary : Colors.placeholder}
            />
            <Text
              style={[
                styles.senderName,
                { color: isAdmin ? Colors.primary : colors.text.secondary },
              ]}
            >
              {isOriginal ? t("you") : item.sender_name}
            </Text>
          </View>
          <Text style={[styles.messageText, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}>
            {isOriginal ? ticket?.message : item.message}
          </Text>
          <Text style={[styles.messageDate, { textAlign: isRTL ? "left" : "right" }]}>
            {formatDate(isOriginal ? ticket?.created_at || "" : item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text.secondary }}>{t("ticket_not_found")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColor(ticket.status);
  const messages = [{ id: "original", isOriginal: true }, ...(ticket.replies || [])];
  const isClosed = ["closed", "resolved"].includes(ticket.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.appBackground }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.appBackground }]}>
          <View style={[styles.headerTop, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons
                name={isRTL ? "chevron-forward" : "chevron-back"}
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.headerTitle, { color: colors.text.primary, textAlign: isRTL ? "right" : "left" }]}
                numberOfLines={1}
              >
                {ticket.subject}
              </Text>
              <Text style={[styles.ticketNumber, { textAlign: isRTL ? "right" : "left" }]}>
                {ticket.ticket_number}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {t(`ticket_status_${ticket.status}`)}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id?.toString() || `msg-${index}`}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Reply Input */}
        {!isClosed ? (
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.appBackground }]}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.appBackground,
                  color: colors.text.primary,
                  textAlign: isRTL ? "right" : "left",
                },
              ]}
              placeholder={t("type_reply")}
              placeholderTextColor={Colors.placeholder}
              value={replyMessage}
              onChangeText={setReplyMessage}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!replyMessage.trim() || isSendingReply) && styles.sendButtonDisabled]}
              onPress={handleSendReply}
              disabled={!replyMessage.trim() || isSendingReply}
            >
              {isSendingReply ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="send" size={20} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.closedContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.closedText, { color: colors.text.secondary }]}>
              {t("ticket_closed_message")}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
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
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
  },
  adminMessage: {
    alignItems: "flex-start",
  },
  userMessage: {
    alignItems: "flex-end",
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: "85%",
  },
  messageHeader: {
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  senderName: {
    fontSize: 12,
    fontFamily: Fonts.CairoSemiBold,
  },
  messageText: {
    fontSize: 14,
    fontFamily: Fonts.AlmaraiRegular,
    lineHeight: 22,
  },
  messageDate: {
    fontSize: 11,
    fontFamily: Fonts.AlmaraiRegular,
    color: Colors.placeholder,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: Fonts.AlmaraiRegular,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  closedContainer: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  closedText: {
    fontSize: 14,
    fontFamily: Fonts.CairoRegular,
  },
});
