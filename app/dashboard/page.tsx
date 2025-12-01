"use client";

import { useState } from "react";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { Eye, Download, Menu } from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data (replace with DB data)
  const recentResumes = [
    {
      name: "John_Resume_2024.pdf",
      uploaded: "2024-11-15",
      score: 78,
      status: "Ready",
    },
    {
      name: "Resume_Final.pdf",
      uploaded: "2024-11-10",
      score: 65,
      status: "Ready",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* === TOP NAV — with Hamburger === */}
      <header className="w-full flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm sticky top-0 z-20">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100 transition md:hidden"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="w-6 h-6 rounded-full bg-gray-300" />
      </header>

      {/* === MAIN CONTENT === */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Welcome text */}
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-500 mb-10">Manage and analyze your resumes</p>

        {/* === UPLOAD RESUME CARD === */}
        <div className="border-2 border-dashed border-purple-300 rounded-xl p-10 bg-linear-to-b from-purple-50 to-indigo-50 shadow-sm">

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-purple-600">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-3-3m3 3l3-3m5-4a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold">Upload Your Resume</h3>
            <p className="text-gray-500">Drag and drop or click to select a PDF file</p>

            <UploadDropzone<OurFileRouter, "resumeUploader">
  endpoint="resumeUploader"
  appearance={{
    container: "w-full border-none text-black",
    button:
      "bg-linear-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg",
  }}
/>

          </div>

        </div>

        {/* === RECENT RESUMES TABLE === */}
        <div className="mt-12 bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-6">Recent Resumes</h3>

          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 text-sm border-b">
                <th className="pb-3">File Name</th>
                <th className="pb-3">Date Uploaded</th>
                <th className="pb-3">ATS Score</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {recentResumes.map((res, idx) => (
                <tr key={idx} className="border-b last:border-none">
                  <td className="py-4 font-medium">{res.name}</td>
                  <td className="py-4 text-gray-600">{res.uploaded}</td>

                  {/* ATS Score + bar */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-purple-600">{res.score}</span>
                      <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${res.score}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                      {res.status}
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="py-4 flex items-center justify-end gap-4">
                    <button className="text-gray-600 hover:text-gray-900 transition">
                      <Eye size={20} />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 transition">
                      <Download size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </main>
  );
}
