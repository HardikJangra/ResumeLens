"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";

import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  Eye,
  Download,
  Menu,
  Home,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";

// Recharts imports
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";


interface Resume {
  id: string;
  fileName: string;
  uploadedAt: string;
  atsScore?: number;
  status: string;
  fileUrl: string;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch resumes
  useEffect(() => {
    async function loadResumes() {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        
        // ✅ FIX: Ensure data is always an array
        if (Array.isArray(data)) {
          setResumes(data);
        } else if (data && Array.isArray(data.resumes)) {
          setResumes(data.resumes);
        } else {
          console.error("API did not return an array:", data);
          setResumes([]);
        }
      } catch (err) {
        console.error("Error fetching resumes:", err);
        setResumes([]);
      }
      setLoading(false);
    }
    loadResumes();
  }, []);

  // === Derived stats & chart data ===
  const {
    totalResumes,
    avgAtsScore,
    lastScore,
    processedPercentage,
    atsTrendData,
    aiInsightText,
  } = useMemo(() => {
    const total = resumes.length;

    const scores = resumes
      .map((r) => r.atsScore)
      .filter((s): s is number => typeof s === "number");

    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const last = scores.length > 0 ? scores[scores.length - 1] : 0;

    const processedCount = resumes.filter(
      (r) => r.status.toLowerCase() === "ready" || r.status.toLowerCase() === "completed"
    ).length;

    const processedPct =
      total > 0 ? Math.round((processedCount / total) * 100) : 0;

    // ATS Trend data
    const sortedResumes = [...resumes].sort(
      (a, b) =>
        new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
    );

    const trendData =
      sortedResumes.length > 0
        ? sortedResumes.map((r, index) => ({
            name: `R${index + 1}`,
            score: r.atsScore ?? 0,
          }))
        : [
            { name: "R1", score: 40 },
            { name: "R2", score: 65 },
            { name: "R3", score: 80 },
          ];

    // Simple AI-ish insight
    let insight = "Upload a resume to get AI-powered insights on your ATS performance.";
    if (total > 0) {
      if (avg < 50) {
        insight =
          "Your average ATS score is quite low. Focus on adding more role-specific keywords and improving formatting.";
      } else if (avg < 75) {
        insight =
          "Your ATS scores are decent, but there is still room for optimization. Consider tailoring each resume to the job description.";
      } else {
        insight =
          "Your resumes are performing well! Keep refining skills and experience sections to maintain high ATS scores.";
      }
    }

    return {
      totalResumes: total,
      avgAtsScore: avg,
      lastScore: last,
      processedPercentage: processedPct,
      atsTrendData: trendData,
      aiInsightText: insight,
    };
  }, [resumes]);

  // Demo skill radar data
  const skillRadarData = [
    { skill: "Keywords", value: Math.max(avgAtsScore - 5, 20) || 60 },
    { skill: "Formatting", value: Math.max(avgAtsScore - 10, 25) || 55 },
    { skill: "Experience", value: Math.max(avgAtsScore - 2, 30) || 70 },
    { skill: "Skills", value: Math.max(avgAtsScore, 35) || 75 },
    { skill: "Clarity", value: Math.max(avgAtsScore - 8, 40) || 65 },
  ];

  // Demo keyword match data
  const keywordBarData = [
    { category: "Frontend", match: 72 },
    { category: "Backend", match: 64 },
    { category: "Data", match: 58 },
    { category: "DevOps", match: 45 },
  ];

  return (
    <main className="min-h-screen bg-[#050716] text-white flex">

      {/* ⭐ SIDEBAR ⭐ */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#0C1024] border-r border-[#1A1F36]
          shadow-[0_0_25px_rgba(80,0,255,0.3)] z-30
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
          md:translate-x-0
        `}
      >
        <div className="px-6 py-6 border-b border-[#1A1F36]">
          <h2 className="text-xl font-semibold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ResumeLens AI
          </h2>
        </div>

        <nav className="px-4 py-6 space-y-2 font-medium text-gray-300">

          <Link href="/dashboard">
            <div className="flex items-center gap-3 p-3 rounded-lg 
              hover:bg-[#1A1F36] hover:shadow-[0_0_15px_rgba(120,50,255,0.4)]
              transition cursor-pointer"
            >
              <Home size={20} /> Dashboard
            </div>
          </Link>

          <Link href="/history">
            <div className="flex items-center gap-3 p-3 rounded-lg 
              hover:bg-[#1A1F36] hover:shadow-[0_0_15px_rgba(120,50,255,0.4)]
              transition cursor-pointer"
            >
              <FileText size={20} /> Resume History
            </div>
          </Link>

          <Link href="/settings">
            <div className="flex items-center gap-3 p-3 rounded-lg 
              hover:bg-[#1A1F36] hover:shadow-[0_0_15px_rgba(120,50,255,0.4)]
              transition cursor-pointer"
            >
              <Settings size={20} /> Settings
            </div>
          </Link>

          <button className="flex items-center gap-3 p-3 rounded-lg 
            hover:bg-[#1A1F36] hover:shadow-[0_0_15px_rgba(120,50,255,0.4)]
            transition cursor-pointer"
          >
            <LogOut size={20} /> Log Out
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

      {/* ⭐ MAIN AREA ⭐ */}
      <div className="flex-1 md:ml-64">

        {/* TOP NAV */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-[#0D1128] border-b border-[#1A1F36] 
          shadow-[0_0_20px_rgba(120,50,255,0.3)] sticky top-0 z-10"
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-[#14172E] transition md:hidden"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-xl font-semibold">Dashboard</h1>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-9 h-9 rounded-full bg-linear-to-br from-purple-600 to-blue-600 
              flex items-center justify-center shadow-md hover:opacity-90 transition"
            >
              <span className="text-white font-semibold text-sm">U</span>
            </button>

            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-3 w-48 bg-[#0F142C] border border-[#1F2A48] 
                rounded-lg shadow-[0_0_25px_rgba(120,50,255,0.3)]
                py-2 z-50 animate-fade"
              >
                <Link href="/profile">
                  <div className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1A1F36] cursor-pointer transition">
                    My Profile
                  </div>
                </Link>

                <Link href="/settings">
                  <div className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1A1F36] cursor-pointer transition">
                    Settings
                  </div>
                </Link>

                <Link href="/history">
                  <div className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1A1F36] cursor-pointer transition">
                    Upload History
                  </div>
                </Link>

                <hr className="border-[#1F2A48] my-1" />

                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1A1F36] cursor-pointer transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

          {/* Title */}
          <div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Resume Analysis Center
            </h2>
            <p className="text-gray-400">
              Upload, analyze, and track the performance of your resumes with AI
            </p>
          </div>

          {/* ⭐ QUICK STATS ⭐ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#1A1F36] bg-[#0D1128] p-4 shadow-[0_0_20px_rgba(80,50,255,0.25)]">
              <p className="text-xs text-gray-400">Total Resumes</p>
              <p className="mt-2 text-2xl font-semibold">{totalResumes}</p>
            </div>
            <div className="rounded-xl border border-[#1A1F36] bg-[#0D1128] p-4">
              <p className="text-xs text-gray-400">Average ATS Score</p>
              <p className="mt-2 text-2xl font-semibold">{avgAtsScore || "--"}</p>
            </div>
            <div className="rounded-xl border border-[#1A1F36] bg-[#0D1128] p-4">
              <p className="text-xs text-gray-400">Last Resume Score</p>
              <p className="mt-2 text-2xl font-semibold">{lastScore || "--"}</p>
            </div>
            <div className="rounded-xl border border-[#1A1F36] bg-[#0D1128] p-4">
              <p className="text-xs text-gray-400">Processed</p>
              <p className="mt-2 text-2xl font-semibold">
                {processedPercentage}%
              </p>
            </div>
          </div>

          {/* ⭐ UPLOAD + AI INSIGHTS ROW ⭐ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Very small upload card */}
            <div className="rounded-lg p-3 border border-[#1F2A48] bg-[#0F142C] shadow-[0_0_15px_rgba(120,50,255,0.15)] flex items-center gap-3 w-full lg:col-span-2">
              <div className="text-purple-400">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-3-3m3 3l3-3m5-4a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-semibold">Upload Resume</h3>
                <p className="text-gray-400 text-xs -mt-1">
                  Upload a PDF to analyze ATS score and skills
                </p>
              </div>

              <div className="w-40">
              <UploadDropzone<OurFileRouter, "resumeUploader">
  endpoint="resumeUploader"
  onClientUploadComplete={() => {
    console.log("✅ Upload complete");
    window.location.reload(); // SIMPLE + RELIABLE
  }}
  onUploadError={(error) => {
    console.error("❌ Upload error:", error);
    alert("Upload failed");
  }}
  appearance={{
    container: "border-none p-0",
    button: "bg-indigo-600 text-white px-4 py-2 rounded-md text-sm",
  }}
/>
              </div>
            </div>

            {/* AI Insights */}
            <div className="rounded-lg p-4 border border-[#1A1F36] bg-[#0D1128] shadow-[0_0_20px_rgba(80,50,255,0.25)]">
              <h3 className="text-sm font-semibold mb-2">AI Insights</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {aiInsightText}
              </p>
            </div>
          </div>

          {/* ⭐ CHARTS GRID ⭐ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ATS Trend Area Chart */}
            <div className="rounded-xl border border-[#1A1F36] bg-[#0D1128] p-4 lg:col-span-2 shadow-[0_0_20px_rgba(80,50,255,0.25)]">
              <h3 className="text-sm font-semibold mb-3">ATS Score Trend</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={atsTrendData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        borderColor: "#1F2937",
                        borderRadius: 8,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skill Radar */}
            <div className="rounded-xl border border-[#1A1F36] bg-[#0D1128] p-4 shadow-[0_0_20px_rgba(80,50,255,0.25)]">
              <h3 className="text-sm font-semibold mb-3">Skill Match Radar</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillRadarData}>
                    <PolarGrid stroke="#1F2937" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "#E5E7EB", fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: "#6B7280", fontSize: 8 }} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#38BDF8"
                      fill="#8B5CF6"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ⭐ Keyword Match Bar Chart + Table ⭐ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Keyword Match Bar Chart */}
            <div className="rounded-xl border border-[#1A1F36] bg-[#0D1128] p-4 shadow-[0_0_20px_rgba(80,50,255,0.25)]">
              <h3 className="text-sm font-semibold mb-3">Keyword Match by Role</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={keywordBarData}>
                    <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                    <XAxis dataKey="category" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        borderColor: "#1F2937",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="match" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Resumes Table */}
            <div className="lg:col-span-2 bg-[#0D1128] border border-[#1A1F36] rounded-xl shadow-[0_0_30px_rgba(120,50,255,0.15)] p-6">
              <h3 className="text-xl font-semibold mb-6">Recent Resumes</h3>

              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs border-b border-[#1F2A48]">
                    <th className="pb-3">File Name</th>
                    <th className="pb-3">Uploaded</th>
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
                        No resumes found
                      </td>
                    </tr>
                  ) : (
                    resumes.map((res) => (
                      <tr
                        key={res.id}
                        className="border-b border-[#1A1F36] last:border-none text-xs"
                      >
                        <td className="py-3">{res.fileName}</td>
                        <td className="py-3 text-gray-400">
                          {new Date(res.uploadedAt).toISOString().split("T")[0]}
                        </td>

                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-purple-400">
                              {res.atsScore ?? "--"}
                            </span>
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-purple-500 to-blue-500"
                                style={{ width: `${res.atsScore || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3">
                          <span className="px-3 py-1 rounded-full text-[11px] bg-green-900/30 text-green-400 border border-green-700/40">
                            {res.status}
                          </span>
                        </td>

                        <td className="py-3 flex items-center justify-end gap-3">
                          <a
                            href={res.fileUrl}
                            target="_blank"
                            className="text-blue-400 hover:text-blue-300 transition"
                          >
                            <Eye size={18} />
                          </a>
                          <a
                            href={res.fileUrl}
                            download
                            className="text-purple-400 hover:text-purple-300 transition"
                          >
                            <Download size={18} />
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
      </div>
    </main>
  );
}

