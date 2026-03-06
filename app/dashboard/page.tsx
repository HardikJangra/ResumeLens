"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import React from "react";
import {
  Trash2, Eye, Download, Menu, Home, FileText, Settings, LogOut,
  TrendingUp, ChevronRight, X, Upload, Sparkles, Target, Zap,
  AlertCircle, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight,
  BarChart3, RefreshCw, Shield, Award, Bell, Search, Plus
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import Link from "next/link";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";

interface Resume {
  id: string;
  fileName: string;
  uploadedAt: string;
  atsScore?: number;
  status: string;
  fileUrl: string;
}

// ─── Animated number counter ───────────────────────────────────────────────
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    const start = performance.now();
    const dur = 900;
    const step = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(ease * target));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return <>{current}{suffix}</>;
}

// ─── Score ring ─────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

// ─── Tip card data ───────────────────────────────────────────────────────────
const TIPS = [
  { icon: "🎯", title: "Tailor for each role", body: "Customizing your resume for each job description can boost your ATS score by up to 35%." },
  { icon: "📊", title: "Quantify achievements", body: "Resumes with numbers (e.g. 'increased revenue by 40%') get 3× more recruiter attention." },
  { icon: "🔑", title: "Mirror job keywords", body: "Use the exact keywords from the job posting — ATS systems do exact-match filtering." },
  { icon: "📐", title: "Keep it to one page", body: "For under 10 years of experience, one-page resumes perform significantly better." },
  { icon: "🚫", title: "Avoid tables & graphics", body: "Fancy formatting can confuse ATS parsers. Clean, single-column layouts score higher." },
  { icon: "⚡", title: "Action verbs first", body: "Start every bullet with a strong action verb: Led, Built, Grew, Reduced, Delivered." },
];

// ─── Checklist items ─────────────────────────────────────────────────────────
const CHECKLIST = [
  { label: "Contact info complete", key: "contact" },
  { label: "Professional summary included", key: "summary" },
  { label: "Skills section present", key: "skills" },
  { label: "Quantified achievements", key: "quant" },
  { label: "No spelling errors detected", key: "spelling" },
  { label: "ATS-friendly formatting", key: "format" },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "resumes" | "tips">("overview");
  const [tipIdx, setTipIdx] = useState(0);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [refreshing, setRefreshing] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchResumes = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      if (Array.isArray(data)) setResumes(data);
      else if (data?.resumes) setResumes(data.resumes);
      else setResumes([]);
    } catch { setResumes([]); }
    setLoading(false);
    if (showRefresh) setTimeout(() => setRefreshing(false), 600);
  };

  useEffect(() => { fetchResumes(); }, []);
  useEffect(() => {
    const iv = setInterval(() => fetchResumes(), 6000);
    return () => clearInterval(iv);
  }, []);

  // Rotate tips every 6s
  useEffect(() => {
    const iv = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 6000);
    return () => clearInterval(iv);
  }, []);

  async function deleteResume(id: string) {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) setResumes(prev => prev.filter(r => r.id !== id));
      else alert("Failed to delete resume");
    } catch { /* ignore */ }
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = resumes.length;
    const completed = resumes.filter(r =>
      ["ready", "completed"].includes(r.status.toLowerCase())
    );
    
    const scores = completed
      .map(r => r.atsScore)
      .filter((s): s is number => typeof s === "number");
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const best = scores.length > 0 ? Math.max(...scores) : 0;
    const sorted = [...completed].sort(
      (a, b) =>
        new Date(a.uploadedAt).getTime() -
        new Date(b.uploadedAt).getTime()
    );
    
    const last = sorted.at(-1)?.atsScore ?? 0;
    const prev = sorted.at(-2)?.atsScore ?? 0;
    
    const delta = last - prev;
    const passed = completed.filter(r => (r.atsScore ?? 0) >= 60).length;

