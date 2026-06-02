import { createUploadthing, type FileRouter } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { uploadResumeToCloudinary } from "@/lib/cloudinary";

const f = createUploadthing();

const MAX_RESUME_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ourFileRouter = {
  resumeUploader: f({ blob: { maxFileSize: "8MB" } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const normalizedType = (file.type ?? "").toLowerCase();

      if (
        !ALLOWED_EXTENSIONS.includes(`.${extension}`) ||
        (normalizedType && !ALLOWED_MIME_TYPES.includes(normalizedType))
      ) {
        console.error("Invalid resume upload attempt", {
          fileName: file.name,
          fileType: file.type,
        });
        throw new Error("Invalid file type. Upload only PDF or DOCX resumes.");
      }

      if (file.size > MAX_RESUME_SIZE_BYTES) {
        console.error("Resume upload too large", { fileName: file.name, size: file.size });
        throw new Error("Resume file size exceeds the 8MB limit.");
      }

      let cloudUpload;
      try {
        cloudUpload = await uploadResumeToCloudinary(file.url, file.name);
        console.log("=== CLOUDINARY RESULT ===");
console.log(cloudUpload);
        
      } catch (error) {
        console.error("Cloud resume upload failed:", error);
        throw new Error("Failed to save resume to cloud storage. Please try again.");
      }
      console.log("=== SAVING TO DB ===");
console.log({
  fileUrl: cloudUpload.secureUrl,
  fileKey: cloudUpload.publicId,
});

      const saved = await prisma.userResume.create({
        data: {
          userId: metadata.userId,
          fileName: file.name,
          fileUrl: cloudUpload.secureUrl,
          fileKey: cloudUpload.publicId,
          text: "",
          status: "Processing",
        },
      });

      console.log("🚀 Resume persisted, starting processing:", saved.id);

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: saved.id,
          fileUrl: cloudUpload.secureUrl,
        }),
      });

      return { resumeId: saved.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
