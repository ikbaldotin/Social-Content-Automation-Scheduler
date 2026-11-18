import { create } from "zustand";
import {
  connectInstagramAccount,
  disconnectSocialAccount,
  getAllSocialAccounts,
  type SocialAccount,
} from "../api/social-account.api";
interface SocialAccountState {
  socialAccounts: SocialAccount[];
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;

  fetchSocialAccounts: (slug: string) => Promise<void>;
  connectInstagram: (workspaceId: string) => Promise<void>;
  clearSocialAccounts: () => Promise<void>;
  disconnectAccount: (slug: string, accountId: string) => Promise<void>;
}
const useSocialAccountStore = create<SocialAccountState>((set) => ({
  socialAccounts: [],
  isLoading: false,
  isConnecting: false,
  error: null,
  fetchSocialAccounts: async (slug) => {
    set({ isLoading: true });
    try {
      const accounts = await getAllSocialAccounts(slug);
      set({ socialAccounts: accounts });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch social accounts";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  connectInstagram: async (workspaceId) => {
    set({ isConnecting: true, error: null });
    try {
      await connectInstagramAccount(workspaceId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to connect Instagram";
      set({ error: message });
      throw error;
    } finally {
      set({ isConnecting: false });
    }
  },
  clearSocialAccounts: async () => {
    set({ socialAccounts: [], error: null });
  },
  disconnectAccount: async (slug, accountId) => {
    set({ isLoading: true, error: null });
    try {
      const account = await disconnectSocialAccount(slug, accountId);
      set({ socialAccounts: account });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to disconnect social account";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useSocialAccountStore;