const passRate =
  completed.length > 0
    ? Math.round((passed / completed.length) * 100)
    : 0;

    const trendSorted = [...resumes].sort(
      (a, b) =>
        new Date(a.uploadedAt).getTime() -
        new Date(b.uploadedAt).getTime()
    );
    const trendData = trendSorted.length > 0
      ? trendSorted.map((r, i) => ({ name: `#${i + 1}`, score: r.atsScore ?? 0, date: new Date(r.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }))
      : Array.from({ length: 5 }, (_, i) => ({ name: `#${i+1}`, score: [42,55,61,70,78][i], date: "" }));

    // Score distribution for pie
    const dist = [
      { name: "Excellent (80+)", value: scores.filter(s => s >= 80).length || 0, color: "#22C55E" },
      { name: "Good (60–79)",    value: scores.filter(s => s >= 60 && s < 80).length || 0, color: "#F59E0B" },
      { name: "Needs Work (<60)", value: scores.filter(s => s < 60).length || 0, color: "#EF4444" },
    ].filter(d => d.value > 0);

    let insight = "Upload your first resume to get AI-powered ATS insights and personalized improvement tips.";
    if (total > 0) {
      if (avg < 50) insight = `Your average score is ${avg}/100 — below the 60-point ATS threshold most companies use. Focus on adding role-specific keywords and cleaning up formatting.`;
      else if (avg < 75) insight = `You're averaging ${avg}/100. You're making it through some filters, but tailoring each resume to the specific job description could push you over 80.`;
      else insight = `Strong performance — ${avg}/100 average across ${total} resume${total > 1 ? "s" : ""}. Your top score is ${best}. Keep matching keywords to each role to stay competitive.`;
    }

    return { total, avg, best, last, prev, delta, passRate, trendData, dist, insight };
  }, [resumes]);

  const skillRadarData = [
    { skill: "Keywords",   value: Math.min(Math.max(stats.avg - 3,  10), 100) || 60 },
    { skill: "Formatting", value: Math.min(Math.max(stats.avg - 12, 10), 100) || 52 },
    { skill: "Experience", value: Math.min(Math.max(stats.avg - 2,  10), 100) || 68 },
    { skill: "Skills",     value: Math.min(Math.max(stats.avg + 4,  10), 100) || 74 },
    { skill: "Impact",     value: Math.min(Math.max(stats.avg - 7,  10), 100) || 62 },
    { skill: "Clarity",    value: Math.min(Math.max(stats.avg - 5,  10), 100) || 64 },
  ];

  const filteredResumes = useMemo(() => {
    let list = [...resumes];
    if (searchQuery) list = list.filter(r => r.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === "score") list.sort((a, b) => (b.atsScore ?? 0) - (a.atsScore ?? 0));
    else list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return list;
  }, [resumes, searchQuery, sortBy]);

  const scoreColor = (s: number) => s >= 80 ? "#22C55E" : s >= 60 ? "#F59E0B" : "#EF4444";
  const scoreLabel = (s: number) => s >= 80 ? { text: "Excellent", cls: "tag-green" } : s >= 60 ? { text: "Good", cls: "tag-amber" } : { text: "Low", cls: "tag-red" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#0A0A0F;
          --s1:#111118;
          --s2:#16161F;
          --s3:#1C1C28;
          --b1:rgba(255,255,255,0.06);
          --b2:rgba(255,255,255,0.11);
          --text:#F0F0F5;
          --muted:#6B6B80;
          --muted2:#9090A8;
          --accent:#6366F1;
          --accent2:#8B5CF6;
          --green:#22C55E;
          --amber:#F59E0B;
          --red:#EF4444;
          --sw:252px;
        }
        html,body{height:100%;scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        button,input{font-family:'DM Sans',sans-serif}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.18)}

        /* ── SHELL ── */
        .shell{display:flex;min-height:100vh}

        /* ── SIDEBAR ── */
        .sidebar{
          position:fixed;top:0;left:0;bottom:0;width:var(--sw);
          background:var(--s1);border-right:1px solid var(--b1);
          display:flex;flex-direction:column;z-index:200;
          transition:transform .28s cubic-bezier(.4,0,.2,1);
        }
        .sb-logo{
          display:flex;align-items:center;gap:10px;
          padding:18px 16px;border-bottom:1px solid var(--b1);min-height:60px;
        }
        .logo-mark{
          width:30px;height:30px;flex-shrink:0;border-radius:7px;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          display:flex;align-items:center;justify-content:center;font-size:14px;
          box-shadow:0 0 20px rgba(99,102,241,0.35);
        }
        .logo-name{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:.95rem;letter-spacing:-.02em}
        .sb-close{display:none;margin-left:auto;background:none;border:none;color:var(--muted);cursor:pointer;padding:4px;border-radius:4px;line-height:0}
        .sb-nav{padding:10px 10px;flex:1;overflow-y:auto}
        .sb-section{font-size:.58rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);padding:14px 10px 5px}
        .nb{
          display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;
          font-size:.875rem;color:var(--muted2);cursor:pointer;transition:all .15s;
          margin-bottom:1px;border:none;background:none;width:100%;text-align:left;
          position:relative;
        }
        .nb:hover{color:var(--text);background:rgba(255,255,255,0.05)}
        .nb.active{color:var(--text);background:rgba(99,102,241,0.12);font-weight:500}
        .nb.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:var(--accent);border-radius:0 2px 2px 0}
        .nb.active svg{color:var(--accent)}
        .nb-danger{color:var(--red)!important}
        .nb-danger:hover{background:rgba(239,68,68,0.08)!important;color:var(--red)!important}
        .sb-footer{padding:12px 10px;border-top:1px solid var(--b1)}
        .user-pill{
          display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;
          background:var(--s2);border:1px solid var(--b1);cursor:pointer;
          transition:border-color .2s;position:relative;
        }
        .user-pill:hover{border-color:var(--b2)}
        .av{
          width:32px;height:32px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          display:flex;align-items:center;justify-content:center;
          font-size:.75rem;font-weight:600;color:#fff;
        }
        .un{font-size:.82rem;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ue{font-size:.68rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px}
        .pm{
          position:absolute;bottom:calc(100% + 6px);left:0;right:0;
          background:var(--s2);border:1px solid var(--b2);border-radius:10px;padding:6px;
          box-shadow:0 -16px 40px rgba(0,0,0,0.5);z-index:300;
        }
        .pm-item{
          display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;
          font-size:.82rem;color:var(--muted2);cursor:pointer;transition:all .15s;
          border:none;background:none;width:100%;text-align:left;
        }
        .pm-item:hover{color:var(--text);background:rgba(255,255,255,0.05)}

        /* ── OVERLAY ── */
        .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:199;backdrop-filter:blur(3px)}

        /* ── MAIN ── */
        .main{flex:1;margin-left:var(--sw);min-height:100vh;display:flex;flex-direction:column}

        /* ── TOPBAR ── */
        .topbar{
          position:sticky;top:0;z-index:100;height:60px;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 24px;
          background:rgba(10,10,15,0.9);backdrop-filter:blur(20px);
          border-bottom:1px solid var(--b1);
        }
        .tb-l{display:flex;align-items:center;gap:14px}
        .tb-r{display:flex;align-items:center;gap:10px}
        .mob-btn{display:none;background:none;border:none;color:var(--muted2);cursor:pointer;padding:6px;border-radius:6px;transition:background .15s;align-items:center;justify-content:center}
        .mob-btn:hover{background:rgba(255,255,255,0.06)}
        .pg-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:1rem;letter-spacing:-.01em}
        .crumb{display:flex;align-items:center;gap:4px;font-size:.7rem;color:var(--muted);margin-top:1px}

        /* SEARCH */
        .search-wrap{position:relative;display:flex;align-items:center}
        .search-wrap svg{position:absolute;left:10px;color:var(--muted);pointer-events:none}
        .search-input{
          background:var(--s2);border:1px solid var(--b1);border-radius:8px;
          padding:7px 12px 7px 32px;font-size:.82rem;color:var(--text);
          width:200px;outline:none;transition:border-color .2s,width .2s;
        }
        .search-input::placeholder{color:var(--muted)}
        .search-input:focus{border-color:rgba(99,102,241,0.4);width:240px}

        /* ICON BTNS */
        .icon-btn{
          width:34px;height:34px;border-radius:8px;border:1px solid var(--b1);
          background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
          color:var(--muted2);transition:all .15s;position:relative;
        }
        .icon-btn:hover{background:rgba(255,255,255,0.06);border-color:var(--b2);color:var(--text)}
        .notif-dot{
          position:absolute;top:7px;right:7px;width:6px;height:6px;border-radius:50%;
          background:var(--red);border:1.5px solid var(--bg);
        }
        .tb-av{
          width:34px;height:34px;border-radius:50%;border:none;cursor:pointer;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          display:flex;align-items:center;justify-content:center;
          font-size:.75rem;font-weight:600;color:#fff;
          box-shadow:0 0 0 2px transparent;transition:box-shadow .2s;
        }
        .tb-av:hover{box-shadow:0 0 0 2px rgba(99,102,241,0.45)}

        /* ── TABS ── */
        .tabs{display:flex;align-items:center;gap:2px;padding:0 24px;border-bottom:1px solid var(--b1);background:var(--s1)}
        .tab{
          padding:13px 16px;font-size:.85rem;color:var(--muted2);cursor:pointer;
          border:none;background:none;transition:color .15s;position:relative;
          display:flex;align-items:center;gap:7px;
        }
        .tab:hover{color:var(--text)}
        .tab.active{color:var(--text);font-weight:500}
        .tab.active::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:var(--accent);border-radius:2px 2px 0 0}
        .tab-count{
          background:var(--s3);border:1px solid var(--b1);border-radius:100px;
          padding:1px 7px;font-size:.65rem;color:var(--muted2);
        }
        .tab.active .tab-count{background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.25);color:var(--accent)}

        /* ── PAGE BODY ── */
        .page{padding:24px;max-width:1280px;margin:0 auto;width:100%}

        /* ── WELCOME BANNER ── */
        .welcome-banner{
          background:linear-gradient(135deg,rgba(99,102,241,0.12) 0%,rgba(139,92,246,0.08) 50%,rgba(0,0,0,0) 100%);
          border:1px solid rgba(99,102,241,0.2);border-radius:14px;
          padding:24px 28px;margin-bottom:24px;
          display:flex;align-items:center;justify-content:space-between;
          position:relative;overflow:hidden;
        }
        .welcome-banner::before{
          content:'';position:absolute;top:-40px;right:-40px;
          width:200px;height:200px;border-radius:50%;
          background:radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%);
          pointer-events:none;
        }
        .wb-title{font-family:'Bricolage Grotesque',sans-serif;font-size:1.2rem;font-weight:700;letter-spacing:-.02em;margin-bottom:4px}
        .wb-sub{font-size:.85rem;color:var(--muted2);font-weight:300}
        .wb-actions{display:flex;gap:10px;flex-shrink:0}

        /* PRIMARY BTN */
        .btn-primary{
          display:inline-flex;align-items:center;gap:7px;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          color:#fff;border:none;border-radius:8px;
          padding:10px 20px;font-size:.875rem;font-weight:500;cursor:pointer;
          box-shadow:0 1px 2px rgba(0,0,0,0.4),0 0 0 1px rgba(99,102,241,0.4);
          transition:all .2s;
        }
        .btn-primary:hover{box-shadow:0 4px 20px rgba(99,102,241,0.45);transform:translateY(-1px)}
        .btn-ghost{
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(255,255,255,0.06);color:var(--muted2);
          border:1px solid var(--b2);border-radius:8px;
          padding:10px 20px;font-size:.875rem;font-weight:400;cursor:pointer;
          transition:all .2s;
        }
        .btn-ghost:hover{background:rgba(255,255,255,0.1);color:var(--text);border-color:rgba(255,255,255,0.2)}

        /* ── STAT CARDS ── */
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
        .stat-card{
          background:var(--s1);border:1px solid var(--b1);border-radius:12px;
          padding:18px 20px;transition:all .2s;position:relative;overflow:hidden;cursor:default;
        }
        .stat-card::after{
          content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,var(--accent),var(--accent2));
          opacity:0;transition:opacity .2s;border-radius:12px 12px 0 0;
        }
        .stat-card:hover{border-color:var(--b2);box-shadow:0 4px 20px rgba(0,0,0,0.3);transform:translateY(-1px)}
        .stat-card:hover::after{opacity:1}
        .sc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px}
        .sc-icon{
          width:38px;height:38px;border-radius:9px;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
        }
        .sc-badge{
          display:flex;align-items:center;gap:4px;font-size:.7rem;font-weight:500;
          padding:3px 8px;border-radius:100px;
        }
        .sc-lbl{font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:6px}
        .sc-val{font-family:'Bricolage Grotesque',sans-serif;font-size:2rem;font-weight:700;line-height:1;letter-spacing:-.03em}
        .sc-foot{font-size:.72rem;color:var(--muted2);margin-top:6px}

        /* ── 2-COL GRID ── */
        .g2{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px}
        .g2r{display:grid;grid-template-columns:1fr 2fr;gap:16px;margin-bottom:16px}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}

        /* ── CARD ── */
        .card{background:var(--s1);border:1px solid var(--b1);border-radius:12px;overflow:hidden;transition:border-color .2s}
        .card:hover{border-color:var(--b2)}
        .ch{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--b1)}
        .ct{font-family:'Bricolage Grotesque',sans-serif;font-size:.9rem;font-weight:600;letter-spacing:-.01em}
        .cs{font-size:.7rem;color:var(--muted);margin-top:2px}
        .cb{padding:20px}
        .cb-sm{padding:16px 20px}

        /* ── UPLOAD MODAL ── */
        .upload-modal-bg{
          position:fixed;inset:0;background:rgba(0,0,0,0.65);
          backdrop-filter:blur(6px);z-index:500;
          display:flex;align-items:center;justify-content:center;padding:20px;
        }
        .upload-modal{
          background:var(--s1);border:1px solid var(--b2);border-radius:16px;
          width:100%;max-width:520px;overflow:hidden;
          box-shadow:0 32px 80px rgba(0,0,0,0.6);
          animation:slideUp .25s cubic-bezier(.4,0,.2,1);
        }
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .um-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--b1)}
        .um-title{font-family:'Bricolage Grotesque',sans-serif;font-size:1rem;font-weight:600}
        .um-body{padding:28px 24px}
        .um-close{background:none;border:none;color:var(--muted2);cursor:pointer;padding:4px;border-radius:4px;line-height:0;transition:color .15s}
        .um-close:hover{color:var(--text)}

        /* ── INSIGHT STRIP ── */
        .insight-strip{
          background:linear-gradient(135deg,rgba(99,102,241,0.09),rgba(139,92,246,0.06));
          border:1px solid rgba(99,102,241,0.18);border-radius:12px;
          padding:18px 22px;display:flex;align-items:flex-start;gap:14px;
          margin-bottom:16px;
        }
        .insight-icon{
          width:38px;height:38px;border-radius:9px;flex-shrink:0;
          background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.25);
          display:flex;align-items:center;justify-content:center;
        }
        .ai-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent);animation:pulse 2s infinite;flex-shrink:0;margin-top:4px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        .insight-text{font-size:.875rem;color:var(--muted2);line-height:1.7;font-weight:300}

        /* ── TOP RESUME HIGHLIGHT ── */
        .best-card{
          background:linear-gradient(135deg,rgba(34,197,94,0.08),rgba(99,102,241,0.06));
          border:1px solid rgba(34,197,94,0.18);border-radius:12px;
          padding:20px;display:flex;align-items:center;gap:16px;
        }
        .best-score-wrap{display:flex;flex-direction:column;align-items:center;position:relative;flex-shrink:0}
        .best-score-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-top:4px}

        /* ── CHECKLIST ── */
        .checklist-item{
          display:flex;align-items:center;gap:10px;padding:9px 0;
          border-bottom:1px solid var(--b1);cursor:pointer;
          transition:background .1s;border-radius:4px;padding:9px 6px;
        }
        .checklist-item:last-child{border-bottom:none}
        .checklist-item:hover{background:rgba(255,255,255,0.025)}
        .cl-box{
          width:18px;height:18px;border-radius:4px;border:1px solid var(--b2);flex-shrink:0;
          display:flex;align-items:center;justify-content:center;transition:all .2s;
        }
        .cl-box.checked{background:var(--green);border-color:var(--green)}
        .cl-label{font-size:.85rem;color:var(--muted2);transition:color .2s;user-select:none}
        .cl-label.checked{color:var(--text);text-decoration:line-through;color:var(--muted)}

        /* ── TIP CARD ── */
        .tip-card{
          background:var(--s2);border:1px solid var(--b1);border-radius:10px;
          padding:16px;transition:all .3s;min-height:110px;
        }
        .tip-emoji{font-size:1.5rem;margin-bottom:8px;display:block}
        .tip-title{font-family:'Bricolage Grotesque',sans-serif;font-size:.85rem;font-weight:600;margin-bottom:6px}
        .tip-body{font-size:.78rem;color:var(--muted2);line-height:1.6;font-weight:300}
        .tip-dots{display:flex;gap:5px;margin-top:12px}
        .tip-dot{width:5px;height:5px;border-radius:50%;background:var(--b2);transition:background .3s}
        .tip-dot.active{background:var(--accent)}

        /* ── SCORE DISTRIBUTION ── */
        .dist-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--b1)}
        .dist-row:last-child{border-bottom:none}
        .dist-label{font-size:.8rem;color:var(--muted2);display:flex;align-items:center;gap:7px}
        .dist-dot{width:8px;height:8px;border-radius:50%}
        .dist-count{font-family:'Bricolage Grotesque',sans-serif;font-size:.9rem;font-weight:600}

        /* ── TABLE ── */
        .rtable{width:100%;border-collapse:collapse}
        .rtable th{font-size:.63rem;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);padding:0 8px 12px;border-bottom:1px solid var(--b1);text-align:left;white-space:nowrap}
        .rtable th:last-child{text-align:right}
        .rtable td{padding:11px 8px;border-bottom:1px solid var(--b1);vertical-align:middle;font-size:.85rem}
        .rtable tr:last-child td{border-bottom:none}
        .rtable tbody tr{transition:background .1s}
        .rtable tbody tr:hover td{background:rgba(255,255,255,0.02)}
        .fname{font-weight:500;color:var(--text);max-width:190px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
        .fdate{font-size:.75rem;color:var(--muted)}
        .sw{display:flex;align-items:center;gap:8px}
        .sn{font-size:.85rem;font-weight:600;min-width:26px}
        .bt{width:64px;height:4px;border-radius:2px;background:rgba(255,255,255,.07);overflow:hidden;flex-shrink:0}
        .bf{height:100%;border-radius:2px}
        .shimbar{height:4px;width:64px;border-radius:2px;background:rgba(255,255,255,.07);overflow:hidden;position:relative}
        .shimfill{position:absolute;inset:0;background:linear-gradient(90deg,var(--accent),var(--accent2));animation:shim 1.4s ease-in-out infinite}
        @keyframes shim{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .tag{padding:3px 9px;border-radius:100px;font-size:.68rem;font-weight:500;border:1px solid;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
        .tag-green{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.2);color:#4ADE80}
        .tag-amber{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.2);color:#FCD34D}
        .tag-red{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.2);color:#F87171}
        .tag-blue{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.25);color:#818CF8}
        .acts{display:flex;align-items:center;justify-content:flex-end;gap:5px}
        .abt{
          width:29px;height:29px;border-radius:6px;border:1px solid var(--b1);
          display:flex;align-items:center;justify-content:center;
          background:none;cursor:pointer;color:var(--muted2);transition:all .15s;
        }
        .abt:hover{background:var(--s2);border-color:var(--b2);color:var(--text)}
        .abt.del:hover{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.25);color:var(--red)}

        /* ── EMPTY STATE ── */
        .empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:52px 24px;text-align:center}
        .empty-emoji{font-size:2.8rem;margin-bottom:16px}
        .empty-t{font-family:'Bricolage Grotesque',sans-serif;font-size:1rem;font-weight:600;margin-bottom:6px}
        .empty-s{font-size:.85rem;color:var(--muted2);font-weight:300;max-width:260px;line-height:1.6}

        /* ── RESUMES TAB TOOLBAR ── */
        .toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
        .sort-btn{
          display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:7px;
          font-size:.8rem;color:var(--muted2);background:var(--s1);border:1px solid var(--b1);
          cursor:pointer;transition:all .15s;
        }
        .sort-btn:hover,.sort-btn.active{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.25);color:var(--accent)}

        /* ── TIPS TAB ── */
        .tips-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .tip-full{
          background:var(--s1);border:1px solid var(--b1);border-radius:12px;padding:22px;
          transition:all .2s;
        }
        .tip-full:hover{border-color:rgba(99,102,241,0.3);box-shadow:0 4px 20px rgba(0,0,0,0.3);transform:translateY(-2px)}
        .tip-full-icon{font-size:1.8rem;margin-bottom:14px;display:block}
        .tip-full-title{font-family:'Bricolage Grotesque',sans-serif;font-size:.95rem;font-weight:600;margin-bottom:8px}
        .tip-full-body{font-size:.85rem;color:var(--muted2);line-height:1.7;font-weight:300}

        /* ── SPIN ── */
        .spin{width:26px;height:26px;border-radius:50%;border:2px solid var(--accent);border-top-color:transparent;animation:rot .8s linear infinite;margin:0 auto 12px}
        @keyframes rot{to{transform:rotate(360deg)}}

        /* ── RESPONSIVE ── */
        @media(max-width:1024px){
          .g2,.g2r{grid-template-columns:1fr}
          .g3{grid-template-columns:1fr 1fr}
          .stats-grid{grid-template-columns:1fr 1fr}
        }
        @media(max-width:768px){
          .sidebar{transform:translateX(-100%)}
          .sidebar.open{transform:translateX(0)}
          .overlay.open{display:block}
          .main{margin-left:0!important}
          .mob-btn{display:flex!important}
          .sb-close{display:block}
          .stats-grid{grid-template-columns:1fr 1fr}
          .g3{grid-template-columns:1fr}
          .wb-actions{display:none}
          .search-wrap{display:none}
          .tips-grid{grid-template-columns:1fr 1fr}
        }
        @media(max-width:480px){
          .stats-grid{grid-template-columns:1fr}
          .tips-grid{grid-template-columns:1fr}
          .page{padding:14px}
        }
      `}</style>

      {/* ── UPLOAD MODAL ── */}
      {uploadOpen && (
        <div className="upload-modal-bg" onClick={() => setUploadOpen(false)}>
          <div className="upload-modal" onClick={e => e.stopPropagation()}>
            <div className="um-header">
              <div>
                <div className="um-title">Upload Resume</div>
                <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 2 }}>PDF format · Max 8MB</div>
              </div>
              <button className="um-close" onClick={() => setUploadOpen(false)}><X size={18} /></button>
            </div>
            <div className="um-body">
              <UploadDropzone<OurFileRouter, "resumeUploader">
                endpoint="resumeUploader"
                onClientUploadComplete={() => { setUploadOpen(false); fetchResumes(true); }}
                onUploadError={(err) => { console.error(err); alert("Upload failed — please try again"); }}
                appearance={{
                  container: "!border-dashed !border-[rgba(99,102,241,0.3)] !bg-[rgba(99,102,241,0.05)] !rounded-xl !py-10",
                  button: "!bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] !text-white !text-sm !font-medium !rounded-lg !px-6 !py-2.5 hover:!opacity-90 !transition !mt-4",
                  label: "!text-[var(--muted2)] !text-sm",
                  allowedContent: "!text-[var(--muted)] !text-xs",
                }}
              />
              <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["✓ Instant ATS scoring", "✓ Keyword analysis", "✓ Improvement tips"].map(t => (
                  <span key={t} style={{ fontSize: ".72rem", color: "var(--muted2)", background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: 100, padding: "3px 10px" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="shell">

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sb-logo">
            <div className="logo-mark">📄</div>
            <Link href="/" className="logo-name">ResumeLens</Link>
            <button className="sb-close" onClick={() => setSidebarOpen(false)}><X size={17} /></button>
          </div>

          <nav className="sb-nav">
            <div className="sb-section">Workspace</div>
            <button className={`nb${activeTab === "overview" ? " active" : ""}`} onClick={() => setActiveTab("overview")}>
              <Home size={15} /> Overview
            </button>
            <button className={`nb${activeTab === "resumes" ? " active" : ""}`} onClick={() => setActiveTab("resumes")}>
              <FileText size={15} /> My Resumes
              {stats.total > 0 && (
                <span style={{ marginLeft: "auto", background: "var(--s3)", border: "1px solid var(--b1)", borderRadius: 100, padding: "1px 7px", fontSize: ".62rem", color: "var(--muted2)" }}>
                  {stats.total}
                </span>
              )}
            </button>
            <button className={`nb${activeTab === "tips" ? " active" : ""}`} onClick={() => setActiveTab("tips")}>
              <Sparkles size={15} /> Resume Tips
            </button>

            <div className="sb-section">Account</div>
            <Link href="/settings"><button className="nb"><Settings size={15} /> Settings</button></Link>
            <button className="nb nb-danger" onClick={() => signOut({ redirectUrl: "/" })}><LogOut size={15} /> Log Out</button>
          </nav>

          <div className="sb-footer">
            {/* Upgrade nudge */}
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 9, padding: "12px 14px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <Award size={13} style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text)" }}>Upgrade to Pro</span>
              </div>
              <p style={{ fontSize: ".7rem", color: "var(--muted2)", lineHeight: 1.5, marginBottom: 8 }}>Unlock unlimited uploads, job match scoring &amp; cover letter AI.</p>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "8px 14px", fontSize: ".78rem" }}>View Plans →</button>
            </div>

            <div className="user-pill" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              <div className="av">{user?.firstName?.charAt(0) ?? "U"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="un">{user?.firstName ?? "User"}</div>
                <div className="ue">{user?.emailAddresses?.[0]?.emailAddress ?? ""}</div>
              </div>
              <ChevronRight size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
              {profileMenuOpen && (
                <div className="pm" onClick={e => e.stopPropagation()}>
                  <Link href="/profile"><button className="pm-item"><Settings size={13} /> My Profile</button></Link>
                  <Link href="/settings"><button className="pm-item"><Settings size={13} /> Settings</button></Link>
                  <hr style={{ border: "none", borderTop: "1px solid var(--b1)", margin: "4px 0" }} />
                  <button className="pm-item" style={{ color: "var(--red)" }} onClick={() => signOut({ redirectUrl: "/" })}><LogOut size={13} /> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className={`overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* ── MAIN ── */}
        <div className="main">

          {/* TOPBAR */}
          <header className="topbar">
            <div className="tb-l">
              <button className="mob-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
              <div>
                <div className="pg-title">
                  {activeTab === "overview" ? "Dashboard" : activeTab === "resumes" ? "My Resumes" : "Resume Tips"}
                </div>
                <div className="crumb">
                  ResumeLens <ChevronRight size={10} />
                  <span style={{ color: "var(--muted2)" }}>
                    {activeTab === "overview" ? "Overview" : activeTab === "resumes" ? "All Resumes" : "Improvement Tips"}
                  </span>
                </div>
              </div>
            </div>

            <div className="tb-r">
              {activeTab === "resumes" && (
                <div className="search-wrap">
                  <Search size={13} />
                  <input
                    className="search-input"
                    placeholder="Search resumes…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              <button className="icon-btn" title="Refresh" onClick={() => fetchResumes(true)}>
                <RefreshCw size={15} style={{ animation: refreshing ? "rot .8s linear infinite" : "none" }} />
              </button>
              <button className="icon-btn" title="Notifications">
                <Bell size={15} />
                <div className="notif-dot" />
              </button>
              <button className="tb-av">{user?.firstName?.charAt(0) ?? "U"}</button>
            </div>
          </header>

          {/* TABS */}
          <div className="tabs">
            {(["overview", "resumes", "tips"] as const).map(t => (
              <button key={t} className={`tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>
                {t === "overview" && <BarChart3 size={14} />}
                {t === "resumes" && <FileText size={14} />}
                {t === "tips" && <Sparkles size={14} />}
                {t === "overview" ? "Overview" : t === "resumes" ? "Resumes" : "Tips"}
                {t === "resumes" && stats.total > 0 && <span className="tab-count">{stats.total}</span>}
              </button>
            ))}
          </div>

          {/* ═══════════ OVERVIEW TAB ═══════════ */}
          {activeTab === "overview" && (
            <div className="page">

              {/* Welcome banner */}
              <div className="welcome-banner">
                <div>
                  <div className="wb-title">
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.firstName ?? "there"} 👋
                  </div>
                  <div className="wb-sub">
                    {stats.total === 0
                      ? "Upload your first resume to get AI-powered ATS insights."
                      : `You have ${stats.total} resume${stats.total > 1 ? "s" : ""} analyzed. Your best score is ${stats.best}/100.`}
                  </div>
                </div>
                <div className="wb-actions">
                  <button className="btn-ghost" onClick={() => setActiveTab("resumes")}><FileText size={15} /> View All</button>
                  <button className="btn-primary" onClick={() => setUploadOpen(true)}><Upload size={15} /> Upload Resume</button>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="stats-grid">
                {[
                  {
                    lbl: "Total Resumes", val: stats.total, suffix: "",
                    icon: <FileText size={17} />, ibg: "rgba(99,102,241,0.15)", ic: "var(--accent)",
                    badge: null, foot: stats.total > 0 ? "Across all uploads" : "Upload to get started",
                  },
                  {
                    lbl: "Avg. ATS Score", val: stats.avg, suffix: "",
                    icon: <Target size={17} />, ibg: "rgba(34,197,94,0.12)", ic: "var(--green)",
                    badge: stats.avg > 0 ? { text: stats.avg >= 75 ? "↑ Above avg" : "Below avg", color: stats.avg >= 75 ? "var(--green)" : "var(--amber)", bg: stats.avg >= 75 ? "rgba(34,197,94,.1)" : "rgba(245,158,11,.1)" } : null,
                    foot: stats.avg > 0 ? `Best: ${stats.best}/100` : "No data yet",
                  },
                  {
                    lbl: "Latest Score", val: stats.last, suffix: "",
                    icon: <TrendingUp size={17} />, ibg: "rgba(139,92,246,0.15)", ic: "var(--accent2)",
                    badge: stats.delta !== 0 && stats.last > 0 ? { text: `${stats.delta > 0 ? "+" : ""}${stats.delta} vs prev`, color: stats.delta > 0 ? "var(--green)" : "var(--red)", bg: stats.delta > 0 ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)" } : null,
                    foot: stats.last > 0 ? (stats.last >= 80 ? "Excellent — ready to apply!" : stats.last >= 60 ? "Good — some room to improve" : "Needs work — review tips") : "No uploads yet",
                  },
                  {
                    lbl: "Pass Rate", val: stats.passRate, suffix: "%",
                    icon: <Shield size={17} />, ibg: "rgba(245,158,11,0.12)", ic: "var(--amber)",
                    badge: null,
                    foot: `${resumes.filter(r => r.status === "Completed").length} of ${stats.total} completed`,
                  },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="sc-top">
                      <div className="sc-icon" style={{ background: s.ibg, color: s.ic }}>{s.icon}</div>
                      {s.badge && (
                        <div className="sc-badge" style={{ background: s.badge.bg, color: s.badge.color }}>
                          {s.badge.text}
                        </div>
                      )}
                    </div>
                    <div className="sc-lbl">{s.lbl}</div>
                    <div className="sc-val">
                      <AnimatedNumber target={s.val} suffix={s.suffix} />
                    </div>
                    <div className="sc-foot">{s.foot}</div>
                  </div>
                ))}
              </div>

              {/* AI Insight strip */}
              <div className="insight-strip">
                <div className="insight-icon"><Sparkles size={17} style={{ color: "var(--accent)" }} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <div className="ai-dot" />
                    <span style={{ fontSize: ".65rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent)" }}>AI Analysis</span>
                  </div>
                  <p className="insight-text">{stats.insight}</p>
                </div>
                <button className="btn-ghost" style={{ flexShrink: 0 }} onClick={() => setActiveTab("tips")}><Zap size={13} /> View Tips</button>
              </div>

              {/* Best resume + skill radar */}
              <div className="g2">
                {/* ATS Trend chart */}
                <div className="card">
                  <div className="ch">
                    <div>
                      <div className="ct">ATS Score Trend</div>
                      <div className="cs">Performance across all uploads</div>
                    </div>
                    <span className="tag tag-blue" style={{ fontSize: ".65rem" }}>
                      {stats.trendData.length} upload{stats.trendData.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="cb" style={{ paddingTop: 8 }}>
                    <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trendData}>
                          <defs>
                            <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="4 4" />
                          <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} stroke="var(--muted)" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: "var(--s2)", border: "1px solid var(--b2)", borderRadius: 8, fontSize: 12, color: "var(--text)" }}
                            cursor={{ stroke: "rgba(99,102,241,.3)" }}
                            formatter={(v: number) => [`${v}/100`, "ATS Score"]}
                          />
                          <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} fill="url(#ga)" dot={{ fill: "#6366F1", r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#6366F1" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Skill radar */}
                <div className="card">
                  <div className="ch">
                    <div>
                      <div className="ct">Skill Coverage</div>
                      <div className="cs">Based on your resume data</div>
                    </div>
                  </div>
                  <div className="cb" style={{ paddingTop: 8 }}>
                    <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={skillRadarData}>
                          <PolarGrid stroke="rgba(255,255,255,.06)" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--muted2)", fontSize: 10 }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} strokeWidth={2} dot={{ fill: "#6366F1", r: 3, strokeWidth: 0 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score dist + checklist + tip */}
              <div className="g3">
                {/* Score distribution */}
                <div className="card">
                  <div className="ch"><div className="ct">Score Distribution</div></div>
                  <div className="cb">
                    {stats.dist.length > 0 ? (
                      <>
                        <div style={{ height: 120, marginBottom: 12 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={stats.dist} cx="50%" cy="50%" innerRadius={34} outerRadius={52} dataKey="value" paddingAngle={3} strokeWidth={0}>
                                {stats.dist.map((d, i) => <Cell key={i} fill={d.color} />)}
                              </Pie>
                              <Tooltip contentStyle={{ background: "var(--s2)", border: "1px solid var(--b2)", borderRadius: 8, fontSize: 11 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        {[{ label: "Excellent (80+)", color: "#22C55E" }, { label: "Good (60–79)", color: "#F59E0B" }, { label: "Needs Work (<60)", color: "#EF4444" }].map(row => {
                          const d = stats.dist.find(x => x.color === row.color);
                          return (
                            <div key={row.label} className="dist-row">
                              <div className="dist-label"><div className="dist-dot" style={{ background: row.color }} />{row.label}</div>
                              <div className="dist-count" style={{ color: row.color }}>{d?.value ?? 0}</div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className="empty" style={{ padding: "28px 12px" }}>
                        <div className="empty-emoji">📊</div>
                        <div className="empty-s">Upload resumes to see your score breakdown</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume checklist */}
                <div className="card">
                  <div className="ch">
                    <div>
                      <div className="ct">Resume Checklist</div>
                      <div className="cs">{Object.values(checklist).filter(Boolean).length}/{CHECKLIST.length} completed</div>
                    </div>
                    <span style={{ fontSize: ".72rem", color: "var(--accent)" }}>
                      {Math.round((Object.values(checklist).filter(Boolean).length / CHECKLIST.length) * 100)}%
                    </span>
                  </div>
                  <div className="cb">
                    {/* Progress bar */}
                    <div style={{ height: 4, background: "rgba(255,255,255,.07)", borderRadius: 2, marginBottom: 14, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        background: "linear-gradient(90deg,var(--accent),var(--accent2))",
                        width: `${(Object.values(checklist).filter(Boolean).length / CHECKLIST.length) * 100}%`,
                        transition: "width .4s ease",
                      }} />
                    </div>
                    {CHECKLIST.map(item => (
                      <div key={item.key} className="checklist-item"
                        onClick={() => setChecklist(p => ({ ...p, [item.key]: !p[item.key] }))}>
                        <div className={`cl-box${checklist[item.key] ? " checked" : ""}`}>
                          {checklist[item.key] && <CheckCircle2 size={12} color="#fff" />}
                        </div>
                        <span className={`cl-label${checklist[item.key] ? " checked" : ""}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rotating tip */}
                <div className="card">
                  <div className="ch">
                    <div>
                      <div className="ct">Pro Tips</div>
                      <div className="cs">Rotate every 6 seconds</div>
                    </div>
                    <Sparkles size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="cb">
                    <div className="tip-card">
                      <span className="tip-emoji">{TIPS[tipIdx].icon}</span>
                      <div className="tip-title">{TIPS[tipIdx].title}</div>
                      <p className="tip-body">{TIPS[tipIdx].body}</p>
                    </div>
                    <div className="tip-dots">
                      {TIPS.map((_, i) => <div key={i} className={`tip-dot${i === tipIdx ? " active" : ""}`} />)}
                    </div>
                    <button className="btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 12, fontSize: ".8rem" }} onClick={() => setActiveTab("tips")}>
                      View all tips <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Keyword bar + recent resumes */}
              <div className="g2r">
                {/* Keyword chart */}
                <div className="card">
                  <div className="ch">
                    <div>
                      <div className="ct">Keyword Match by Role</div>
                      <div className="cs">How well your resume matches common roles</div>
                    </div>
                  </div>
                  <div className="cb" style={{ paddingTop: 8 }}>
                    <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{ category: "Frontend", match: 72 }, { category: "Backend", match: 64 }, { category: "Data", match: 58 }, { category: "DevOps", match: 45 }, { category: "PM", match: 38 }]} barSize={20}>
                          <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="4 4" />
                          <XAxis dataKey="category" stroke="var(--muted)" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} stroke="var(--muted)" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "var(--s2)", border: "1px solid var(--b2)", borderRadius: 8, fontSize: 12, color: "var(--text)" }} formatter={(v: number) => [`${v}%`, "Match"]} />
                          <Bar dataKey="match" radius={[4, 4, 0, 0]}>
                            {[72, 64, 58, 45, 38].map((v, i) => <Cell key={i} fill={v >= 70 ? "#6366F1" : v >= 55 ? "#8B5CF6" : "#4B4E6D"} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent resumes (mini table) */}
                <div className="card">
                  <div className="ch">
                    <div>
                      <div className="ct">Recent Uploads</div>
                      <div className="cs">Latest {Math.min(resumes.length, 4)} of {stats.total}</div>
                    </div>
                    <button className="sort-btn" onClick={() => setActiveTab("resumes")}>
                      View all <ChevronRight size={12} />
                    </button>
                  </div>
                  <div style={{ padding: "0 20px 8px" }}>
                    {loading ? (
                      <div className="empty" style={{ padding: "28px 0" }}><div className="spin" /><span style={{ fontSize: ".82rem", color: "var(--muted2)" }}>Loading…</span></div>
                    ) : resumes.length === 0 ? (
                      <div className="empty" style={{ padding: "28px 0" }}>
                        <div className="empty-emoji">📂</div>
                        <div className="empty-t">No resumes yet</div>
                        <button className="btn-primary" style={{ marginTop: 12, fontSize: ".8rem" }} onClick={() => setUploadOpen(true)}><Plus size={13} /> Upload First</button>
                      </div>
                    ) : (
                      [...resumes].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(0, 4).map(res => (
                        <div key={res.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--b1)" }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--s3)", border: "1px solid var(--b1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📄</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: ".82rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{res.fileName}</div>
                            <div style={{ fontSize: ".7rem", color: "var(--muted)", marginTop: 2 }}>{new Date(res.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                          </div>
                          {res.status === "Processing" ? (
                            <span className="tag tag-amber"><Clock size={9} /> Analyzing</span>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                              <ScoreRing score={res.atsScore ?? 0} size={34} />
                              <span style={{ fontSize: ".82rem", fontWeight: 600, color: scoreColor(res.atsScore ?? 0) }}>{res.atsScore ?? "--"}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ═══════════ RESUMES TAB ═══════════ */}
          {activeTab === "resumes" && (
            <div className="page">
              <div className="toolbar">
                <button className="btn-primary" onClick={() => setUploadOpen(true)}><Upload size={14} /> Upload Resume</button>
                <div style={{ flex: 1 }} />
                <div className="search-wrap" style={{ display: "flex" }}>
                  <Search size={13} />
                  <input className="search-input" placeholder="Search by filename…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className={`sort-btn${sortBy === "date" ? " active" : ""}`} onClick={() => setSortBy("date")}><Clock size={12} /> Newest</button>
                  <button className={`sort-btn${sortBy === "score" ? " active" : ""}`} onClick={() => setSortBy("score")}><Target size={12} /> By Score</button>
                </div>
              </div>

              {loading ? (
                <div className="card"><div className="empty"><div className="spin" /><span style={{ fontSize: ".85rem", color: "var(--muted2)" }}>Loading resumes…</span></div></div>
              ) : filteredResumes.length === 0 ? (
                <div className="card">
                  <div className="empty">
                    <div className="empty-emoji">{searchQuery ? "🔍" : "📂"}</div>
                    <div className="empty-t">{searchQuery ? "No results found" : "No resumes yet"}</div>
                    <div className="empty-s">{searchQuery ? `No resumes match "${searchQuery}"` : "Upload your first resume to get started with AI analysis"}</div>
                    {!searchQuery && <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setUploadOpen(true)}><Plus size={14} /> Upload Resume</button>}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div style={{ overflowX: "auto" }}>
                    <table className="rtable">
                      <thead>
                        <tr>
                          <th style={{ paddingLeft: 20 }}>Resume</th>
                          <th>Uploaded</th>
                          <th>ATS Score</th>
                          <th>Grade</th>
                          <th>Status</th>
                          <th style={{ paddingRight: 20 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResumes.map(res => {
                          const { text: stText, cls: stCls } = ["ready","completed"].includes(res.status.toLowerCase())
                            ? { text: "Completed", cls: "tag-green" }
                            : res.status === "Processing"
                            ? { text: "Analyzing", cls: "tag-amber" }
                            : { text: res.status, cls: "tag-blue" };
                          const grade = (res.atsScore ?? 0) >= 80 ? scoreLabel(res.atsScore ?? 0) : res.atsScore ? scoreLabel(res.atsScore) : null;
                          return (
                            <tr key={res.id}>
                              <td style={{ paddingLeft: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ width: 34, height: 34, borderRadius: 7, background: "var(--s3)", border: "1px solid var(--b1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📄</div>
                                  <span className="fname">{res.fileName}</span>
                                </div>
                              </td>
                              <td>
                                <div className="fdate">{new Date(res.uploadedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</div>
                              </td>
                              <td>
                                {res.status === "Processing" ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div className="shimbar"><div className="shimfill" /></div>
                                    <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>Running…</span>
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <ScoreRing score={res.atsScore ?? 0} size={30} />
                                    <div className="sw">
                                      <span className="sn" style={{ color: scoreColor(res.atsScore ?? 0) }}>{res.atsScore ?? "--"}</span>
                                      <div className="bt"><div className="bf" style={{ width: `${res.atsScore ?? 0}%`, background: scoreColor(res.atsScore ?? 0) }} /></div>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td>
                                {grade && res.status !== "Processing" && (
                                  <span className={`tag ${grade.cls}`}>{grade.text}</span>
                                )}
                              </td>
                              <td>
                                <span className={`tag ${stCls}`}>
                                  {stCls === "tag-green" && <CheckCircle2 size={9} />}
                                  {stCls === "tag-amber" && <Clock size={9} />}
                                  {stCls === "tag-red" && <AlertCircle size={9} />}
                                  {stText}
                                </span>
                              </td>
                              <td style={{ paddingRight: 20 }}>
                                <div className="acts">
                                  <Link href={`/dashboard/resume/${res.id}`}>
                                    <button className="abt" title="View insights"><Eye size={13} /></button>
                                  </Link>
                                  <a href={res.fileUrl} download>
                                    <button className="abt" title="Download PDF"><Download size={13} /></button>
                                  </a>
                                  <button className="abt del" title="Delete" onClick={() => deleteResume(res.id)}><Trash2 size={13} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TIPS TAB ═══════════ */}
          {activeTab === "tips" && (
            <div className="page">
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-.02em", marginBottom: 6 }}>Resume Improvement Tips</div>
                <p style={{ fontSize: ".9rem", color: "var(--muted2)", fontWeight: 300 }}>Expert strategies to maximize your ATS score and get more callbacks.</p>
              </div>

              <div className="tips-grid">
                {TIPS.map((tip, i) => (
                  <div key={i} className="tip-full">
                    <span className="tip-full-icon">{tip.icon}</span>
                    <div className="tip-full-title">{tip.title}</div>
                    <p className="tip-full-body">{tip.body}</p>
                  </div>
                ))}
              </div>

              {/* ATS myth busters */}
              <div style={{ marginTop: 24 }}>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: "1.1rem", fontWeight: 600, marginBottom: 16, letterSpacing: "-.01em" }}>Common ATS Myths</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    { myth: "Adding a photo helps your resume stand out", fact: "Most ATS systems ignore or reject images entirely." },
                    { myth: "Longer resumes show more experience", fact: "Recruiters spend ~7 seconds per resume. 1–2 pages is optimal." },
                    { myth: "Creative formatting impresses hiring managers", fact: "Unusual layouts break ATS parsing. Stick to clean columns." },
                    { myth: "Using synonyms avoids keyword stuffing", fact: "ATS uses exact matching. Use the exact words from the job posting." },
                  ].map((item, i) => (
                    <div key={i} className="card">
                      <div className="cb">
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <X size={11} style={{ color: "var(--red)" }} />
                          </div>
                          <p style={{ fontSize: ".82rem", color: "var(--muted2)", lineHeight: 1.5, fontStyle: "italic" }}>&ldquo;{item.myth}&rdquo;</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <CheckCircle2 size={11} style={{ color: "var(--green)" }} />
                          </div>
                          <p style={{ fontSize: ".82rem", color: "var(--muted2)", lineHeight: 1.5 }}>{item.fact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ marginTop: 24, background: "linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.07))", border: "1px solid rgba(99,102,241,.2)", borderRadius: 14, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>Ready to apply these tips?</div>
                  <p style={{ fontSize: ".875rem", color: "var(--muted2)", fontWeight: 300 }}>Upload your resume now and see exactly where you stand.</p>
                </div>
                <button className="btn-primary" style={{ flexShrink: 0 }} onClick={() => { setActiveTab("resumes"); setUploadOpen(true); }}>
                  <Upload size={15} /> Upload & Analyze
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}