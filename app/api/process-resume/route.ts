import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { analyzeResume } from "@/lib/gemini";
import { extractResumeText } from "@/lib/extractPdfText";
import { getAnalysisCache, setAnalysisCache } from "@/lib/aiCache";
import { getRedisClient } from "@/lib/redis";
import { createHash } from "crypto";

const DAILY_ANALYSIS_LIMIT = 10;

async function checkAnalysisRateLimit(userId: string) {
  const redis = getRedisClient();
  const key = `rate_limit:analysis:${userId}:${new Date().toISOString().slice(0, 10)}`;

  const currentCount = await redis.get<string>(key);
  if (currentCount && Number(currentCount) >= DAILY_ANALYSIS_LIMIT) {
    console.log("⚠️ Rate limit exceeded", { userId, key, currentCount });
    return {
      allowed: false,
      remaining: 0,
      current: Number(currentCount),
    };
  }

  const newCount = await redis.incr(key);
  if (newCount === 1) {
    await redis.expire(key, 60 * 60 * 24);
  }

  return {
    allowed: newCount <= DAILY_ANALYSIS_LIMIT,
    remaining: Math.max(DAILY_ANALYSIS_LIMIT - newCount, 0),
    current: newCount,
  };
}

export async function POST(req: Request) {
  try {
    console.log("🔥 PROCESS RESUME API HIT");

    const { resumeId } = await req.json();
    if (!resumeId) {
      return NextResponse.json(
        { error: "Missing resumeId" },
        { status: 400 }
      );
    }

    const resume = await prisma.userResume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    

    if (!resume.fileUrl) {
      return NextResponse.json(
        { error: "Resume file URL missing" },
        { status: 400 }
      );
    }

    const fileRes = await fetch(resume.fileUrl);
    if (!fileRes.ok) {
      console.error("Failed to fetch resume file", resume.fileUrl, fileRes.status);
      throw new Error("Failed to fetch resume file from cloud storage");
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    const fileHash = createHash("sha256").update(buffer).digest("hex");
    console.log("🔐 Resume hash generated", { resumeId, fileHash });

    const cachedAnalysis = await getAnalysisCache(fileHash);
    let analysis;
    const text = await extractResumeText(buffer, resume.fileName);

    if (cachedAnalysis) {
    console.log("✅ Cache hit");
    analysis = cachedAnalysis;
} else {
    // Only now check the limit
    const rate = await checkAnalysisRateLimit(resume.userId);

    if (!rate.allowed) {
        await prisma.userResume.update({
            where: { id: resumeId },
            data: { status: "RateLimitExceeded" },
        });

        return NextResponse.json(
            {
                error: "Daily Gemini analysis limit reached",
                limit: DAILY_ANALYSIS_LIMIT,
                used: rate.current,
            },
            { status: 429 }
        );
    }

    console.log("🚀 Calling Gemini...");
    analysis = await analyzeResume(text);

    await setAnalysisCache(fileHash, analysis);
}

    await prisma.userResume.update({
      where: { id: resumeId },
      data: {
        text,
        fileHash,
        atsScore: analysis.atsScore,
        aiAnalysis: analysis,
        status: "Completed",
      },
    });

    return NextResponse.json({ success: true, cached: Boolean(cachedAnalysis) });
  } catch (error) {
    console.error("❌ PROCESS RESUME FAILED:", error);
    return NextResponse.json(
      { error: "Resume processing failed" },
      { status: 500 }
    );
  }
}
