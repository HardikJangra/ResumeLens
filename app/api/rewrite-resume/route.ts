import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, targetRole } = await req.json();

    const resume = await prisma.userResume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume || !resume.text) {
      return NextResponse.json(
        { error: "Resume not found or empty" },
        { status: 404 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Rewrite the resume content below for the target role: "${targetRole}"

Rules:
- Improve clarity, impact, and ATS friendliness
- Use bullet points
- Quantify achievements where possible
- Keep it concise and professional

Resume Text:
${resume.text}

Return ONLY plain text. No markdown. No JSON.
`;

    const result = await model.generateContent(prompt);
    const rewritten = result.response.text();

    return NextResponse.json({ rewritten });
  } catch (error) {
    console.error("❌ Resume rewrite failed:", error);
    return NextResponse.json(
      { error: "Resume rewrite failed" },
      { status: 500 }
    );
  }
}
