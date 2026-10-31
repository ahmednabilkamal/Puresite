import { API_CONFIG } from "@/constants/api";
import apiClient from "@/utils/api";

export interface SavedCard {
  id: number;
  last_four: string;
  brand?: string;
  moyasar_token_id?: string;
}

export interface InitiatePaymentResult {
  payment_url?: string;
  order_type?: string;
  order_id?: number;
  total?: number;
  status?: string;
}

export const paymentService = {
  async getSavedCards(): Promise<SavedCard[]> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.SAVED_CARDS);
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
  },

  async initiatePayment(params: {
    orderType: string;
    orderId: number;
    success_url?: string;
    failure_url?: string;
    saved_card_id?: number;
  }): Promise<InitiatePaymentResult> {
    const body: Record<string, unknown> = {
      order_type: params.orderType,
      order_id: params.orderId,
    };
    if (params.success_url) body.success_url = params.success_url;
    if (params.failure_url) body.failure_url = params.failure_url;
    if (params.saved_card_id) body.saved_card_id = params.saved_card_id;

    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PAYMENTS_INITIATE, body);
    return response.data?.data ?? response.data ?? {};
  },

  async deleteSavedCard(id: number): Promise<void> {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.SAVED_CARDS}/${id}`);
  },

  async saveCardFromPayment(payment_id: string): Promise<SavedCard> {
    const response = await apiClient.post(
      `${API_CONFIG.ENDPOINTS.SAVED_CARDS}/from-payment`,
      { payment_id }
    );
    return response.data?.data ?? response.data;
  },
};
