import z, { slugify } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(4, "Workspace name must be at least 4 characters long")
    .max(20, "Workspace name must be at most 20 characters long"),
  slug: z
    .string()
    .min(4, "Workspace name must be at least 4 characters long")
    .max(20, "Workspace name must be at most 20 characters long"),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(20).optional(),
  updateSlug: z.string().min(1).max(20).optional(),
});
