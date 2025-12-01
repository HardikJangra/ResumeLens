"use client";

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export default function ResumeUploader() {
  return (
    <UploadButton<OurFileRouter, "resumeUploader">
      endpoint="resumeUploader"
      onClientUploadComplete={(res) => {
        console.log("UPLOAD DONE:", res);
      }}
      onUploadError={(err) => {
        console.error("UPLOAD ERROR:", err);
      }}
    />
  );
}
