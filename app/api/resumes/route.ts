import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // ✅ MUST await auth()
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json([], { status: 200 });
    }

    const resumes = await prisma.userResume.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("❌ Failed to fetch resumes:", error);

    // Always return array to protect frontend
    return NextResponse.json([], { status: 200 });
  }
}
