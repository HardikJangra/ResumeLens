import { createUploadthing, type FileRouter } from "uploadthing/server";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({ 
    pdf: { maxFileSize: "4MB" }   // ✔ correct key
  })
    .middleware(async () => {
      const { userId } = await auth();  // ✔ correct for Clerk

      if (!userId) throw new Error("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.userResume.create({
        data: {
          userId: metadata.userId, // ✔ typed
          fileName: file.name,     // ✔ typed
          fileUrl: file.url,       // ✔ typed
          atsScore: null,
          status: "Processing",
        },
      });

      return { success: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
