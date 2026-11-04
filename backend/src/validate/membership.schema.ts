import z from "zod";
export const addMemberSchema = z.object({
  email: z.email("Invalid email address"),
});
export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});
