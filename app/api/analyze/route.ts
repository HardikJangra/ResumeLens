import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const resumes = await prisma.userResume.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json(resumes);
}
