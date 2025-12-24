import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    console.log("🔥 PROCESS RESUME API HIT (PDF PARSING SKIPPED)");

    const { resumeId } = await req.json();

    // 🔹 Temporary placeholder resume text
    const mockResumeText = `
      Software Engineer with experience in JavaScript, React, Node.js,
      REST APIs, databases, and cloud deployment.
    `;

    // 🔹 Temporary ATS logic (stable)
    const atsScore = Math.floor(65 + Math.random() * 25); // 65–90

    await prisma.userResume.update({
      where: { id: resumeId },
      data: {
        text: mockResumeText,
        atsScore,
        status: "Completed",
      },
    });

    console.log("✅ RESUME PROCESSED (MOCK MODE)");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ PROCESS RESUME FAILED:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
