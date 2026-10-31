import { create } from "zustand";
import { authService } from "../services/auth-service";
import { storage } from "../utils/storage";

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at?: string;
  avatar_url?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (user, token) => {
    await storage.saveSecurely("user_token", token);
    await storage.setItem("user_data", JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      // Call API logout endpoint if user is authenticated
      const token = await storage.getSecurely("user_token");
      if (token) {
        await authService.logout();
      }
    } catch (error) {
      console.error("Error during logout API call:", error);
      // Continue with local logout even if API call fails
    } finally {
      await storage.deleteSecurely("user_token");
      await storage.removeItem("user_data");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: async (user) => {
    await storage.setItem("user_data", JSON.stringify(user));
    set({ user });
  },

  fetchMe: async () => {
    try {
      const token = await storage.getSecurely("user_token");
      if (!token) return;
      const user = await authService.getMe();
      await storage.setItem("user_data", JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error("Error fetching /me:", error);
    }
  },

  initialize: async () => {
    try {
      const token = await storage.getSecurely("user_token");
      const userData = await storage.getItem("user_data");

      if (token && userData) {
        set({
          user: JSON.parse(userData),
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error initializing auth store:", error);
      set({ isLoading: false });
    }
  },
}));
