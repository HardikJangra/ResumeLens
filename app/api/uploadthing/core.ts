import { createUploadthing, type FileRouter } from "uploadthing/server";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f
    .fileTypes(["pdf"])
    .maxSize("4MB")
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Store in DB
      await prisma.userResume.create({
        data: {
          userId: metadata.userId,
          fileName: file.name,
          fileUrl: file.url,
          atsScore: null,
          status: "Processing",
        },
      });

      // MUST return file info to client
      return {
        uploadedFile: {
          url: file.url,
          name: file.name,
          size: file.size,
        },
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
