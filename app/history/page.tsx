"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Download, Search } from "lucide-react";

interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  atsScore?: number | null;
  status: string;
}

export default function ResumeHistoryPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [filtered, setFiltered] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        setResumes(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResumes();
  }, []);

  useEffect(() => {
    let data = resumes;

    if (search) {
      data = data.filter(r =>
        r.fileName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      data = data.filter(r => r.status === statusFilter);
    }

    setFiltered(data);
  }, [search, statusFilter, resumes]);

  return (
    <main className="min-h-screen bg-linear-to-br from-[#050816] via-[#0b102a] to-[#050816] text-white">

      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/30 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/30 blur-[120px]" />

        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Resume History
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl">
            A complete timeline of all resumes analyzed by your AI engine.
          </p>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 pb-20">

        {/* ===== CONTROLS ===== */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 shadow-[0_0_40px_rgba(120,70,255,0.15)]">
          <div className="flex flex-col md:flex-row gap-4 items-center">

            {/* Search */}
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search resumes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border border-white/10 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 py-3 px-4 rounded-xl bg-black/30 border border-white/10 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            >
              <option value="all">All Status</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* ===== TABLE ===== */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden">

          {loading ? (
            <p className="p-6 text-gray-400">Loading AI results...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-gray-400">No resumes found.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-gray-400 text-sm">
                  <th className="px-6 py-4 text-left">Resume</th>
                  <th className="px-6 py-4 text-left">Uploaded</th>
                  <th className="px-6 py-4 text-left">ATS</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((res) => (
                  <tr
                    key={res.id}
                    className="border-t border-white/10 hover:bg-white/5 transition group"
                  >
                    <td className="px-6 py-4 font-medium">
                      {res.fileName}
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {new Date(res.uploadedAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold 
                        bg-linear-to-r from-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(120,70,255,0.6)]">
                        {res.atsScore ?? "--"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          res.status === "Completed"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 flex justify-end gap-4 opacity-70 group-hover:opacity-100 transition">
                      <Link href={res.fileUrl} target="_blank">
                        <Eye size={18} />
                      </Link>
                      <a href={res.fileUrl} download>
                        <Download size={18} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </main>
  );
}
