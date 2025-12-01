"use client";

import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export default function DropzoneUploader() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <UploadDropzone<OurFileRouter, "fileUploader">
        endpoint="fileUploader"
        onClientUploadComplete={(res) => {
          console.log("Upload complete:", res);
        }}
        onUploadError={(error) => {
          alert(`Upload failed: ${error.message}`);
        }}
      />
    </div>
  );
}
