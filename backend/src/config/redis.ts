import IOredis from "ioredis";
import env from "./env";

const redis = new IOredis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (error) => {
  console.log("Redis connection error", error);
});

export default redis;
