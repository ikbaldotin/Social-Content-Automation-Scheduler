import { Request, Response } from "express";
import {
  addMemberSchema,
  updateMemberRoleSchema,
} from "../validate/membership.schema";
import { prisma } from "../utils/prisma";

const addMember = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = addMemberSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const { email } = result.data;
    const workspace = await prisma.workspace.findFirst({
      where: {
        slug,

        memberships: {
          some: {
            userId,
            role: {
              in: ["ADMIN", "OWNER"],
            },
          },
        },
      },
    });
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found or you don't have permission",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: workspace.id,
        },
      },
    });
    if (existingMembership) {
      return res.status(409).json({
        message: "User is already a workspace member",
      });
    }
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "MEMBER",
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
    return res.status(201).json({
      message: "Member added successfully",
      membership,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getAllMembers = async (req: Request, res: Response) => {
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
    const members = await prisma.membership.findMany({
      where: {
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
    return res.status(200).json({
      message: "Workspace members",
      members,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const targetUserId = req.params.userId as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = updateMemberRoleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const { role } = result.data;

    const workspace = await prisma.workspace.findFirst({
      where: {
        slug,
        memberships: {
          some: {
            userId,
            role: "OWNER",
          },
        },
      },
    });
    if (!workspace) {
      return res.status(403).json({
        message: "Only the workspace owner can change member roles",
      });
    }
    const targetMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId: workspace.id,
        },
      },
    });
    if (!targetMembership) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    if (targetMembership?.role === "OWNER") {
      return res.status(403).json({
        message: "Owner role cannot be changed",
      });
    }
    const updatedMembership = await prisma.membership.update({
      where: {
        id: targetMembership.id,
      },
      data: {
        role,
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    return res.status(200).json({
      message: "Member role updated successfully",
      membership: updatedMembership,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const removeMember = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const targetUserId = req.params.userId as string;
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
      include: {
        memberships: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
        },
      },
    });
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found or access denied",
      });
    }
    const requesterRole = workspace.memberships[0]?.role;
    if (requesterRole !== "OWNER" && requesterRole !== "ADMIN") {
      return res.status(403).json({
        message: "You don't have permission to remove members",
      });
    }
    const targetMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId: workspace.id,
        },
      },
    });
    if (!targetMembership) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    if (targetMembership.role === "OWNER") {
      return res.status(403).json({
        message: "Workspace owner cannot be removed",
      });
    }
    if (targetMembership.role === "ADMIN" && requesterRole === "ADMIN") {
      return res.status(403).json({
        message: "Admin cannot remove another admin",
      });
    }
    await prisma.membership.delete({
      where: {
        id: targetMembership.id,
      },
    });
    return res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { addMember, getAllMembers, updateMemberRole, removeMember };
