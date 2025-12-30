import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { matchJobDescription } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, jobDescription } = await req.json();

    const resume = await prisma.userResume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume || !resume.text) {
      return NextResponse.json(
        { error: "Resume not processed yet" },
        { status: 400 }
      );
    }

    const result = await matchJobDescription(
      resume.text,
      jobDescription
    );

    await prisma.userResume.update({
      where: { id: resumeId },
      data: {
        jobMatch: result,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Job match failed:", error);
    return NextResponse.json(
      { error: "Job match failed" },
      { status: 500 }
    );
  }
}
