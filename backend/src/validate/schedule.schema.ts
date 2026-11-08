import z from "zod";
export const schedulePostSchema = z.object({
  scheduledAt: z.iso.datetime({
    message: "Invalid scheduled date and time",
  }),
});
