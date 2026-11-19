import { create } from "zustand";

import {
  getAllMembers,
  addMember as addMemberApi,
  updateMemberRole as updateMemberRoleApi,
  removeMember as removeMemberApi,
  type WorkspaceMember,
  type AddMemberInput,
  type UpdateMemberRoleInput,
} from "../api/membership.api";

interface MembershipState {
  members: WorkspaceMember[];
  isLoading: boolean;
  error: string | null;

  fetchMembers: (slug: string) => Promise<void>;

  addMember: (slug: string, data: AddMemberInput) => Promise<void>;

  updateMemberRole: (
    slug: string,
    userId: string,
    data: UpdateMemberRoleInput,
  ) => Promise<void>;

  removeMember: (slug: string, userId: string) => Promise<void>;

  clearMembers: () => void;
}

const useMembershipStore = create<MembershipState>((set) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async (slug) => {
    set({ isLoading: true, error: null });

    try {
      const members = await getAllMembers(slug);
      set({ members });
    } catch (error) {
      set({
        error: "Failed to fetch workspace members",
        members: [],
      });

      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addMember: async (slug, data) => {
    try {
      await addMemberApi(slug, data);

      const members = await getAllMembers(slug);
      set({ members, error: null });
    } catch (error) {
      set({ error: "Failed to add member" });
      throw error;
    }
  },

  updateMemberRole: async (slug, userId, data) => {
    set({ isLoading: true, error: null });

    try {
      await updateMemberRoleApi(slug, userId, data);

      const members = await getAllMembers(slug);
      set({ members, error: null });
    } catch (error) {
      set({ error: "Failed to update member role" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeMember: async (slug, userId) => {
    try {
      await removeMemberApi(slug, userId);

      const members = await getAllMembers(slug);
      set({ members, error: null });
    } catch (error) {
      set({ error: "Failed to remove member" });
      throw error;
    }
  },

  clearMembers: () => {
    set({
      members: [],
      error: null,
      isLoading: false,
    });
  },
}));

export default useMembershipStore;
