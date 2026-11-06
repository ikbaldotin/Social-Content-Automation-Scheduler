import z from "zod";
const envSchema = z.object({
    DATABASE_URL: z.url(),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("Invalid environment variables: ", z.treeifyError(parsedEnv.error));
    process.exit(1);
}
const env = parsedEnv.data;
export default env;
