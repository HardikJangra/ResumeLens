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
  const resumeId = params.id as string; // ✅ FIX: store once

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  // Job match
  const [jobDescription, setJobDescription] = useState("");
  const [jobMatch, setJobMatch] = useState<JobMatch | null>(null);
  const [matching, setMatching] = useState(false);

  // Rewrite
  const [targetRole, setTargetRole] = useState("");
  const [rewritten, setRewritten] = useState("");

  /* ================= FETCH RESUME ================= */

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

  /* ================= JOB MATCH ================= */

  async function handleJobMatch() {
    if (!jobDescription.trim()) return;

    setMatching(true);

    try {
      const res = await fetch("/api/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          jobDescription,
        }),
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error("Job match API failed:", text);
        return;
      }
      
      const data = await res.json();
      setJobMatch(data);
      
    } catch (err) {
      console.error("Job match failed:", err);
    } finally {
      setMatching(false);
    }
  }

  /* ================= RESUME REWRITE ================= */

  async function rewriteResume() {
    setRewritten("");

    const res = await fetch("/api/rewrite-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeId, // ✅ FIXED
        targetRole,
      }),
    });

    const data = await res.json();
    if (data.rewritten) setRewritten(data.rewritten);
  }

  /* ================= STATES ================= */

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

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <Link href="/dashboard" className="text-sm text-gray-400 hover:underline">
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mt-2">Resume Analysis</h1>
      <p className="text-gray-400 mb-8">{resume.fileName}</p>

      {/* ================= AI INSIGHTS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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

      {/* ================= JOB MATCH ================= */}
      <Section title="Job Description Matching" full>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here..."
          className="w-full h-40 p-4 bg-[#060B27] border border-[#1A1F36] rounded-lg text-sm"
        />

        <button
          onClick={handleJobMatch}
          disabled={matching}
          className="mt-4 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
        >
          {matching ? "Matching..." : "Match Job"}
        </button>

        {jobMatch && (
          <div className="mt-6">
            <p className="text-purple-400 font-semibold">
              Match Score: {jobMatch.matchScore}%
            </p>
            <Tags items={jobMatch.matchedSkills} variant="green" />
            <Tags items={jobMatch.missingSkills} variant="red" />
            <List items={jobMatch.recommendations} />
          </div>
        )}
      </Section>

      {/* ================= RESUME REWRITE ================= */}
      <Section title="AI Resume Rewrite" full>
        <input
          type="text"
          placeholder="Target role (e.g. Frontend Developer)"
          className="w-full mb-4 px-4 py-2 bg-[#080C1F] border border-[#1A1F36] rounded-lg text-sm"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />

        <button
          onClick={rewriteResume}
          className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
        >
          Rewrite Resume
        </button>

        {rewritten && (
          <pre className="mt-6 whitespace-pre-wrap bg-[#080C1F] border border-[#1A1F36] rounded-lg p-4 text-sm">
            {rewritten}
          </pre>
        )}
      </Section>
    </div>
  );
}

/* ================= HELPERS ================= */

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
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items?: string[] }) {
  if (!items || items.length === 0)
    return <p className="text-gray-500 text-sm">No data available</p>;

  return (
    <ul className="space-y-2 text-sm">
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
    return <p className="text-gray-500 text-sm">No data available</p>;

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`px-3 py-1 text-xs rounded-full border ${
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
