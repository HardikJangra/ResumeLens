import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { matchJobDescription } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { resumeId, jobDescription } = await req.json();

    if (!resumeId || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resumeId or jobDescription" },
        { status: 400 }
      );
    }

    const resume = await prisma.userResume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || !resume.text) {
      return NextResponse.json(
        { error: "Resume not found or text missing" },
        { status: 404 }
      );
    }

    // 🔥 Call Gemini
    const rawResult = await matchJobDescription(
      resume.text,
      jobDescription
    );

    /**
     * ✅ SAFETY CLEAN (CRITICAL)
     * Gemini often wraps JSON in ```json ... ```
     */
    let cleaned = rawResult
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Optional: store result
    await prisma.userResume.update({
      where: { id: resumeId },
      data: {
        aiAnalysis: {
          ...(resume.aiAnalysis as object),
          jobMatch: parsed,
        },
      },
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Job match failed:", error);
    return NextResponse.json(
      { error: "Job match failed" },
      { status: 500 }
    );
  }
}
