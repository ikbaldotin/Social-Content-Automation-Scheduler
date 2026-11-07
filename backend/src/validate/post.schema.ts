import z from "zod";
export const createPostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(5000),
  socialAccountId: z.uuid("Invalid social account ID-----0"),
});

export const updatePostSchema = z
  .object({
    content: z.string().min(1).max(5000).optional(),
    socialAccountId: z.uuid().optional(),
  })
  .refine(
    (data) => data.content !== undefined || data.socialAccountId !== undefined,
    { message: "At least one field must be provided" },
  );
