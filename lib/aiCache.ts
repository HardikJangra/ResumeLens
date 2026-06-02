import { getRedisClient } from "./redis";

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export async function getAnalysisCache(hash: string) {
  const redis = await getRedisClient();
  const cacheValue = await redis.get(`resume_analysis:${hash}`);
  if (!cacheValue) return null;

  try {
    return JSON.parse(cacheValue) as unknown;
  } catch (error) {
    console.error("Failed to parse cached resume analysis", error);
    return null;
  }
}

export async function setAnalysisCache(hash: string, analysis: unknown) {
  const redis = await getRedisClient();
  await redis.set(`resume_analysis:${hash}`, JSON.stringify(analysis), {
    EX: CACHE_TTL_SECONDS,
  });
}
