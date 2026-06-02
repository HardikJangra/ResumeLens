import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redisClient?: RedisClientType;
};

function createRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error("Missing REDIS_URL environment variable.");
  }

  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (error) => {
    console.error("Redis connection error:", error);
  });

  return redisClient;
}

export async function getRedisClient() {
  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = createRedisClient();
  }

  const client = globalForRedis.redisClient;

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}
