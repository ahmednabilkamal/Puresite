import { API_CONFIG } from "../constants/api";
import apiClient from "../utils/api";
import { ApiResponse } from "./auth-service";
import { storage } from "../utils/storage";

export interface Car {
  id: string;
  car_model: string;
  plate_number: string;
  color?: string;
  notes?: string;
  created_at?: string;
}

export interface CreateCarRequest {
  car_model: string;
  plate_number: string;
  color?: string;
  notes?: string;
}

export interface UpdateCarRequest {
  car_model?: string;
  plate_number?: string;
  color?: string;
  notes?: string;
}

export const carService = {
  getCars: async (): Promise<Car[]> => {
    const response = await apiClient.get<ApiResponse<Car[]>>(
      API_CONFIG.ENDPOINTS.CARS
    );
    return response.data.data;
  },

  getCarById: async (id: string): Promise<Car> => {
    const response = await apiClient.get<ApiResponse<Car>>(
      API_CONFIG.ENDPOINTS.CAR(id)
    );
    return response.data.data;
  },

  createCar: async (data: CreateCarRequest): Promise<Car> => {
    // Explicitly retrieve and send the token
    const token = await storage.getSecurely('user_token');
    const headers: { Authorization?: string } = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await apiClient.post<ApiResponse<Car>>(
      API_CONFIG.ENDPOINTS.CARS,
      data,
      { headers }
    );
    return response.data.data;
  },

  updateCar: async (id: string, data: UpdateCarRequest): Promise<Car> => {
    const token = await storage.getSecurely("user_token");
    const headers: { Authorization?: string } = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await apiClient.put<ApiResponse<Car>>(
      API_CONFIG.ENDPOINTS.CAR(id),
      data,
      { headers }
    );
    return response.data.data;
  },

  deleteCar: async (id: string): Promise<void> => {
    await apiClient.delete(API_CONFIG.ENDPOINTS.CAR(id));
  },
};
