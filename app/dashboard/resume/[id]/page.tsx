"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ================= TYPES ================= */

type AIAnalysis = {
  atsScore: number;
  skillsMatched: string[];
  skillsMissing: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

type JobMatch = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
};

type Resume = {
  id: string;
  fileName: string;
  uploadedAt: string;
  atsScore: number | null;
  status: string;
  aiAnalysis?: AIAnalysis;
  jobMatch?: JobMatch;
};

/* ================= PAGE ================= */

export default function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  // Job match states
  const [jobDescription, setJobDescription] = useState("");
  const [jobMatch, setJobMatch] = useState<JobMatch | null>(null);
  const [matching, setMatching] = useState(false);

  /* ================= FETCH RESUME ================= */

  useEffect(() => {
    async function loadResume() {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        const data = await res.json();
        setResume(data);
        setJobMatch(data.jobMatch ?? null);
      } catch (error) {
        console.error("Failed to load resume:", error);
      } finally {
        setLoading(false);
      }
    }

    loadResume();
  }, [id]);

  /* ================= JOB MATCH HANDLER ================= */

  async function handleJobMatch() {
    if (!jobDescription.trim()) return;

    setMatching(true);

    try {
      const res = await fetch("/api/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: id,
          jobDescription,
        }),
      });

      const data = await res.json();
      setJobMatch(data);
    } catch (err) {
      console.error("Job match failed:", err);
    } finally {
      setMatching(false);
    }
  }

  /* ================= LOADING STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading resume analysis…
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-400">Resume not found</p>
        <Link href="/dashboard" className="mt-4 underline text-sm">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (resume.status === "Processing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
        Analyzing your resume…
      </div>
    );
  }

  const analysis = resume.aiAnalysis;
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

  /* ================= UI ================= */

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

      {/* ATS SCORE */}
      <div className="bg-[#0D1128] border border-[#1A1F36] rounded-2xl p-8 mb-10 shadow-lg flex flex-col md:flex-row items-center gap-10">
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

          <div
            className={`absolute inset-0 flex items-center justify-center text-4xl font-bold ${scoreColor}`}
          >
            {score}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            ATS Compatibility Score
          </h2>
          <p className="text-gray-400 max-w-md">
            This score estimates how well your resume performs against
            Applicant Tracking Systems.
          </p>
        </div>
      </div>

      {/* AI INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
        <Section title="Strengths">
          <List items={analysis?.strengths} />
        </Section>

        <Section title="Weaknesses">
          <List items={analysis?.weaknesses} />
        </Section>

        <Section title="Skills Matched">
          <Tags items={analysis?.skillsMatched} variant="green" />
        </Section>

        <Section title="Skills Missing">
          <Tags items={analysis?.skillsMissing} variant="red" />
        </Section>

        <Section title="AI Suggestions" full>
          <List items={analysis?.suggestions} />
        </Section>
      </div>

      {/* ================= JOB DESCRIPTION MATCHING ================= */}
      <div className="bg-[#0D1128] border border-[#1A1F36] rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">
          Job Description Matching
        </h2>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-40 p-4 bg-[#060B27] border border-[#1A1F36] rounded-lg text-sm text-white outline-none"
        />

        <button
          onClick={handleJobMatch}
          disabled={matching}
          className="mt-4 px-6 py-2 rounded-lg bg-linear-to-r from-purple-500 to-blue-500 hover:opacity-90 transition"
        >
          {matching ? "Matching..." : "Match Job"}
        </button>

        {jobMatch && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-purple-400 font-semibold mb-2">
                Match Score: {jobMatch.matchScore}%
              </p>

              <h4 className="font-semibold mb-1">Matched Skills</h4>
              <Tags items={jobMatch.matchedSkills} variant="green" />
            </div>

            <div>
              <h4 className="font-semibold mb-1">Missing Skills</h4>
              <Tags items={jobMatch.missingSkills} variant="red" />
            </div>

            <div className="md:col-span-2">
              <h4 className="font-semibold mb-1">Recommendations</h4>
              <List items={jobMatch.recommendations} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Section({
  title,
  children,
  full,
}: {
  title: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div
      className={`bg-[#0D1128] border border-[#1A1F36] rounded-xl p-6 ${
        full ? "md:col-span-2" : ""
      }`}
    >
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">No data available</p>;
  }

  return (
    <ul className="space-y-2 text-gray-300 text-sm">
      {items.map((item, i) => (
        <li key={i}>• {item}</li>
      ))}
    </ul>
  );
}

function Tags({
  items,
  variant,
}: {
  items?: string[];
  variant: "green" | "red";
}) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">No data available</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`px-3 py-1 rounded-full text-xs border ${
            variant === "green"
              ? "bg-green-900/30 text-green-400 border-green-700/40"
              : "bg-red-900/30 text-red-400 border-red-700/40"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
