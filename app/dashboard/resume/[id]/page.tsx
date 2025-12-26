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
      const res = await fetch("/api/resumes");
      const data = await res.json();
      const found = data.resumes?.find((r: Resume) => r.id === id);
      setResume(found || null);
      setLoading(false);
    }
    loadResume();
  }, [id]);

  if (loading) {
    return <div className="p-10 text-gray-400">Loading analysis...</div>;
  }

  if (!resume) {
    return (
      <div className="p-10">
        <p className="text-red-500">Resume not found</p>
        <Link href="/dashboard" className="underline">
          Go back
        </Link>
      </div>
    );
  }

  const score = resume.atsScore ?? 0;
  const scoreColor =
    score >= 75
      ? "text-green-400"
      : score >= 60
      ? "text-yellow-400"
      : "text-red-400";

  const ringColor =
    score >= 75
      ? "stroke-green-400"
      : score >= 60
      ? "stroke-yellow-400"
      : "stroke-red-400";

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="text-sm text-gray-400 hover:underline"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-2">Resume Analysis</h1>
        <p className="text-gray-400 mt-1">{resume.fileName}</p>
      </div>
      

      {/* ATS SCORE CARD */}
      <div className="bg-[#0D1128] border border-[#1A1F36] rounded-2xl p-8 mb-10 shadow-lg flex flex-col md:flex-row items-center gap-10">
        {/* Circular Score */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#1F2A48"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              strokeWidth="10"
              fill="none"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * score) / 100}
              className={ringColor}
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center text-4xl font-bold ${scoreColor}`}>
            {score}
          </div>
        </div>

        {/* Score Info */}
        <div>
          <h2 className="text-xl font-semibold mb-2">ATS Compatibility</h2>
          <p className="text-gray-400 max-w-md">
            This score estimates how well your resume performs against
            Applicant Tracking Systems.
          </p>
          <span className="inline-block mt-4 px-4 py-1 rounded-full text-xs bg-green-900/30 text-green-400 border border-green-700/40">
            {resume.status}
          </span>
        </div>
      </div>

      {/* ANALYSIS SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-[#0D1128] border border-[#1A1F36] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">✅ Strengths</h3>
          <ul className="text-gray-400 space-y-2 text-sm">
            <li>Well-structured experience section</li>
            <li>Relevant technical skill keywords</li>
            <li>Readable formatting</li>
          </ul>
        </div>

        {/* Missing Keywords */}
        <div className="bg-[#0D1128] border border-[#1A1F36] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">⚠ Missing Keywords</h3>
          <ul className="text-gray-400 space-y-2 text-sm">
            <li>System Design</li>
            <li>Cloud Infrastructure</li>
            <li>Scalability</li>
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-[#0D1128] border border-[#1A1F36] rounded-xl p-6 shadow-sm md:col-span-2">
          <h3 className="font-semibold text-lg mb-4">💡 Recommendations</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Add measurable achievements, include missing keywords from job
            descriptions, and keep formatting consistent to improve ATS
            performance.
          </p>
        </div>
      </div>
    </div>
  );
}
