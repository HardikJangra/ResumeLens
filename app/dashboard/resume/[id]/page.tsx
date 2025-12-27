"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type AIAnalysis = {
  atsScore: number;
  skillsMatched: string[];
  skillsMissing: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

type Resume = {
  id: string;
  fileName: string;
  uploadedAt: string;
  atsScore: number | null;
  status: string;
  aiAnalysis?: AIAnalysis;
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
        const found = Array.isArray(data)
          ? data.find((r: Resume) => r.id === id)
          : data?.resumes?.find((r: Resume) => r.id === id);

        setResume(found || null);
      } catch (err) {
        console.error("Failed to load resume:", err);
      }
      setLoading(false);
    }

    loadResume();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading analysis…
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500">Resume not found</p>
        <Link href="/dashboard" className="underline mt-4">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (resume.status === "Processing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <div className="h-12 w-12 mb-4 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
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

      {/* ATS Score Card */}
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
            This score estimates how well your resume performs against Applicant
            Tracking Systems.
          </p>
          <span className="inline-block mt-4 px-4 py-1 rounded-full text-xs bg-green-900/30 text-green-400 border border-green-700/40">
            {resume.status}
          </span>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Section title="Strengths">
          {analysis?.strengths?.length ? (
            analysis.strengths.map((item, i) => (
              <ListItem key={i} icon="✔" color="text-green-400">
                {item}
              </ListItem>
            ))
          ) : (
            <Empty />
          )}
        </Section>

        {/* Weaknesses */}
        <Section title="Weaknesses">
          {analysis?.weaknesses?.length ? (
            analysis.weaknesses.map((item, i) => (
              <ListItem key={i} icon="✖" color="text-red-400">
                {item}
              </ListItem>
            ))
          ) : (
            <Empty />
          )}
        </Section>

        {/* Skills Matched */}
        <Section title="Skills Matched">
          <TagList items={analysis?.skillsMatched} color="green" />
        </Section>

        {/* Skills Missing */}
        <Section title="Skills Missing">
          <TagList items={analysis?.skillsMissing} color="red" />
        </Section>

        {/* Suggestions */}
        <Section title="AI Suggestions" full>
          {analysis?.suggestions?.length ? (
            analysis.suggestions.map((item, i) => (
              <ListItem key={i} icon="➜" color="text-purple-400">
                {item}
              </ListItem>
            ))
          ) : (
            <Empty />
          )}
        </Section>
      </div>
    </div>
  );
}

/* ---------- Small Reusable Components ---------- */

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
      className={`bg-[#0D1128] border border-[#1A1F36] rounded-xl p-6 shadow-sm ${
        full ? "md:col-span-2" : ""
      }`}
    >
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ListItem({
  icon,
  color,
  children,
}: {
  icon: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 text-sm text-gray-300">
      <span className={color}>{icon}</span>
      {children}
    </div>
  );
}

function TagList({
  items,
  color,
}: {
  items?: string[];
  color: "green" | "red";
}) {
  if (!items?.length) return <Empty />;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`px-3 py-1 rounded-full text-xs border ${
            color === "green"
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

function Empty() {
  return <p className="text-sm text-gray-500">No data available</p>;
}
