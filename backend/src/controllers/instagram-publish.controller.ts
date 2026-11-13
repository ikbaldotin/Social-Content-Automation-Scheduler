import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { SocialPlatform } from "../generated/prisma";
import { decryptToken } from "../utils/token-encryption";
import publishInstagramPost from "../providers/instagram.provider";

export const testInstagramPublish = async (req: Request, res: Response) => {
  try {
    const { workspaceId, socialAccountId, mediaId } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!workspaceId || !socialAccountId || !mediaId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId, socialAccountId and mediaId are required",
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
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        id: socialAccountId,
        workspaceId,
        platform: SocialPlatform.INSTAGRAM,
        isActive: true,
      },
    });
    if (!socialAccount || !socialAccount.accessToken) {
      return res.status(404).json({
        success: false,
        message: "Active Instagram account not found",
      });
    }
    const media = await prisma.media.findFirst({
      where: {
        id: mediaId,
        post: {
          is: {
            workspaceId,
          },
        },
      },
      include: {
        post: {
          select: {
            content: true,
          },
        },
      },
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found in this workspace",
      });
    }
    const accessToken = decryptToken(socialAccount.accessToken);
    const result = await publishInstagramPost({
      accountId: socialAccount.accountId,
      accessToken,
      imageUrl: media.fileUrl,
      caption: media.post.content,
    });
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        socialAccountId: socialAccount.id,
        externalPostId: result.externalPostId,
      },
    });
  } catch (error) {
    console.error("Instagram test publishing error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Instagram publishing failed",
    });
  }
};
