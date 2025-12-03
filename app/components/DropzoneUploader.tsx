"use client";

import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export default function DropzoneUploader() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <UploadDropzone<OurFileRouter, "resumeUploader">
  endpoint="resumeUploader"
  onClientUploadComplete={(res) => {
    console.log("Upload done:", res);
    alert("Resume uploaded successfully!");
  }}
  onUploadError={(error) => {
    console.error(error);
    alert("Upload failed — " + error.message);
  }}
  appearance={{
    container: "w-full border-none text-white h-8",
    button:
      "bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-md text-xs shadow hover:opacity-90 transition",
  }}
/>

    </div>
  );
}
