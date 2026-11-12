import IORedis from "ioredis";
import env from "./env";

const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 1000, 10000);
    console.log(
      `Redis reconnecting... Attempt ${times}. Retrying in ${delay}ms`,
    );
    return delay;
  },
  reconnectOnError(error) {
    console.error("Redis connection error:", error.message);
    if (error.message.includes("READONLY")) {
      return true;
    }
    return false;
  },
});

redis.on("connect", () => {
  console.log("Redis connected successfully.");
});
redis.on("ready", () => {
  console.log("Redis is ready to accept commands.");
});

redis.on("reconnecting", (delay: number) => {
  console.log(`Redis reconnecting in ${delay}ms.`);
});

redis.on("error", (error) => {
  console.error("Redis error:", error.message);
});

redis.on("close", () => {
  console.log("Redis connection closed.");
});
redis.on("end", () => {
  console.log(`Redis connection ended. No more reconnection attempts.`);
});

export default redis;
