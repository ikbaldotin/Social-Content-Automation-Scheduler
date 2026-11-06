import { Request, Response } from "express";
import {
  createSocialAccountSchema,
  updateSocialAccountSchema,
} from "../validate/social-account.schema";
import { prisma } from "../utils/prisma";

const createSocialAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const slug = req.params.slug as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = createSocialAccountSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const { platform, accountId, accountName } = result.data;
    // Only OWNER and ADMIN can connect accounts
    const workspace = await prisma.workspace.findFirst({
      where: {
        slug,
        memberships: {
          some: {
            userId,
            role: {
              in: ["OWNER", "ADMIN"],
            },
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found or permission denied",
      });
    }

    const existingAccount = await prisma.socialAccount.findUnique({
      where: {
        accountId_workspaceId_platform: {
          accountId,
          workspaceId: workspace.id,
          platform,
        },
      },
    });

    if (existingAccount) {
      return res.status(409).json({
        message: "This social account is already connected",
      });
    }
    const socialAccount = await prisma.socialAccount.create({
      data: {
        accountId,
        platform,
        accountName,
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Social account connected successfully",
      socialAccount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getAllSocialAccounts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const workspace = await prisma.workspace.findFirst({
      where: {
        slug,
        memberships: {
          some: {
            userId,
          },
        },
      },
    });
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found or access denied",
      });
    }
    const socialAccounts = await prisma.socialAccount.findMany({
      where: {
        workspaceId: workspace.id,
        isActive: true,
      },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      message: "Social accounts retrieved successfully",
      socialAccounts,
    });
  } catch (error) {
    console.error("createSocialAccount error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getSocialAccountById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const accountId = req.params.id as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        id: accountId,
        isActive: true,
        workspace: {
          slug,

          memberships: {
            some: { userId },
          },
        },
      },
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountId: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found",
      });
    }
    return res.status(200).json({
      message: "Social account retrieved successfully",
      socialAccount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateSocialAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const accountId = req.params.id as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = updateSocialAccountSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const { accountName } = result.data;
    const workspace = await prisma.workspace.findFirst({
      where: {
        slug,
        memberships: {
          some: {
            userId,
            role: {
              in: ["OWNER", "ADMIN"],
            },
          },
        },
      },
    });
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found or permission denied",
      });
    }
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        id: accountId,
        isActive: true,
        workspaceId: workspace.id,
      },
    });
    if (!existingAccount) {
      return res.status(404).json({
        message: "Social account not found",
      });
    }
    const socialAccount = await prisma.socialAccount.update({
      where: {
        id: existingAccount.id,
      },
      data: {
        accountName,
      },
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountId: true,
        isActive: true,
        updatedAt: true,
      },
    });
    return res.status(200).json({
      message: "Social account updated successfully",
      socialAccount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const disconnectSocialAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const accountId = req.params.id as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const workspace = await prisma.workspace.findFirst({
      where: {
        slug,
        memberships: {
          some: {
            userId,
            role: {
              in: ["OWNER", "ADMIN"],
            },
          },
        },
      },
    });
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found or permission denied",
      });
    }
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        id: accountId,
        workspaceId: workspace.id,
        isActive: true,
      },
    });
    if (!existingAccount) {
      return res.status(404).json({
        message: "Social account not found",
      });
    }
    await prisma.socialAccount.update({
      where: {
        id: existingAccount.id,
      },
      data: {
        isActive: false,
      },
    });
    return res.status(200).json({
      message: "Social account disconnected successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createSocialAccount,
  getAllSocialAccounts,
  getSocialAccountById,
  updateSocialAccount,
  disconnectSocialAccount,
};
