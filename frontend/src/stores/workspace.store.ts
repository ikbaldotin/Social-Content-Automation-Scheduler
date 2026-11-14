import { create } from "zustand";

import {
  createWorkspace as createWorkspaceApi,
  deleteWorkspace as deleteWorkspaceApi,
  getAllWorkspaces,
  updateWorkspace as updateWorkspaceApi,
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput,
  type Workspace,
} from "../api/workspace.api";

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;

  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (data: CreateWorkspaceInput) => Promise<void>;
  selectWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (slug: string, data: UpdateWorkspaceInput) => Promise<void>;
  deleteWorkspace: (slug: string) => Promise<void>;
}

const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,

  // Fetch all workspaces
  fetchWorkspaces: async () => {
    set({ isLoading: true });

    try {
      const workspaces = await getAllWorkspaces();

      const savedWorkspaceId = localStorage.getItem("selectedWorkspaceId");

      const selectedWorkspace = workspaces.find(
        (workspace) => workspace.id === savedWorkspaceId,
      );

      const currentWorkspace = selectedWorkspace ?? workspaces[0] ?? null;

      set({
        workspaces,
        currentWorkspace,
      });

      if (currentWorkspace) {
        localStorage.setItem("selectedWorkspaceId", currentWorkspace.id);
      } else {
        localStorage.removeItem("selectedWorkspaceId");
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // Create workspace
  createWorkspace: async (data) => {
    await createWorkspaceApi(data);

    const workspaces = await getAllWorkspaces();

    const createdWorkspace = workspaces.find(
      (workspace) => workspace.slug === data.slug,
    );

    const selectedWorkspace = createdWorkspace ?? workspaces[0] ?? null;

    if (selectedWorkspace) {
      localStorage.setItem("selectedWorkspaceId", selectedWorkspace.id);
    }

    set({
      workspaces,
      currentWorkspace: selectedWorkspace,
    });
  },

  // Select workspace
  selectWorkspace: (workspace) => {
    localStorage.setItem("selectedWorkspaceId", workspace.id);

    set({ currentWorkspace: workspace });
  },

  // Update workspace
  updateWorkspace: async (slug, data) => {
    const previousWorkspace = get().currentWorkspace;

    await updateWorkspaceApi(slug, data);

    const workspaces = await getAllWorkspaces();

    const selectedWorkspace =
      workspaces.find((workspace) => workspace.id === previousWorkspace?.id) ??
      workspaces[0] ??
      null;

    if (selectedWorkspace) {
      localStorage.setItem("selectedWorkspaceId", selectedWorkspace.id);
    } else {
      localStorage.removeItem("selectedWorkspaceId");
    }

    set({
      workspaces,
      currentWorkspace: selectedWorkspace,
    });
  },

  // Delete workspace
  deleteWorkspace: async (slug) => {
    const currentWorkspace = get().currentWorkspace;

    await deleteWorkspaceApi(slug);

    const workspaces = await getAllWorkspaces();

    const selectedWorkspace =
      currentWorkspace?.slug === slug
        ? (workspaces[0] ?? null)
        : (workspaces.find(
            (workspace) => workspace.id === currentWorkspace?.id,
          ) ??
          workspaces[0] ??
          null);

    if (selectedWorkspace) {
      localStorage.setItem("selectedWorkspaceId", selectedWorkspace.id);
    } else {
      localStorage.removeItem("selectedWorkspaceId");
    }

    set({
      workspaces,
      currentWorkspace: selectedWorkspace,
    });
  },
}));

export default useWorkspaceStore;
