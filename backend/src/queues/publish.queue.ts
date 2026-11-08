import { Queue } from "bullmq";
import redis from "../config/redis";

const publishQueue = new Queue("publish-post", {
  connection: redis,
});

export default publishQueue;
