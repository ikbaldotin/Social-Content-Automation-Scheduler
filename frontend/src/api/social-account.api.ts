import api from "./axios";
export type SocialPlatform = "INSTAGRAM" | "FACEBOOK" | "LINKEDIN";
export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  accountId: string;
  accountName: string;
  isActive: boolean;
  createdAt: string;
}

interface SocialAccountsResponse {
  message: string;
  socialAccounts: SocialAccount[];
}
interface ConnectInstagramResponse {
  success: boolean;
  message: string;
  data: SocialAccount;
}
export const getAllSocialAccounts = async (
  slug: string,
): Promise<SocialAccount[]> => {
  const response = await api.get<SocialAccountsResponse>(
    `/social/${slug}/social-accounts`,
  );
  return response.data.socialAccounts;
};

export const connectInstagramAccount = async (
  workspaceId: string,
): Promise<ConnectInstagramResponse> => {
  try {
    const response = await api.post<ConnectInstagramResponse>(
      "/instagram/connect",
      { workspaceId },
    );
    return response.data;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response &&
      typeof error.response.data === "object" &&
      error.response.data !== null &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
    ) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const disconnectSocialAccount = async (
  slug: string,
  accountId: string,
) => {
  const response = await api.delete(
    `/social/${slug}/social-accounts/${accountId}`,
  );
  return response.data;
};
