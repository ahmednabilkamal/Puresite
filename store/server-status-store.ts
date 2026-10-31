import { create } from "zustand";

interface ServerStatusState {
  isServerDown: boolean;
  setServerDown: () => void;
  clearServerDown: () => void;
}

export const useServerStatusStore = create<ServerStatusState>((set) => ({
  isServerDown: false,
  setServerDown: () => set({ isServerDown: true }),
  clearServerDown: () => set({ isServerDown: false }),
}));
