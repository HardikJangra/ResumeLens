import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as {
  redisClient?: Redis;
};

function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variable."
    );
  }

  return new Redis({
    url,
    token,
    automaticDeserialization: false,
  });
}

export function getRedisClient() {
  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = createRedisClient();
  }

  return globalForRedis.redisClient;
}
