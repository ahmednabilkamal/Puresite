import { API_CONFIG } from "../constants/api";
import apiClient from "../utils/api";
import { ApiResponse } from "./auth-service";

export interface Addon {
  id: string;
  name: string;
  description?: string;
  image_path?: string;
  price: string;
  duration_delta_minutes: number;
  is_required?: boolean;
  is_default?: boolean;
  max_qty?: number;
  has_size_pricing?: boolean;
  prices_by_size?: Record<string, number>;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  base_price: string;
  duration_minutes: number;
  category?: string;
  image_path?: string;
  addons?: Addon[];
  car_sizes?: string[];
  has_size_pricing?: boolean;
  prices_by_size?: Record<string, number>;
  fast_track_price?: number | null;
}

export const serviceService = {
  getServices: async (): Promise<Service[]> => {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      API_CONFIG.ENDPOINTS.SERVICES
    );
    return response.data.data;
  },

  getServiceById: async (id: string): Promise<Service> => {
    const response = await apiClient.get<ApiResponse<Service>>(
      API_CONFIG.ENDPOINTS.SERVICE(id)
    );
    return response.data.data;
  },
};
