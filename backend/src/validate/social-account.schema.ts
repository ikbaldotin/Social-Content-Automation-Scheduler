import z from "zod";

export const createSocialAccountSchema = z.object({
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "LINKEDIN"]),
  accountName: z.string().min(2).max(100),
  accountId: z.string().min(1).max(150),
});

export const updateSocialAccountSchema = z.object({
  accountName: z.string().min(2).max(100),
});
