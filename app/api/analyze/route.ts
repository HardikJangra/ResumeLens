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
  try {
  const resumes = await prisma.userResume.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json(resumes);
} catch (error) {
  console.error(error);
  return NextResponse.json(
    { error: "Failed to fetch resumes" },
    { status: 500 }
  );
}
}
