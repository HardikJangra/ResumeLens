"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Resume = {
  id: string;
  fileName: string;
  uploadedAt: string;
  atsScore: number | null;
  status: string;
};

export default function ResumeAnalysisPage() {
  const { id } = useParams();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResume() {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();

        const found = data.resumes?.find(
          (r: Resume) => r.id === id
        );

        setResume(found || null);
      } catch (err) {
        console.error("Failed to load resume", err);
      } finally {
        setLoading(false);
      }
    }

    loadResume();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Loading analysis...
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-10">
        <p className="text-red-500">Resume not found.</p>
        <Link href="/dashboard" className="text-indigo-600 underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mt-2">
          Resume Analysis
        </h1>
        <p className="text-gray-500 mt-1">
          {resume.fileName}
        </p>
      </div>

      {/* ATS Score Card */}
      <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
        <p className="text-sm uppercase tracking-wide opacity-80">
          ATS Score
        </p>
        <div className="flex items-end gap-4 mt-2">
          <span className="text-6xl font-bold">
            {resume.atsScore ?? "--"}
          </span>
          <span className="text-xl pb-2">/ 100</span>
        </div>

        <p className="mt-4 text-sm opacity-90">
          Status: {resume.status}
        </p>
      </div>

      {/* Analysis Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-3">
            Strengths
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Clear experience section</li>
            <li>Relevant technical skills</li>
            <li>Readable formatting</li>
          </ul>
        </div>

        {/* Missing Keywords */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-3">
            Missing Keywords
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>System Design</li>
            <li>Scalability</li>
            <li>Cloud Services</li>
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl border p-6 shadow-sm md:col-span-2">
          <h2 className="font-semibold text-lg mb-3">
            Recommendations
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Consider adding measurable achievements, include
            missing keywords from job descriptions, and
            improve consistency in formatting to boost
            ATS compatibility.
          </p>
        </div>
      </div>
    </div>
  );
}
