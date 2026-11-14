import api from "./axios";
export interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceListResponse {
  message: string;
  wokspace: Workspace[];
}

interface WorkspaceResponse {
  message: string;
  wokspace?: Workspace;
  name?: string;
  slug?: string;
}

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  updateSlug?: string;
}

export const getAllWorkspaces = async (): Promise<Workspace[]> => {
  const response = await api.get<WorkspaceListResponse>("/workspace/all");
  return response.data.wokspace;
};

export const createWorkspace = async (
  data: CreateWorkspaceInput,
): Promise<WorkspaceResponse> => {
  const response = await api.post<WorkspaceResponse>("/workspace/create", data);
  return response.data;
};

export const getWorkspaceBySlug = async (
  slug: string,
): Promise<Workspace | null> => {
  const response = await api.get<{ wokspace: Workspace | null }>(
    `/workspace/${slug}`,
  );
  return response.data.wokspace;
};

export const updateWorkspace = async (
  slug: string,
  data: UpdateWorkspaceInput,
): Promise<WorkspaceResponse> => {
  const response = await api.patch(`/workspace/${slug}`, data);
  return response.data;
};

export const deleteWorkspace = async (slug: string) => {
  await api.post(`/workspace/${slug}`);
};
