import { API_CONFIG } from "@/constants/api";
import apiClient from "@/utils/api";

export interface CreateServiceOrderBody {
  service_id: number;
  car_id: number;
  car_size: string;
  slot_id?: number; // optional when is_fast_track is true
  addons: { addon_id: number; qty: number }[];
  pay_with_moyasar: boolean;
  is_fast_track: boolean;
}

export interface ServiceAddonOption {
  id: number;
  name: string;
  description?: string;
  price: number;
  has_size_pricing?: boolean;
  prices_by_size?: Record<string, number> | null;
  duration_delta_minutes?: number;
  is_required?: boolean;
  is_default?: boolean;
  max_qty?: number | null;
}

export interface ServiceOrderService {
  id: number;
  name: string;
  description?: string;
  base_price: string;
  car_sizes?: string[];
  has_size_pricing?: boolean;
  prices_by_size?: Record<string, number>;
  fast_track_price?: number | null;
  duration_minutes: number;
  category?: string;
  image_path?: string;
  addons?: ServiceAddonOption[];
  free_cafe_product_id?: number | null;
  free_cafe_qty?: number;
}

export interface ServiceOrderCar {
  id: string;
  name: string;
  car_model: string;
  plate_number: string;
  notes: string | null;
  created_at: string;
}

export interface ServiceOrderCafeOrder {
  id: number;
  cafe_status: string;
}

export interface ServiceOrder {
  id: number;
  order_type?: string;
  car?: ServiceOrderCar | null;
  car_size: string;
  status: string;
  subtotal: string;
  discount_total: string;
  total: string;
  payment_status: string;
  payment_reference?: string | null;
  ticket_code: string;
  qrcode_payload?: string;
  scheduled_at: string | null;
  is_fast_track: boolean;
  service: ServiceOrderService;
  addons: unknown[];
  created_at: string;
  cafe_order?: ServiceOrderCafeOrder | null;
}

export interface TimeSlot {
  slot_id?: number;
  id: number;
  time: string;
  full_time?: string;
  available: boolean;
}

export interface WorkingDay {
  date_id?: number;
  id?: number;
  date: string;
  day_name: string;
  slots: TimeSlot[];
}

export const bookingService = {
  getAvailableSlots: async (): Promise<WorkingDay[]> => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.BOOKINGS_SLOTS);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  createBooking: async (data: any): Promise<any> => {
    const response = await apiClient.post("/bookings", data);
    return response.data.data;
  },

  getBookingDetails: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data.data;
  },

  getServiceOrders: async (): Promise<ServiceOrder[]> => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.SERVICE_ORDERS);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  getServiceOrderById: async (id: string): Promise<ServiceOrder> => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.SERVICE_ORDER(id)
    );
    const data = response.data?.data ?? response.data;
    return data;
  },

  createServiceOrder: async (body: CreateServiceOrderBody): Promise<any> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.SERVICE_ORDERS,
      body
    );
    return response.data?.data ?? response.data;
  },

  submitTransaction: async (body: {
    service_order_id: number;
    transaction_id: string;
    amount: number;
    currency: string;
    payment_method: string;
    payment_gateway: string;
  }): Promise<any> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.TRANSACTION,
      body
    );
    return response.data?.data ?? response.data;
  },

  getTransactionByServiceOrderId: async (
    serviceOrderId: string
  ): Promise<TransactionInvoice> => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.TRANSACTION_ORDER(serviceOrderId)
    );
    return response.data?.data ?? response.data;
  },
};

/** GET /transaction/:id response (invoice) */
export interface TransactionInvoice {
  order_type?: string;
  order_id?: number;
  title?: string;
  date?: string;
  date_formatted?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  order_details?: {
    status: string;
    payment_status: string;
    scheduled_at: string;
    is_fast_track: boolean;
    ticket_code: string;
  };
  line_items?: Array<{
    description: string;
    detail: string;
    qty: number;
    unit_price: number;
    total_price: number;
  }>;
  addons?: Array<{
    name: string;
    qty: number;
    unit_price: number;
    total_price: number;
  }>;
  subtotal?: number;
  discount_total?: number;
  total?: number;
  currency?: string;
  payment_reference?: string | null;
}
