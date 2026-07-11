"use client";

import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Award,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Home,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(23,32,28,0.08)" strokeWidth={6} />
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
  { icon: "01", title: "Tailor for each role", body: "Adjust the summary, skills, and recent bullets to match the job description before you apply." },
  { icon: "02", title: "Quantify achievements", body: "Numbers make impact easier to scan. Add scope, volume, revenue, time saved, or reliability gains." },
  { icon: "03", title: "Mirror job keywords", body: "Use the same role language from the posting when it honestly matches your experience." },
  { icon: "04", title: "Keep the structure plain", body: "Clear sections, consistent headings, and simple ordering help both scanners and recruiters." },
  { icon: "05", title: "Avoid dense formatting", body: "Tables, heavy graphics, and multi-column layouts can hide important experience from parsers." },
  { icon: "06", title: "Lead with action", body: "Start bullets with concrete verbs: Led, Built, Grew, Reduced, Delivered, Automated." },
];

const isCompleteStatus = (status: string) =>
  ["ready", "completed"].includes(status.toLowerCase());

const isProcessingStatus = (status: string) =>
  status.toLowerCase() === "processing";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "resumes" | "tips">("overview");
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

  async function deleteResume(id: string) {
    if (!confirm("Delete this resume? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) setResumes(prev => prev.filter(r => r.id !== id));
      else alert("Failed to delete resume");
    } catch (error) {
      console.error("Failed to delete resume:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = resumes.length;
    const completed = resumes.filter(r => isCompleteStatus(r.status));
    const completedCount = completed.length;
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
    const previousScore = sorted.at(-2)?.atsScore ?? 0;
    const delta = last - previousScore;
    const passedCount = completed.filter(r => (r.atsScore ?? 0) >= 60).length;
    const passRate = completedCount > 0
      ? Math.round((passedCount / completedCount) * 100)
      : 0;

    const trendSorted = [...resumes].sort(
      (a, b) =>
        new Date(a.uploadedAt).getTime() -
        new Date(b.uploadedAt).getTime()
    );
    const trendData = trendSorted.length > 0
      ? trendSorted.map((r, i) => ({ name: `#${i + 1}`, score: r.atsScore ?? 0, date: new Date(r.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }))
      : Array.from({ length: 5 }, (_, i) => ({ name: `#${i+1}`, score: [42,55,61,70,78][i], date: "" }));

    let insight = "Upload your first resume to get ATS insights and prioritized improvement tips.";
    if (total > 0) {
      if (avg < 50) insight = `Your average score is ${avg}/100 — below the 60-point ATS threshold most companies use. Focus on adding role-specific keywords and cleaning up formatting.`;
      else if (avg < 75) insight = `You're averaging ${avg}/100. You're making it through some filters, but tailoring each resume to the specific job description could push you over 80.`;
      else insight = `Strong performance — ${avg}/100 average across ${total} resume${total > 1 ? "s" : ""}. Your top score is ${best}. Keep matching keywords to each role to stay competitive.`;
    }

    return { total, completedCount, avg, best, last, delta, passRate, trendData, insight };
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

  const recentResumes = useMemo(
    () => [...resumes]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 4),
    [resumes]
  );

  const scoreColor = (s: number) => s >= 80 ? "#22C55E" : s >= 60 ? "#F59E0B" : "#EF4444";
  const scoreLabel = (s: number) => s >= 80 ? { text: "Excellent", cls: "tag-green" } : s >= 60 ? { text: "Good", cls: "tag-amber" } : { text: "Low", cls: "tag-red" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#F6F1E8;
          --s1:#FFFBF2;
          --s2:#F1E8DA;
          --s3:#E7D9C6;
          --b1:rgba(45,40,32,0.10);
          --b2:rgba(45,40,32,0.18);
          --text:#17201C;
          --muted:#81786B;
          --muted2:#5F675F;
          --accent:#0F766E;
          --accent2:#B86B4B;
          --green:#16704F;
          --amber:#A46118;
          --red:#A33B32;
          --sw:252px;
        }
        html,body{height:100%;scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:'Instrument Sans',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        button,input{font-family:'Instrument Sans',sans-serif}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(23,32,28,0.14);border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(23,32,28,0.22)}

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
          background:var(--text);
          display:flex;align-items:center;justify-content:center;font-size:.66rem;
          box-shadow:none;color:var(--s1);font-weight:700;
        }
        .logo-name{font-family:'Instrument Sans',sans-serif;font-weight:700;font-size:.95rem;letter-spacing:0}
        .sb-close{display:none;margin-left:auto;background:none;border:none;color:var(--muted);cursor:pointer;padding:4px;border-radius:4px;line-height:0}
        .sb-nav{padding:10px 10px;flex:1;overflow-y:auto}
        .sb-section{font-size:.58rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);padding:14px 10px 5px}
        .nb{
          display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;
          font-size:.875rem;color:var(--muted2);cursor:pointer;transition:all .15s;
          margin-bottom:1px;border:none;background:none;width:100%;text-align:left;
          position:relative;
        }
        .nb:hover{color:var(--text);background:rgba(23,32,28,0.05)}
        .nb.active{color:var(--text);background:rgba(15,118,110,0.10);font-weight:600}
        .nb.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:var(--accent);border-radius:0 2px 2px 0}
        .nb.active svg{color:var(--accent)}
        .nb-danger{color:var(--red)!important}
        .nb-danger:hover{background:rgba(163,59,50,0.08)!important;color:var(--red)!important}
        .sb-footer{padding:12px 10px;border-top:1px solid var(--b1)}
        .user-pill{
          display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;
          background:var(--s2);border:1px solid var(--b1);cursor:pointer;
          transition:border-color .2s;position:relative;
        }
        .user-pill:hover{border-color:var(--b2)}
        .av{
          width:32px;height:32px;border-radius:50%;flex-shrink:0;
          background:var(--accent);
          display:flex;align-items:center;justify-content:center;
          font-size:.75rem;font-weight:600;color:#fff;
        }
        .un{font-size:.82rem;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ue{font-size:.68rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px}
        .pm{
          position:absolute;bottom:calc(100% + 6px);left:0;right:0;
          background:var(--s2);border:1px solid var(--b2);border-radius:10px;padding:6px;
          box-shadow:0 -16px 40px rgba(45,40,32,0.16);z-index:300;
        }
        .pm-item{
          display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;
          font-size:.82rem;color:var(--muted2);cursor:pointer;transition:all .15s;
          border:none;background:none;width:100%;text-align:left;
        }
        .pm-item:hover{color:var(--text);background:rgba(23,32,28,0.05)}

        /* ── OVERLAY ── */
        .overlay{display:none;position:fixed;inset:0;background:rgba(23,32,28,0.45);z-index:199;backdrop-filter:blur(3px)}

        /* ── MAIN ── */
        .main{flex:1;margin-left:var(--sw);min-height:100vh;display:flex;flex-direction:column}

        /* ── TOPBAR ── */
        .topbar{
          position:sticky;top:0;z-index:100;height:60px;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 24px;
          background:rgba(246,241,232,0.88);backdrop-filter:blur(20px);
          border-bottom:1px solid var(--b1);
        }
        .tb-l{display:flex;align-items:center;gap:14px}
        .tb-r{display:flex;align-items:center;gap:10px}
        .mob-btn{display:none;background:none;border:none;color:var(--muted2);cursor:pointer;padding:6px;border-radius:6px;transition:background .15s;align-items:center;justify-content:center}
        .mob-btn:hover{background:rgba(23,32,28,0.06)}
        .pg-title{font-family:'Instrument Sans',sans-serif;font-weight:700;font-size:1rem;letter-spacing:0}
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
        .search-input:focus{border-color:rgba(15,118,110,0.36);width:240px}

        /* ICON BTNS */
        .icon-btn{
          width:34px;height:34px;border-radius:8px;border:1px solid var(--b1);
          background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
          color:var(--muted2);transition:all .15s;position:relative;
        }
        .icon-btn:hover{background:rgba(23,32,28,0.06);border-color:var(--b2);color:var(--text)}
        .notif-dot{
          position:absolute;top:7px;right:7px;width:6px;height:6px;border-radius:50%;
          background:var(--red);border:1.5px solid var(--bg);
        }
        .tb-av{
          width:34px;height:34px;border-radius:50%;border:none;cursor:pointer;
          background:var(--accent);
          display:flex;align-items:center;justify-content:center;
          font-size:.75rem;font-weight:600;color:#fff;
          box-shadow:0 0 0 2px transparent;transition:box-shadow .2s;
        }
        .tb-av:hover{box-shadow:0 0 0 2px rgba(15,118,110,0.32)}

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
        .tab.active .tab-count{background:rgba(15,118,110,0.12);border-color:rgba(15,118,110,0.22);color:var(--accent)}

        /* ── PAGE BODY ── */
        .page{padding:24px;max-width:1280px;margin:0 auto;width:100%}

        /* ── WELCOME BANNER ── */
        .welcome-banner{
          background:linear-gradient(135deg,rgba(15,118,110,0.10) 0%,rgba(184,107,75,0.08) 100%);
          border:1px solid rgba(45,40,32,0.12);border-radius:8px;
          padding:24px 28px;margin-bottom:24px;
          display:flex;align-items:center;justify-content:space-between;
          position:relative;overflow:hidden;
        }
        .welcome-banner::before{
          content:'';position:absolute;top:-40px;right:-40px;
          width:200px;height:200px;border-radius:50%;
          background:radial-gradient(circle,rgba(15,118,110,0.12) 0%,transparent 70%);
          pointer-events:none;
        }
        .wb-title{font-family:'Source Serif 4',serif;font-size:1.25rem;font-weight:700;letter-spacing:0;margin-bottom:4px}
        .wb-sub{font-size:.85rem;color:var(--muted2);font-weight:300}
        .wb-actions{display:flex;gap:10px;flex-shrink:0}

        /* PRIMARY BTN */
        .btn-primary{
          display:inline-flex;align-items:center;gap:7px;
          background:var(--accent);
          color:#fff;border:none;border-radius:8px;
          padding:10px 20px;font-size:.875rem;font-weight:500;cursor:pointer;
          box-shadow:0 1px 2px rgba(45,40,32,0.14);
          transition:all .2s;
        }
        .btn-primary:hover{box-shadow:0 8px 24px rgba(15,118,110,0.20);transform:translateY(-1px)}
        .btn-ghost{
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(23,32,28,0.04);color:var(--muted2);
          border:1px solid var(--b2);border-radius:8px;
          padding:10px 20px;font-size:.875rem;font-weight:400;cursor:pointer;
          transition:all .2s;
        }
        .btn-ghost:hover{background:rgba(23,32,28,0.07);color:var(--text);border-color:rgba(45,40,32,0.22)}

        /* ── STAT CARDS ── */
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
        .stat-card{
          background:var(--s1);border:1px solid var(--b1);border-radius:8px;
          padding:18px 20px;transition:all .2s;position:relative;overflow:hidden;cursor:default;
        }
        .stat-card::after{
          content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,var(--accent),var(--accent2));
          opacity:0;transition:opacity .2s;border-radius:12px 12px 0 0;
        }
        .stat-card:hover{border-color:var(--b2);box-shadow:0 10px 26px rgba(45,40,32,0.10);transform:translateY(-1px)}
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
        .sc-val{font-family:'Source Serif 4',serif;font-size:2rem;font-weight:700;line-height:1;letter-spacing:0}
        .sc-foot{font-size:.72rem;color:var(--muted2);margin-top:6px}

        /* ── 2-COL GRID ── */
        .g2{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px}

        /* ── CARD ── */
        .card{background:var(--s1);border:1px solid var(--b1);border-radius:8px;overflow:hidden;transition:border-color .2s}
        .card:hover{border-color:var(--b2)}
        .ch{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--b1)}
        .ct{font-family:'Instrument Sans',sans-serif;font-size:.9rem;font-weight:700;letter-spacing:0}
        .cs{font-size:.7rem;color:var(--muted);margin-top:2px}
        .cb{padding:20px}
        .cb-sm{padding:16px 20px}

        /* ── UPLOAD MODAL ── */
        .upload-modal-bg{
          position:fixed;inset:0;background:rgba(23,32,28,0.50);
          backdrop-filter:blur(6px);z-index:500;
          display:flex;align-items:center;justify-content:center;padding:20px;
        }
        .upload-modal{
          background:var(--s1);border:1px solid var(--b2);border-radius:10px;
          width:100%;max-width:520px;overflow:hidden;
          box-shadow:0 32px 80px rgba(45,40,32,0.24);
          animation:slideUp .25s cubic-bezier(.4,0,.2,1);
        }
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .um-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--b1)}
        .um-title{font-family:'Instrument Sans',sans-serif;font-size:1rem;font-weight:700}
        .um-body{padding:28px 24px}
        .um-close{background:none;border:none;color:var(--muted2);cursor:pointer;padding:4px;border-radius:4px;line-height:0;transition:color .15s}
        .um-close:hover{color:var(--text)}

        /* ── INSIGHT STRIP ── */
        .insight-strip{
          background:linear-gradient(135deg,rgba(15,118,110,0.08),rgba(184,107,75,0.06));
          border:1px solid rgba(45,40,32,0.12);border-radius:8px;
          padding:18px 22px;display:flex;align-items:flex-start;gap:14px;
          margin-bottom:16px;
        }
        .insight-icon{
          width:38px;height:38px;border-radius:9px;flex-shrink:0;
          background:rgba(15,118,110,0.10);border:1px solid rgba(15,118,110,0.20);
          display:flex;align-items:center;justify-content:center;
        }
        .ai-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent);animation:pulse 2s infinite;flex-shrink:0;margin-top:4px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        .insight-text{font-size:.875rem;color:var(--muted2);line-height:1.7;font-weight:300}

        /* ── TOP RESUME HIGHLIGHT ── */
        .best-card{
          background:linear-gradient(135deg,rgba(22,112,79,0.08),rgba(15,118,110,0.06));
          border:1px solid rgba(22,112,79,0.18);border-radius:8px;
          padding:20px;display:flex;align-items:center;gap:16px;
        }
        .best-score-wrap{display:flex;flex-direction:column;align-items:center;position:relative;flex-shrink:0}
        .best-score-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-top:4px}

        /* ── TABLE ── */
        .rtable{width:100%;border-collapse:collapse}
        .rtable th{font-size:.63rem;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);padding:0 8px 12px;border-bottom:1px solid var(--b1);text-align:left;white-space:nowrap}
        .rtable th:last-child{text-align:right}
        .rtable td{padding:11px 8px;border-bottom:1px solid var(--b1);vertical-align:middle;font-size:.85rem}
        .rtable tr:last-child td{border-bottom:none}
        .rtable tbody tr{transition:background .1s}
        .rtable tbody tr:hover td{background:rgba(23,32,28,0.025)}
        .fname{font-weight:500;color:var(--text);max-width:190px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
        .fdate{font-size:.75rem;color:var(--muted)}
        .sw{display:flex;align-items:center;gap:8px}
        .sn{font-size:.85rem;font-weight:600;min-width:26px}
        .bt{width:64px;height:4px;border-radius:2px;background:rgba(23,32,28,.08);overflow:hidden;flex-shrink:0}
        .bf{height:100%;border-radius:2px}
        .shimbar{height:4px;width:64px;border-radius:2px;background:rgba(23,32,28,.08);overflow:hidden;position:relative}
        .shimfill{position:absolute;inset:0;background:var(--accent);animation:shim 1.4s ease-in-out infinite}
        @keyframes shim{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .tag{padding:3px 9px;border-radius:100px;font-size:.68rem;font-weight:500;border:1px solid;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
        .tag-green{background:rgba(22,112,79,.10);border-color:rgba(22,112,79,.22);color:var(--green)}
        .tag-amber{background:rgba(164,97,24,.10);border-color:rgba(164,97,24,.22);color:var(--amber)}
        .tag-red{background:rgba(163,59,50,.10);border-color:rgba(163,59,50,.22);color:var(--red)}
        .tag-blue{background:rgba(15,118,110,.10);border-color:rgba(15,118,110,.22);color:var(--accent)}
        .acts{display:flex;align-items:center;justify-content:flex-end;gap:5px}
        .abt{
          width:29px;height:29px;border-radius:6px;border:1px solid var(--b1);
          display:flex;align-items:center;justify-content:center;
          background:none;cursor:pointer;color:var(--muted2);transition:all .15s;
        }
        .abt:hover{background:var(--s2);border-color:var(--b2);color:var(--text)}
        .abt.del:hover{background:rgba(163,59,50,.10);border-color:rgba(163,59,50,.25);color:var(--red)}

        /* ── EMPTY STATE ── */
        .empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:52px 24px;text-align:center}
        .empty-emoji{font-size:.82rem;margin-bottom:16px;width:42px;height:42px;border-radius:8px;background:var(--s2);border:1px solid var(--b1);display:flex;align-items:center;justify-content:center;color:var(--accent);font-weight:700}
        .empty-t{font-family:'Instrument Sans',sans-serif;font-size:1rem;font-weight:700;margin-bottom:6px}
        .empty-s{font-size:.85rem;color:var(--muted2);font-weight:300;max-width:260px;line-height:1.6}

        /* ── RESUMES TAB TOOLBAR ── */
        .toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
        .sort-btn{
          display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:7px;
          font-size:.8rem;color:var(--muted2);background:var(--s1);border:1px solid var(--b1);
          cursor:pointer;transition:all .15s;
        }
        .sort-btn:hover,.sort-btn.active{background:rgba(15,118,110,.1);border-color:rgba(15,118,110,.25);color:var(--accent)}

        /* ── TIPS TAB ── */
        .tips-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .tip-full{
          background:var(--s1);border:1px solid var(--b1);border-radius:8px;padding:22px;
          transition:all .2s;
        }
        .tip-full:hover{border-color:rgba(15,118,110,0.26);box-shadow:0 10px 26px rgba(45,40,32,0.10);transform:translateY(-2px)}
        .tip-full-icon{font-size:.78rem;margin-bottom:14px;display:inline-flex;align-items:center;justify-content:center;width:30px;height:24px;border-radius:5px;background:rgba(15,118,110,0.10);color:var(--accent);font-weight:700}
        .tip-full-title{font-family:'Instrument Sans',sans-serif;font-size:.95rem;font-weight:700;margin-bottom:8px}
        .tip-full-body{font-size:.85rem;color:var(--muted2);line-height:1.7;font-weight:300}

        /* ── SPIN ── */
        .spin{width:26px;height:26px;border-radius:50%;border:2px solid var(--accent);border-top-color:transparent;animation:rot .8s linear infinite;margin:0 auto 12px}
        @keyframes rot{to{transform:rotate(360deg)}}

        /* ── RESPONSIVE ── */
        @media(max-width:1024px){
          .g2{grid-template-columns:1fr}
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
                  container: "!border-dashed !border-[rgba(15,118,110,0.28)] !bg-[rgba(15,118,110,0.06)] !rounded-lg !py-10",
                  button: "!bg-[#0F766E] !text-white !text-sm !font-medium !rounded-md !px-6 !py-2.5 hover:!opacity-90 !transition !mt-4",
                  label: "!text-[var(--muted2)] !text-sm",
                  allowedContent: "!text-[var(--muted)] !text-xs",
                }}
              />
              <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["ATS score", "Keyword review", "Priority fixes"].map(t => (
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
            <div className="logo-mark">RL</div>
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
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.firstName ?? "there"}
                  </div>
                  <div className="wb-sub">
                    {stats.total === 0
                      ? "Upload your first resume to get a grounded ATS review."
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
                    icon: <FileText size={17} />, ibg: "rgba(15,118,110,0.12)", ic: "var(--accent)",
                    badge: null, foot: stats.total > 0 ? "Across all uploads" : "Upload to get started",
                  },
                  {
                    lbl: "Avg. ATS Score", val: stats.avg, suffix: "",
                    icon: <Target size={17} />, ibg: "rgba(22,112,79,0.12)", ic: "var(--green)",
                    badge: stats.avg > 0 ? { text: stats.avg >= 75 ? "Above avg" : "Below avg", color: stats.avg >= 75 ? "var(--green)" : "var(--amber)", bg: stats.avg >= 75 ? "rgba(22,112,79,.1)" : "rgba(164,97,24,.1)" } : null,
                    foot: stats.avg > 0 ? `Best: ${stats.best}/100` : "No data yet",
                  },
                  {
                    lbl: "Latest Score", val: stats.last, suffix: "",
                    icon: <TrendingUp size={17} />, ibg: "rgba(184,107,75,0.12)", ic: "var(--accent2)",
                    badge: stats.delta !== 0 && stats.last > 0 ? { text: `${stats.delta > 0 ? "+" : ""}${stats.delta} vs prev`, color: stats.delta > 0 ? "var(--green)" : "var(--red)", bg: stats.delta > 0 ? "rgba(22,112,79,.1)" : "rgba(163,59,50,.1)" } : null,
                    foot: stats.last > 0 ? (stats.last >= 80 ? "Excellent, ready to apply" : stats.last >= 60 ? "Good, some room to improve" : "Needs work, review tips") : "No uploads yet",
                  },
                  {
                    lbl: "Pass Rate", val: stats.passRate, suffix: "%",
                    icon: <Shield size={17} />, ibg: "rgba(164,97,24,0.12)", ic: "var(--amber)",
                    badge: null,
                    foot: `${stats.completedCount} of ${stats.total} completed`,
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

              {/* Review insight strip */}
              <div className="insight-strip">
                <div className="insight-icon"><Sparkles size={17} style={{ color: "var(--accent)" }} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <div className="ai-dot" />
                    <span style={{ fontSize: ".65rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent)" }}>Review Note</span>
                  </div>
                  <p className="insight-text">{stats.insight}</p>
                </div>
                <button className="btn-ghost" style={{ flexShrink: 0 }} onClick={() => setActiveTab("tips")}><Zap size={13} /> View Tips</button>
              </div>

              {/* Charts */}
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
                              <stop offset="5%" stopColor="#0F766E" stopOpacity={0.22} />
                              <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(45,40,32,.08)" strokeDasharray="4 4" />
                          <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} stroke="var(--muted)" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: "var(--s2)", border: "1px solid var(--b2)", borderRadius: 8, fontSize: 12, color: "var(--text)" }}
                            cursor={{ stroke: "rgba(15,118,110,.25)" }}
                            formatter={(v: number) => [`${v}/100`, "ATS Score"]}
                          />
                          <Area type="monotone" dataKey="score" stroke="#0F766E" strokeWidth={2} fill="url(#ga)" dot={{ fill: "#0F766E", r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#0F766E" }} />
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
                          <PolarGrid stroke="rgba(45,40,32,.10)" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--muted2)", fontSize: 10 }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar dataKey="value" stroke="#0F766E" fill="#0F766E" fillOpacity={0.12} strokeWidth={2} dot={{ fill: "#0F766E", r: 3, strokeWidth: 0 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent resumes */}
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
                      <div className="empty-emoji">CV</div>
                      <div className="empty-t">No resumes yet</div>
                      <button className="btn-primary" style={{ marginTop: 12, fontSize: ".8rem" }} onClick={() => setUploadOpen(true)}><Plus size={13} /> Upload First</button>
                    </div>
                  ) : (
                    recentResumes.map(res => (
                      <div key={res.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--b1)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--s3)", border: "1px solid var(--b1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileText size={15} /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: ".82rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{res.fileName}</div>
                          <div style={{ fontSize: ".7rem", color: "var(--muted)", marginTop: 2 }}>{new Date(res.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                        </div>
                        {isProcessingStatus(res.status) ? (
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
                    <div className="empty-emoji">{searchQuery ? "SR" : "CV"}</div>
                    <div className="empty-t">{searchQuery ? "No results found" : "No resumes yet"}</div>
                    <div className="empty-s">{searchQuery ? `No resumes match "${searchQuery}"` : "Upload your first resume to get started with the review"}</div>
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
                          const { text: stText, cls: stCls } = isCompleteStatus(res.status)
                            ? { text: "Completed", cls: "tag-green" }
                            : isProcessingStatus(res.status)
                            ? { text: "Analyzing", cls: "tag-amber" }
                            : { text: res.status, cls: "tag-blue" };
                          const grade = (res.atsScore ?? 0) >= 80 ? scoreLabel(res.atsScore ?? 0) : res.atsScore ? scoreLabel(res.atsScore) : null;
                          return (
                            <tr key={res.id}>
                              <td style={{ paddingLeft: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ width: 34, height: 34, borderRadius: 7, background: "var(--s3)", border: "1px solid var(--b1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileText size={14} /></div>
                                  <span className="fname">{res.fileName}</span>
                                </div>
                              </td>
                              <td>
                                <div className="fdate">{new Date(res.uploadedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</div>
                              </td>
                              <td>
                                {isProcessingStatus(res.status) ? (
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
                                {grade && !isProcessingStatus(res.status) && (
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
                <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1.4rem", fontWeight: 700, letterSpacing: 0, marginBottom: 6 }}>Resume Improvement Tips</div>
                <p style={{ fontSize: ".9rem", color: "var(--muted2)", fontWeight: 300 }}>Practical habits for clearer resumes and stronger role matching.</p>
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
                <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, letterSpacing: 0 }}>Common ATS Myths</div>
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
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(163,59,50,.10)", border: "1px solid rgba(163,59,50,.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <X size={11} style={{ color: "var(--red)" }} />
                          </div>
                          <p style={{ fontSize: ".82rem", color: "var(--muted2)", lineHeight: 1.5, fontStyle: "italic" }}>&ldquo;{item.myth}&rdquo;</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(22,112,79,.10)", border: "1px solid rgba(22,112,79,.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
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
              <div style={{ marginTop: 24, background: "linear-gradient(135deg,rgba(15,118,110,.08),rgba(184,107,75,.06))", border: "1px solid rgba(45,40,32,.12)", borderRadius: 8, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>Ready to apply these tips?</div>
                  <p style={{ fontSize: ".875rem", color: "var(--muted2)", fontWeight: 300 }}>Upload your resume now and see exactly where you stand.</p>
                </div>
                <button className="btn-primary" style={{ flexShrink: 0 }} onClick={() => { setActiveTab("resumes"); setUploadOpen(true); }}>
                  <Upload size={15} /> Upload and analyze
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
