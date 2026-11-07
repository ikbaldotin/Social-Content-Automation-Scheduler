import { Request, Response } from "express";
import { createPostSchema, updatePostSchema } from "../validate/post.schema";
import { prisma } from "../utils/prisma";

const createPost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = createPostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const { content, socialAccountId } = result.data;
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
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        id: socialAccountId,
        workspaceId: workspace.id,
        isActive: true,
      },
    });

    if (!socialAccount) {
      return res.status(400).json({
        message: "Invalid or inactive social account",
      });
    }
    const post = await prisma.post.create({
      data: {
        content,
        userId: userId,
        workspaceId: workspace.id,
        socialAccountId: socialAccount.id,
      },
    });
    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("createPost error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
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
    const posts = await prisma.post.findMany({
      where: {
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        content: true,
        status: true,
        scheduledAt: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      message: "Workspace posts retrieved successfully",
      posts,
    });
  } catch (error) {
    console.error("getAllPosts error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const postId = req.params.id as string;
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
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        workspaceId: workspace.id,
        userId: userId,
      },
      select: {
        id: true,
        content: true,
        status: true,
        scheduledAt: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
        medias: true,
        publishAttempts: true,
      },
    });
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      message: "Post retrieved successfully",
      post,
    });
  } catch (error) {
    console.error("getPostById error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updatePost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const postId = req.params.id as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = updatePostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const { content, socialAccountId } = result.data;
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
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        workspaceId: workspace.id,
      },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId !== userId) {
      return res.status(403).json({
        message: "You can only edit your own posts",
      });
    }
    if (post.status !== "DRAFT") {
      return res.status(400).json({
        message: "Only draft posts can be edited",
      });
    }
    if (socialAccountId) {
      const account = await prisma.socialAccount.findFirst({
        where: {
          id: socialAccountId,
          workspaceId: workspace.id,
          isActive: true,
        },
      });
      if (!account) {
        return res.status(400).json({
          message: "Invalid or inactive social account",
        });
      }
    }
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        ...(content !== undefined && { content }),
        ...(socialAccountId !== undefined && { socialAccountId }),
      },
    });
    return res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("updatePost error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const postId = req.params.id as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        workspace: {
          slug,
          memberships: {
            some: { userId },
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId !== userId) {
      return res.status(403).json({
        message: "You can only delete your own posts",
      });
    }
    if (post.status !== "DRAFT") {
      return res.status(400).json({
        message: "Only draft posts can be deleted",
      });
    }
    await prisma.post.delete({
      where: {
        id: postId,
      },
    });
    return res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("deletePost error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const cancelScheduledPost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const postId = req.params.id as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        workspace: {
          slug,
          memberships: {
            some: {
              userId,
            },
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId !== userId) {
      return res.status(403).json({
        message: "You can only cancel your own posts",
      });
    }
    if (post.status !== "SCHEDULED") {
      return res.status(400).json({
        message: "Only scheduled posts can be cancelled",
      });
    }
    const updatedPost = await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        status: "CANCELLED",
        scheduleVersion: {
          increment: 1,
        },
      },
      select: {
        id: true,
        status: true,
        scheduleVersion: true,
      },
    });
    return res.status(200).json({
      message: "Scheduled post cancelled successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("cancelScheduledPost error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  cancelScheduledPost,
};
