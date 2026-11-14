import { create } from "zustand";
import {
  getCurrentUser,
  loginUser,
  logout,
  registerUser,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "../api/auth.api";
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  getMe: () => Promise<void>;
  logout: () => Promise<void>;
}
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (data) => {
    set({ isLoading: true });
    try {
      const response = await loginUser(data);
      set({
        user: response.user,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },
  register: async (data) => {
    set({ isLoading: false });
    try {
      const response = await registerUser(data);
      set({
        user: response.user,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },
  getMe: async () => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      set({
        user,
        isAuthenticated: !!user,
      });
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    try {
      await logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));

export default useAuthStore;
