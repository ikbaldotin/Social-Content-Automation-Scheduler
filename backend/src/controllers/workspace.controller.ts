import { Request, Response } from "express";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from "../validate/wokspace.schema";
import { prisma } from "../utils/prisma";

const createWorkspace = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = createWorkspaceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const { name, slug } = result.data;
    const wokspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        memberships: {
          create: {
            userId: userId,
            role: "OWNER",
          },
        },
      },
    });
    return res
      .status(201)
      .json({ message: "Workspace created successfully", name, slug });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllWorkspace = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const wokspace = await prisma.workspace.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
    });
    return res.status(200).json({ message: "All workspace", wokspace });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getWorkspaceBySlug = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const slug = req.params.slug as string;

    const wokspace = await prisma.workspace.findUnique({
      where: {
        slug,
        memberships: {
          some: {
            userId,
          },
        },
      },
    });
    return res.status(200).json({ message: "Workspace by slug", wokspace });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateWorkspace = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = updateWorkspaceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const { name, updateSlug } = result.data;
    const slug = req.params.slug as string;
    const wokspace = await prisma.workspace.update({
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
      data: {
        ...(name !== undefined && { name }),
        ...(updateSlug !== undefined && { slug: updateSlug }),
      },
    });
    return res.status(200).json({
      message: "Workspace updated successfully",
      wokspace,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteWorkspace = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const slug = req.params.slug as string;
    await prisma.workspace.delete({
      where: {
        slug,
        memberships: {
          some: {
            userId,
            role: {
              in: ["OWNER"],
            },
          },
        },
      },
    });
    return res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createWorkspace,
  getAllWorkspace,
  getWorkspaceBySlug,
  updateWorkspace,
  deleteWorkspace,
};
