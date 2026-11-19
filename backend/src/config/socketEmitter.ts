import { Emitter } from "@socket.io/redis-emitter";
import redis from "./redis";

const socketRedis = redis.duplicate();

const socketEmitter = new Emitter(socketRedis);

export default socketEmitter;
