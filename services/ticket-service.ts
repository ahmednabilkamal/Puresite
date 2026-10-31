import { API_CONFIG } from "@/constants/api";
import apiClient from "@/utils/api";

export interface SupportTicketReply {
  id: number;
  message: string;
  is_admin_reply: boolean;
  sender_name: string;
  created_at: string;
}

export interface SupportTicket {
  id: number;
  ticket_number: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  replies?: SupportTicketReply[];
  replies_count?: number;
}

export interface CreateTicketBody {
  subject: string;
  message: string;
  priority?: "low" | "medium" | "high";
}

export const ticketService = {
  /**
   * Get all tickets for the authenticated user.
   */
  getTickets: async (): Promise<SupportTicket[]> => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.SUPPORT_TICKETS);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get a specific ticket with replies.
   */
  getTicketById: async (id: string): Promise<SupportTicket> => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.SUPPORT_TICKET(id));
    return response.data?.data ?? response.data;
  },

  /**
   * Create a new support ticket.
   */
  createTicket: async (body: CreateTicketBody): Promise<SupportTicket> => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.SUPPORT_TICKETS, body);
    return response.data?.data ?? response.data;
  },

  /**
   * Add a reply to a ticket.
   */
  addReply: async (ticketId: string, message: string): Promise<SupportTicket> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.SUPPORT_TICKET_REPLY(ticketId),
      { message }
    );
    return response.data?.data ?? response.data;
  },

  /**
   * Close a ticket.
   */
  closeTicket: async (ticketId: string): Promise<SupportTicket> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.SUPPORT_TICKET_CLOSE(ticketId)
    );
    return response.data?.data ?? response.data;
  },
};
