"use client";

import { useState } from "react";
import { Sparkles, CheckCircle, XCircle } from "lucide-react";

export default function JobMatchPage() {
  const [jobDesc, setJobDesc] = useState("");
  const [showResult, setShowResult] = useState(false);

  // Mock AI output (replace later with backend)
  const result = {
    matchScore: 76,
    matchedSkills: ["React", "Next.js", "TypeScript", "REST APIs"],
    missingSkills: ["Docker", "CI/CD", "Testing"],
    suggestions: [
      "Mention Docker experience if applicable",
      "Add CI/CD tools like GitHub Actions",
      "Include testing frameworks such as Jest",
    ],
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#050816] via-[#0b102a] to-[#050816] text-white px-6 py-20">

      {/* ===== HEADER ===== */}
      <div className="max-w-6xl mx-auto mb-14">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Job Description Match
        </h1>
        <p className="text-gray-400 mt-3 max-w-2xl">
          Compare your resume against a job description and see how well you match.
        </p>
      </div>

      {/* ===== INPUT ===== */}
      <div className="max-w-6xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(120,70,255,0.15)]">
        <label className="text-sm text-gray-400 mb-2 block">
          Paste Job Description
        </label>

        <textarea
          rows={8}
          placeholder="Paste the job description here..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 
            focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
        />

        <button
          onClick={() => setShowResult(true)}
          disabled={!jobDesc}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl 
            bg-linear-to-r from-indigo-500 to-purple-500 
            shadow-[0_0_20px_rgba(120,70,255,0.6)] hover:opacity-90 transition
            disabled:opacity-40"
        >
          <Sparkles size={18} />
          Analyze Match
        </button>
      </div>

      {/* ===== RESULT ===== */}
      {showResult && (
        <div className="max-w-6xl mx-auto mt-16 space-y-10">

          {/* MATCH SCORE */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-[0_0_60px_rgba(120,70,255,0.25)]">
            <p className="text-gray-400 mb-2">Resume Match Score</p>
            <h2 className="text-6xl font-extrabold bg-clip-text text-transparent 
              bg-linear-to-r from-indigo-400 to-purple-500">
              {result.matchScore}%
            </h2>
            <p className="mt-3 text-green-400 font-medium">
              Strong alignment with job requirements
            </p>
          </div>

          {/* SKILLS */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* MATCHED */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-400" />
                Matched Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {result.matchedSkills.map((skill) => (
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
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <XCircle className="text-red-400" />
                Missing Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {result.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-1 rounded-full bg-red-500/20 text-red-300 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SUGGESTIONS */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold mb-4">
              AI Recommendations
            </h3>
            <ul className="space-y-3 text-gray-300">
              {result.suggestions.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </main>
  );
}
