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
  const params = useParams();
  const resumeId = params.id as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  const [jobDescription, setJobDescription] = useState("");
  const [jobMatch, setJobMatch] = useState<JobMatch | null>(null);
  const [matching, setMatching] = useState(false);

  const [targetRole, setTargetRole] = useState("");
  const [rewritten, setRewritten] = useState("");

  useEffect(() => {
    async function loadResume() {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`);
        const data = await res.json();
        setResume(data);
        setJobMatch(data.jobMatch ?? null);
      } catch (error) {
        console.error("Failed to load resume:", error);
      } finally {
        setLoading(false);
      }
    }

    if (resumeId) loadResume();
  }, [resumeId]);

  async function handleJobMatch() {
    if (!jobDescription.trim()) return;
    setMatching(true);

    try {
      const res = await fetch("/api/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });

      const data = await res.json();
      setJobMatch(data);
    } finally {
      setMatching(false);
    }
  }

  async function rewriteResume() {
    setRewritten("");

    const res = await fetch("/api/rewrite-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId, targetRole }),
    });

    const data = await res.json();
    if (data.rewritten) setRewritten(data.rewritten);
  }

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060B27] flex items-center justify-center text-gray-400">
        Loading resume analysis…
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-[#060B27] flex flex-col items-center justify-center">
        <p className="text-red-400">Resume not found</p>
        <Link href="/dashboard" className="mt-4 text-purple-400 underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (resume.status === "Processing") {
    return (
      <div className="min-h-screen bg-[#060B27] flex flex-col items-center justify-center text-gray-400">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
        Analyzing your resume…
      </div>
    );
  }

  const analysis = resume.aiAnalysis;

  /* ================= UI ================= */

  return (
    <main className="relative min-h-screen bg-[#060B27] text-gray-200 overflow-hidden">
      {/* Glow orbs (same as landing) */}
      <div className="absolute -top-40 -left-40 h-96 w-96 bg-purple-600/30 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 -right-40 h-96 w-96 bg-indigo-600/30 blur-[160px] rounded-full" />

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="text-purple-400 hover:underline text-sm">
          ← Back to Dashboard
        </Link>

        <h1 className="mt-3 text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-indigo-400">
          Resume Analysis
        </h1>
        <p className="text-gray-400 mb-10">{resume.fileName}</p>

        {/* INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <GlassSection title="Strengths" color="text-green-400">
            <List items={analysis?.strengths} />
          </GlassSection>

          <GlassSection title="Weaknesses" color="text-red-400">
            <List items={analysis?.weaknesses} />
          </GlassSection>

          <GlassSection title="Skills Matched" color="text-emerald-400">
            <Tags items={analysis?.skillsMatched} variant="green" />
          </GlassSection>

          <GlassSection title="Skills Missing" color="text-rose-400">
            <Tags items={analysis?.skillsMissing} variant="red" />
          </GlassSection>

          <GlassSection title="AI Suggestions" color="text-blue-400" full>
            <List items={analysis?.suggestions} />
          </GlassSection>
        </div>

        {/* JOB MATCH */}
        <GlassSection title="Job Description Matching" color="text-purple-400" full>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            className="w-full h-40 p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 placeholder:text-gray-500 backdrop-blur"
          />

          <button
            onClick={handleJobMatch}
            disabled={matching}
            className="mt-4 px-6 py-2 rounded-lg bg-linear-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition"
          >
            {matching ? "Matching..." : "Match Job"}
          </button>

          {jobMatch && (
            <div className="mt-6 space-y-3">
              <p className="font-bold text-lg text-purple-400">
                Match Score: {jobMatch.matchScore}%
              </p>
              <Tags items={jobMatch.matchedSkills} variant="green" />
              <Tags items={jobMatch.missingSkills} variant="red" />
              <List items={jobMatch.recommendations} />
            </div>
          )}
        </GlassSection>

        {/* REWRITE */}
        <GlassSection title="AI Resume Rewrite" color="text-yellow-400" full>
          <input
            type="text"
            placeholder="Target role (e.g. Frontend Developer)"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full mb-4 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 backdrop-blur"
          />

          <button
            onClick={rewriteResume}
            className="px-5 py-2 rounded-lg bg-linear-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition"
          >
            Rewrite Resume
          </button>

          {rewritten && (
            <pre className="mt-6 whitespace-pre-wrap bg-white/5 border border-white/10 rounded-lg p-4 text-sm backdrop-blur">
              {rewritten}
            </pre>
          )}
        </GlassSection>
      </div>
    </main>
  );
}

/* ================= HELPERS ================= */

function GlassSection({
  title,
  children,
  full,
  color,
}: {
  title: string;
  children: React.ReactNode;
  full?: boolean;
  color: string;
}) {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.2)] ${
        full ? "md:col-span-2" : ""
      }`}
    >
      <h3 className={`text-xl font-bold mb-4 ${color}`}>{title}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items?: string[] }) {
  if (!items || items.length === 0)
    return <p className="text-gray-400 text-sm">No data available</p>;

  return (
    <ul className="space-y-2 text-sm text-gray-300">
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
  if (!items || items.length === 0)
    return <p className="text-gray-400 text-sm">No data available</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            variant === "green"
              ? "bg-green-900/30 text-green-300 border-green-700/40"
              : "bg-red-900/30 text-red-300 border-red-700/40"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
