import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { extractPdfText } from "@/lib/extractPdfText";
import { analyzeResume } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    console.log("🔥 PROCESS RESUME API HIT");

    const { resumeId, fileUrl } = await req.json();

    // 1️⃣ Fetch PDF
    const fileRes = await fetch(fileUrl);
    const buffer = Buffer.from(await fileRes.arrayBuffer());

    // 2️⃣ Extract text
    const text = await extractPdfText(buffer);

    // 3️⃣ Gemini analysis
    const analysis = await analyzeResume(text);
    console.log("✅ Gemini API response received");

    // 4️⃣ SAVE EVERYTHING
    await prisma.userResume.update({
      where: { id: resumeId },
      data: {
        text,
        atsScore: analysis.atsScore,
        aiAnalysis: analysis, // ✅ THIS WAS MISSING
        status: "Completed",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ PROCESS RESUME FAILED:", error);
    return NextResponse.json(
      { error: "Resume processing failed" },
      { status: 500 }
    );
  }
}
