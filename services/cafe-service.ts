import { API_CONFIG } from "@/constants/api";
import apiClient from "@/utils/api";

export interface CafeCategory {
  id: number;
  name: string;
  image_path?: string;
}

export interface CafeOption {
  id: number;
  name: string;
  price_adjustment: string;
}

export interface CafeOptionGroup {
  id: number;
  name: string;
  // type: 'select' | 'radio' | 'checkbox'; // Derived from min/max selections in UI if needed, but API sends:
  min_selections: number;
  max_selections: number;
  options: CafeOption[];
}

export interface CafeProduct {
  id: number;
  name: string;
  description?: string;
  price: string;
  image_path?: string;
  cafe_category_id: number;
  option_groups?: CafeOptionGroup[];
}

export interface CreateOrderPayload {
  car_id: number;
  items: {
    product_id: number;
    qty: number;
    options: number[]; // Array of option IDs from option_groups
    note?: string;
  }[];
  pickup_method: "branch" | "parking";
}

export interface CafeOrderItem {
  id: number;
  product_name?: string;
  product?: { id: number; name: string; image_path?: string };
  quantity?: number;
  qty?: number;
  price?: string;
  unit_price?: string;
  total_price?: string;
  options?: string[] | Record<string, unknown>[];
  image_path?: string;
}

export interface CafeOrder {
  id: number;
  user_id?: number;
  total: string;
  status: string; // 'pending', 'completed', 'cancelled'
  cafe_status: string; // 'pending', 'preparing', 'ready', 'picked_up'
  pickup_method: "branch" | "parking";
  created_at: string;
  is_free?: boolean;
  items?: CafeOrderItem[];
}

export const cafeService = {
  getCategories: async (): Promise<CafeCategory[]> => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.CAFE.CATEGORIES);
    return response.data.data;
  },

  getProducts: async (categoryId?: number): Promise<CafeProduct[]> => {
    const params = categoryId ? { category_id: categoryId } : {};
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.CAFE.PRODUCTS, {
      params,
    });
    return response.data.data;
  },

  getProductDetails: async (id: string): Promise<CafeProduct> => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.CAFE.PRODUCT(id));
    return response.data.data;
  },

  createOrder: async (payload: CreateOrderPayload) => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.CAFE.CREATE_ORDER,
      payload
    );
    return response.data;
  },

  createFreeOrderFromServiceOrder: async (
    serviceOrderId: number,
    pickupMethod: "branch" | "parking" = "branch"
  ) => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.CAFE.FREE_FROM_SERVICE_ORDER,
      { service_order_id: serviceOrderId, pickup_method: pickupMethod }
    );
    return response.data?.data ?? response.data;
  },

  getOrders: async (): Promise<CafeOrder[]> => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.CAFE.ORDERS);
    return response.data.data;
  },

  getOrderDetails: async (id: number): Promise<CafeOrder> => {
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.CAFE.ORDERS}/${id}`
    );
    return response.data.data;
  },
};
