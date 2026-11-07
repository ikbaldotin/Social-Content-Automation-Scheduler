import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import uploadToCloudinary from "../utils/uploadToCloudinary";
import cloudinary from "../config/cloudinary";

const uploadPostMedia = async (req: Request, res: Response) => {
  let uploadedPublicId: string | null = null;
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const postId = req.params.id as string;
    const file = req.file;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!file) {
      return res.status(400).json({
        message: "Please upload an image",
      });
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
      return res.status(404).json({
        message: "Post not found",
      });
    }
    if (post.userId !== userId) {
      return res.status(403).json({
        message: "You can only manage media for your own posts",
      });
    }
    if (post.status !== "DRAFT") {
      return res.status(400).json({
        message: "Media can only be added to draft posts",
      });
    }
    const uploadedImage = await uploadToCloudinary(file.buffer);
    uploadedPublicId = uploadedImage.public_id;
    const media = await prisma.media.create({
      data: {
        fileName: req.file?.originalname!,
        fileUrl: uploadedImage.secure_url,
        publicId: uploadedPublicId!,
        mimeType: req.file?.mimetype!,
        size: uploadedImage.bytes,
        postId: post.id,
      },
    });
    return res.status(201).json({
      message: "Media uploaded successfully",
      media,
    });
  } catch (error) {
    console.error("uploadPostMedia error:", error);
    if (uploadedPublicId) {
      await cloudinary.uploader
        .destroy(uploadedPublicId)
        .catch((cleanupError) => {
          console.error("Cloudinary cleanup error:", cleanupError);
        });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getPostMedia = async (req: Request, res: Response) => {
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
      return res.status(404).json({
        message: "Post not found",
      });
    }
    const medias = await prisma.media.findMany({
      where: {
        postId: post.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      message: "Post media retrieved successfully",
      medias,
    });
  } catch (error) {
    console.error("getPostMedia error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deletePostMedia = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug as string;
    const postId = req.params.id as string;
    const mediaId = req.params.mediaId as string;
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
      return res.status(404).json({
        message: "Post not found",
      });
    }
    if (post.userId !== userId) {
      return res.status(403).json({
        message: "You can only delete media from your own posts",
      });
    }
    if (post.status !== "DRAFT") {
      return res.status(400).json({
        message: "Media can only be deleted from draft posts",
      });
    }
    const media = await prisma.media.findFirst({
      where: {
        id: mediaId,
        postId: post.id,
      },
    });
    if (!media) {
      return res.status(404).json({
        message: "Media not found",
      });
    }
    const cloudinaryResult = await cloudinary.uploader.destroy(media.publicId, {
      resource_type: "image",
    });

    if (
      cloudinaryResult.result !== "ok" &&
      cloudinaryResult.result !== "not found"
    ) {
      return res.status(502).json({
        message: "Could not delete image from Cloudinary",
      });
    }
    await prisma.media.delete({
      where: {
        id: media.id,
      },
    });
    return res.status(200).json({
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("deletePostMedia error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export { uploadPostMedia, getPostMedia, deletePostMedia };
