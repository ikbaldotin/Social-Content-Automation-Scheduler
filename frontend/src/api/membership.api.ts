import api from "./axios";

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export interface WorkspaceMember {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  role: WorkspaceRole;
  createdAt: string;

  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface MembersResponse {
  message: string;
  members: WorkspaceMember[];
}

interface MemberResponse {
  message: string;
  member: WorkspaceMember;
}

export interface AddMemberInput {
  email: string;
}

export interface UpdateMemberRoleInput {
  role: Exclude<WorkspaceRole, "OWNER">;
}

export const getAllMembers = async (
  slug: string,
): Promise<WorkspaceMember[]> => {
  const response = await api.get<MembersResponse>(
    `/membership/${slug}/members`,
  );

  return response.data.members;
};

export const addMember = async (
  slug: string,
  data: AddMemberInput,
): Promise<WorkspaceMember> => {
  const response = await api.post<MemberResponse>(
    `/membership/${slug}/members`,
    data,
  );

  return response.data.member;
};

export const updateMemberRole = async (
  slug: string,
  userId: string,
  data: UpdateMemberRoleInput,
) => {
  const response = await api.patch(
    `/membership/${slug}/members/${userId}`,
    data,
  );

  return response.data;
};

export const removeMember = async (slug: string, userId: string) => {
  const response = await api.delete(`/membership/${slug}/members/${userId}`);

  return response.data;
};
