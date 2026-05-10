import type { UserPublic } from "@/backend";
import { create } from "zustand";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY_USER = "skeep_user";
const STORAGE_KEY_TOKEN = "skeep_token";

interface AuthStore {
  user: UserPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  lastActivity: number;
  login: (user: UserPublic, token: string) => void;
  logout: () => void;
  updateActivity: () => void;
  checkInactivity: () => boolean;
  restoreSession: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  lastActivity: Date.now(),

  login: (user: UserPublic, token: string) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    set({ user, token, isAuthenticated: true, lastActivity: Date.now() });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    set({ user: null, token: null, isAuthenticated: false, lastActivity: 0 });
  },

  updateActivity: () => {
    set({ lastActivity: Date.now() });
  },

  checkInactivity: () => {
    const { lastActivity, isAuthenticated } = get();
    if (!isAuthenticated) return false;
    const elapsed = Date.now() - lastActivity;
    if (elapsed > INACTIVITY_TIMEOUT) {
      get().logout();
      return true;
    }
    return false;
  },

  restoreSession: () => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser) as UserPublic;
        // Restore bigint fields properly
        user.id = BigInt(user.id);
        user.createdAt = BigInt(user.createdAt);
        user.lastActivity = BigInt(user.lastActivity);
        set({
          user,
          token: storedToken,
          isAuthenticated: true,
          lastActivity: Date.now(),
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  },
}));
