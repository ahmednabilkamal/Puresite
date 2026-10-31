import axios from "axios";
import { API_CONFIG } from "../constants/api";
import i18n from "./i18n";
import { storage } from "./storage";
import { useServerStatusStore } from "../store/server-status-store";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

let onUnauthenticatedCallback: (() => void) | null = null;

export const setupInterceptors = (callbacks: {
  onUnauthenticated: () => void;
}) => {
  onUnauthenticatedCallback = callbacks.onUnauthenticated;
};

// Request interceptor to add token, selected car id, and language
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getSecurely("user_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Attach current language to all requests
    const lang = i18n.language || "ar";
    (config.headers as any)["Accept-Language"] = lang;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    useServerStatusStore.getState().clearServerDown();
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., logout user or refresh token)
      await storage.deleteSecurely("user_token");

      // Trigger callback if registered
      if (onUnauthenticatedCallback) {
        onUnauthenticatedCallback();
      }
    } else {
      // No response = network/server unreachable (connection refused, timeout, DNS, etc.)
      // 5xx = server error
      const hasNoResponse = !error.response;
      const isServerError =
        error.response?.status && error.response.status >= 500;

      if (hasNoResponse || isServerError) {
        useServerStatusStore.getState().setServerDown();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
