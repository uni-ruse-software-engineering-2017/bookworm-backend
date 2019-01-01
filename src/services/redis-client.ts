import * as redis from "ioredis";
import logger from "./logger";

export const redisClient = new redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined
});

redisClient.once("connect", () => {
  logger.info("Connected to Redis");
});
