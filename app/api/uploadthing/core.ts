import { createUploadthing, type FileRouter } from "uploadthing/next";
import prisma from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { userId } = await getAuth(req);

      if (!userId) {
        throw new Error("Unauthorized");
      }

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.userResume.create({
        data: {
          userId: metadata.userId,
          fileName: file.name,
          fileUrl: file.url,
          atsScore: null,
          status: "Processing",
        },
      });

      return { success: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
