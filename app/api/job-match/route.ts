import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { matchJobDescription } from "@/lib/gemini";
import { Prisma } from "@prisma/client";

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
     * ✅ SAFETY CLEAN
     * Gemini sometimes wraps JSON in ```json ... ```
     */
    const cleaned = rawResult
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed: unknown;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("❌ Gemini returned invalid JSON:", cleaned);

      return NextResponse.json(
        {
          error: "AI response was not valid JSON",
          raw: cleaned,
        },
        { status: 500 }
      );
    }

    // ✅ Store result
    await prisma.userResume.update({
      where: { id: resumeId },
      data: {
        aiAnalysis: {
          ...(resume.aiAnalysis as object),
          jobMatch: parsed as Prisma.InputJsonValue,
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
