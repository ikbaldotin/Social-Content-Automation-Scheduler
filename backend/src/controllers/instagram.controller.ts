import { Request, Response } from "express";
import env from "../config/env";
import { instagramRequest } from "../providers/instagram.client";
import { InstagramProfile } from "../types/instagram.type";
import { prisma } from "../utils/prisma";
import { encryptToken } from "../utils/token-encryption";
import { SocialPlatform } from "../generated/prisma";

const getInstagramProfile = async (req: Request, res: Response) => {
  try {
    const accessToken = env.INSTAGRAM_ACCESS_TOKEN;

    const profile = await instagramRequest<InstagramProfile>(
      env.INSTAGRAM_ACCOUNT_ID,
      accessToken,
      {
        fields: "id,username",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Instagram profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    console.log("Instagram profile error", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch Instagram profile",
    });
  }
};
const connectInstagramAccount = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace ID is required",
      });
    }
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this workspace",
      });
    }
    const accessToken = env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: "Instagram access token is not configured",
      });
    }
    const profile = await instagramRequest<InstagramProfile>(
      env.INSTAGRAM_ACCOUNT_ID,
      accessToken,
      {
        fields: "id,username",
      },
    );
    if (!profile.id || !profile.username) {
      return res.status(502).json({
        success: false,
        message: "Meta returned an incomplete Instagram profile",
      });
    }
    const accessTokenEncrypted = encryptToken(accessToken);
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        accountId_workspaceId_platform: {
          accountId: profile.id,
          workspaceId,
          platform: SocialPlatform.INSTAGRAM,
        },
      },
      update: {
        accountName: profile.username,
        accessToken: accessTokenEncrypted,
        isActive: true,
      },
      create: {
        accountId: profile.id,
        accountName: profile.username,
        platform: SocialPlatform.INSTAGRAM,
        workspaceId,
        accessToken: accessTokenEncrypted,
      },
      select: {
        id: true,
        accountId: true,
        accountName: true,
        platform: true,
        isActive: true,
        workspaceId: true,
        createdAt: true,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Instagram account connected successfully",
      data: socialAccount,
    });
  } catch (error) {
    console.error("Connect Instagram error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to connect Instagram account",
    });
  }
};
export { getInstagramProfile, connectInstagramAccount };
