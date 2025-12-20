"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function ResumeAnalysisPage() {
  // Mock AI data (replace later with backend)
  const analysis = {
    atsScore: 82,
    skillsMatched: ["React", "Next.js", "TypeScript", "Tailwind", "Node.js"],
    skillsMissing: ["Docker", "CI/CD", "Testing"],
    strengths: [
      "Strong technical skillset",
      "Clear project descriptions",
      "Well-structured experience section",
    ],
    weaknesses: [
      "Missing quantified achievements",
      "No summary section",
      "Formatting inconsistencies",
    ],
    suggestions: [
      "Add measurable impact (numbers, %)",
      "Include a professional summary",
      "Optimize resume for specific job keywords",
    ],
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#050816] via-[#0b102a] to-[#050816] text-white">

      {/* ===== HEADER ===== */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
      </div>

      {/* ===== SCORE HERO ===== */}
      <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">

        {/* ATS SCORE */}
        <div className="md:col-span-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-[0_0_60px_rgba(120,70,255,0.25)] flex flex-col items-center justify-center">
          <p className="text-gray-400 mb-2">ATS Score</p>
          <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-500">
            {analysis.atsScore}%
          </h1>
          <p className="mt-4 text-green-400 font-medium">
            Good Match for ATS
          </p>
        </div>

        {/* SUMMARY */}
        <div className="md:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">AI Summary</h2>
          <p className="text-gray-300 leading-relaxed">
            Your resume performs well with most Applicant Tracking Systems.
            It includes relevant technical skills and clear experience descriptions,
            but can be improved further by adding quantified achievements and better keyword optimization.
          </p>
        </div>
      </section>

      {/* ===== SKILLS ===== */}
      <section className="max-w-7xl mx-auto px-6 mt-12 grid md:grid-cols-2 gap-8">

        {/* MATCHED */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Matched Skills</h3>
          <div className="flex flex-wrap gap-3">
            {analysis.skillsMatched.map((skill) => (
              <span
                key={skill}
                className="px-4 py-1 rounded-full bg-green-500/20 text-green-300 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* MISSING */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Missing Skills</h3>
          <div className="flex flex-wrap gap-3">
            {analysis.skillsMissing.map((skill) => (
              <span
                key={skill}
                className="px-4 py-1 rounded-full bg-red-500/20 text-red-300 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STRENGTHS & WEAKNESSES ===== */}
      <section className="max-w-7xl mx-auto px-6 mt-12 grid md:grid-cols-2 gap-8">

        {/* STRENGTHS */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Strengths</h3>
          <ul className="space-y-3">
            {analysis.strengths.map((item) => (
              <li key={item} className="flex gap-3 text-green-300">
                <CheckCircle size={18} /> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* WEAKNESSES */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Weaknesses</h3>
          <ul className="space-y-3">
            {analysis.weaknesses.map((item) => (
              <li key={item} className="flex gap-3 text-red-300">
                <XCircle size={18} /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== AI SUGGESTIONS ===== */}
      <section className="max-w-7xl mx-auto px-6 mt-12 mb-20">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(120,70,255,0.2)]">
          <h3 className="text-2xl font-semibold mb-4">AI Recommendations</h3>
          <ul className="space-y-3 text-gray-300">
            {analysis.suggestions.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </section>

    </main>
  );
}
