"use client";

import { useEffect, useState } from "react";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { Eye, Download, Menu, Home, FileText, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  interface Resume {
    id: string;
    fileName: string;
    uploadedAt: string;
    atsScore?: number;
    status: string;
    fileUrl: string;
  }

  const [resumes, setResumes] = useState<Resume[]>([]);
   const [loading, setLoading] = useState(true);

  // Fetch real resume data from API
  useEffect(() => {
    async function loadResumes() {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        setResumes(data);
      } catch (err) {
        console.error("Error fetching resumes:", err);
      }
      setLoading(false);
    }
    loadResumes();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex">

      {/* ⭐ SIDEBAR ⭐ */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r shadow-sm z-30
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
          md:translate-x-0
        `}
      >
        <div className="px-6 py-6 border-b">
          <h2 className="text-lg font-semibold">ResumeLens AI</h2>
        </div>

        <nav className="px-4 py-6 space-y-2">

          <Link href="/dashboard">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition font-medium">
              <Home size={20} />
              Dashboard
            </div>
          </Link>

          <Link href="/history">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition text-gray-700">
              <FileText size={20} />
              Resume History
            </div>
          </Link>

          <Link href="/settings">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition text-gray-700">
              <Settings size={20} />
              Settings
            </div>
          </Link>

          <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition text-gray-700">
            <LogOut size={20} />
            Log Out
          </button>

        </nav>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ⭐ MAIN CONTENT ⭐ */}
      <div className="flex-1 md:ml-64">

        {/* TOP NAVBAR */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition md:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="w-6 h-6 rounded-full bg-gray-300" />
        </header>

        {/* PAGE CONTENT */}
        <div className="max-w-5xl mx-auto px-6 py-10">

          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-gray-500 mb-10">Manage and analyze your resumes</p>

          {/* ⭐ UPLOAD CARD ⭐ */}
          <div className="border-2 border-dashed border-purple-300 rounded-xl p-10 bg-linear-to-b from-purple-50 to-indigo-50 shadow-sm">

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="text-purple-600">
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-3-3m3 3l3-3m5-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold">Upload Your Resume</h3>
              <p className="text-gray-500">Drag and drop or click to select a PDF file</p>

              {/* UploadThing Dropzone */}
              <UploadDropzone<OurFileRouter, "resumeUploader">
                endpoint="resumeUploader"
                appearance={{
                  container: "w-full border-none text-black",
                  button:
                    "bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg",
                }}
              />
            </div>
          </div>

          {/* ⭐ RECENT RESUMES TABLE ⭐ */}
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : resumes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No resumes uploaded yet.
                    </td>
                  </tr>
                ) : (
                  resumes.map((res) => (
                    <tr key={res.id} className="border-b last:border-none">
                      <td className="py-4 font-medium">{res.fileName}</td>

                      <td className="py-4 text-gray-600">
                        {new Date(res.uploadedAt).toISOString().split("T")[0]}
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-purple-600">
                            {res.atsScore ?? "--"}
                          </span>

                          <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${res.atsScore || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                          {res.status}
                        </span>
                      </td>

                      <td className="py-4 flex items-center justify-end gap-4">
                        <Link
                          href={res.fileUrl}
                          target="_blank"
                          className="text-gray-600 hover:text-black"
                        >
                          <Eye size={20} />
                        </Link>

                        <a
                          href={res.fileUrl}
                          download
                          className="text-gray-600 hover:text-black"
                        >
                          <Download size={20} />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

        </div>
      </div>
    </main>
  );
}
