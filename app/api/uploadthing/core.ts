import { createUploadthing, type FileRouter } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const saved = await prisma.userResume.create({
        data: {
          userId: metadata.userId,
          fileName: file.name,
          fileUrl: file.url,
          text: "",
          status: "Processing",
        },
      });

      console.log("🚀 Triggering resume processing:", saved.id);

      await fetch("/api/process-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: saved.id,
          fileUrl: file.url,
        }),
      });

      return { resumeId: saved.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
