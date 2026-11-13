import { Request } from "express";
import { SocialPlatform } from "../generated/prisma";

export interface InstagramProfile {
  id: string;
  username: string;
}

// export interface AuthenticatedRequest extends Request {
//   userId: string;
// }
export interface InstagramPublishInput {
  accountId: string;
  accessToken: string;
  imageUrl: string;
  caption: string;
}
export interface ContainerResponse {
  id: string;
}

export interface ContainerStatus {
  id: string;
  status_code: "IN_PROGRESS" | "FINISHED" | "ERROR" | "EXPIRED" | "PUBLISHED";
  status?: string;
}

export interface PublishResponse {
  id: string;
}

export interface InstagramPublishResult {
  success: boolean;
  externalPostId: string;
  message: string;
}

export interface MetaApiError {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
}

export interface PublishInput {
  postId: string;
  content: string;
  platform: SocialPlatform;
  accountId: string;
  accessToken: string;
  imageUrl: string;
  accountName: string;
}

export interface PublishResult {
  success: boolean;
  externalPostId: string;
  message: string;
}
