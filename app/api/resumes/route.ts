import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ resumes: [] });
    }

    const resumes = await prisma.userResume.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("❌ Failed to fetch resumes:", error);
    return NextResponse.json({ resumes: [] }, { status: 500 });
  }
}
