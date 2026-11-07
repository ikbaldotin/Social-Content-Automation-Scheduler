import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables: ",
    z.treeifyError(parsedEnv.error),
  );
  process.exit(1);
}
const env = parsedEnv.data;

export default env;
