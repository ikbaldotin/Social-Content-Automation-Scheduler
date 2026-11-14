import { create } from "zustand";
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  updateWorkspace,
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
  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const workspaces = await getAllWorkspaces();
      set((state) => ({
        workspaces,
        currentWorkspace: workspaces.find(
          (workspaces) => workspaces.id === state.currentWorkspace?.id,
        ),
      })) ??
        workspaces[0] ??
        null;
    } finally {
      set({ isLoading: false });
    }
  },
  createWorkspace: async (data) => {
    await createWorkspace(data);
    const workspaces = await getAllWorkspaces();
    const createWorkspaces = workspaces.find(
      (workspaces) => workspaces.slug === data.slug,
    );
    set({
      workspaces,
      currentWorkspace: createWorkspaces ?? workspaces[0] ?? null,
    });
  },
  selectWorkspace: (workspace) => {
    set({ currentWorkspace: workspace });
  },
  updateWorkspace: async (slug, data) => {
    await updateWorkspace(slug, data);
    const workspaces = await getAllWorkspaces();
    set((state) => ({
      workspaces,
      currentWorkspace: workspaces.find(
        (wokspace) => wokspace.id === state.currentWorkspace?.id,
      ),
    })) ??
      workspaces[0] ??
      null;
  },
  deleteWorkspace: async (slug) => {
    const currentWorkspace = get().currentWorkspace;
    await deleteWorkspace(slug);
    const workspaces = await getAllWorkspaces();
    set({
      workspaces,
      currentWorkspace:
        currentWorkspace?.slug === slug
          ? (workspaces[0] ?? null)
          : (workspaces.find(
              (workspace) => workspace.id === currentWorkspace?.id,
            ) ??
            workspaces[0] ??
            null),
    });
  },
}));

export default useWorkspaceStore;
