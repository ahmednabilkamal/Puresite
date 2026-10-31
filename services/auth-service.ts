import { API_CONFIG } from "../constants/api";
import apiClient from "../utils/api";
import { DEVICE_PUSH_TOKEN_KEY, storage } from "../utils/storage";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at?: string;
  avatar_url?: string | null;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/** Raw /me API response shape */
export interface MeResponseData {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  avatar: string | null;
  created_at: string;
}

export const authService = {
  login: async (
    email: string,
    password: string,
    pushToken: string,
  ): Promise<LoginResponse> => {
    const body: Record<string, string> = {
      email,
      password,
    };
    if (pushToken) {
      body.expo_push_token = pushToken;
    }
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_CONFIG.ENDPOINTS.LOGIN,
      body,
    );
    // Laravel returns { success: true, data: { user, token }, message: "..." }
    return response.data.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ email?: string }> => {
    const pushToken = (await storage.getItem(DEVICE_PUSH_TOKEN_KEY)) ?? "";
    const body: Record<string, string> = {
      ...userData,
    };
    if (pushToken) {
      body.expo_push_token = pushToken;
    }
    const response = await apiClient.post<ApiResponse<{ email?: string }>>(
      API_CONFIG.ENDPOINTS.REGISTER,
      body,
    );
    return response.data.data ?? {};
  },

  logout: async (): Promise<void> => {
    const deviceToken = (await storage.getItem(DEVICE_PUSH_TOKEN_KEY)) ?? "";
    const body: Record<string, string> = { device_token: deviceToken };
    await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT, body);
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete(API_CONFIG.ENDPOINTS.DELETE_ME);
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<MeResponseData>>(
      API_CONFIG.ENDPOINTS.ME,
    );
    const data = response.data.data;
    return {
      id: String(data.id),
      name: data.name,
      phone: data.phone,
      email: data.email ?? undefined,
      created_at: data.created_at,
      avatar_url: data.avatar ?? null,
    };
  },

  updateMe: async (data: { name: string }): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      API_CONFIG.ENDPOINTS.ME,
      data,
    );
    return response.data.data;
  },

  updateAvatar: async (avatar: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      API_CONFIG.ENDPOINTS.ME_AVATAR,
      { avatar },
    );
    return response.data.data;
  },

  sendEmailOtp: async (email: string): Promise<void> => {
    await apiClient.post(API_CONFIG.ENDPOINTS.OTP_SEND, { email });
  },

  verifyEmailOtp: async (
    email: string,
    code: string,
  ): Promise<{ user?: User; token?: string } | null> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse | null>>(
      API_CONFIG.ENDPOINTS.OTP_VERIFY,
      { email, code },
    );
    return response.data.data ?? null;
  },
};
