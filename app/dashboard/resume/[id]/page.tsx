"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, Download, RefreshCw, Share2,
  CheckCircle2, XCircle, AlertCircle, Target, Lightbulb,
  TrendingUp, Zap, Copy, Check, ChevronRight, FileText,
  BarChart2, Award, Clock, Eye, BookOpen, Wand2,
  Play, Loader2, Lock, Star, Crown, ExternalLink,
  ChevronDown, ChevronUp, Info
} from "lucide-react";
import {
  ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  CartesianGrid, LineChart, Line, ReferenceLine
} from "recharts";

/* ─────────────────────────────── TYPES ──────────────────────────────── */
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

/* ─────────────────────────── ANIMATED COUNTER ───────────────────────── */
function Counter({ to, duration = 1100 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <>{val}</>;
}

/* ─────────────────────────── SCORE RING SVG ─────────────────────────── */
function ScoreRing({ score, size = 148, stroke = 10 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";
  const [off, setOff] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setOff(circ - (score / 100) * circ), 80);
    return () => clearTimeout(t);
  }, [score, circ]);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 10px ${color}99)` }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:"2.1rem", fontWeight:800, color, lineHeight:1, letterSpacing:"-.04em" }}>
          <Counter to={score}/>
        </span>
        <span style={{ fontSize:".6rem", color:"var(--muted)", textTransform:"uppercase", letterSpacing:".1em", marginTop:2 }}>/ 100</span>
      </div>
    </div>
  );
}

/* ─────────────────────────── PROGRESS BAR ───────────────────────────── */
function Bar2({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), delay + 120); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div style={{ height:5, background:"rgba(255,255,255,.07)", borderRadius:3, overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:3, width:`${w}%`, background:color, transition:"width 1s cubic-bezier(.4,0,.2,1)", boxShadow:`0 0 8px ${color}55` }}/>
    </div>
  );
}

/* ─────────────────────────── COPY BUTTON ────────────────────────────── */
function CopyBtn({ text, style: s }: { text: string; style?: React.CSSProperties }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1800); }}
      style={{ background:"none", border:"none", cursor:"pointer", color: ok ? "var(--green)" : "var(--m2)", transition:"color .15s", padding:2, lineHeight:0, ...s }} title="Copy">
      {ok ? <Check size={13}/> : <Copy size={13}/>}
    </button>
  );
}

/* ─────────────────────────── TOGGLE ─────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked}
      style={{ width:40, height:22, borderRadius:11, background: checked ? "var(--accent)" : "rgba(255,255,255,.1)", border:"none", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0, boxShadow: checked ? "0 0 12px rgba(99,102,241,.45)" : "none" }}>
      <span style={{ position:"absolute", top:2, left: checked ? 20 : 2, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .18s cubic-bezier(.4,0,.2,1)", boxShadow:"0 1px 4px rgba(0,0,0,.35)" }}/>
    </button>
  );
}

/* ─────────────────────────── MOCK DATA ─────────────────────────────── */
const MOCK_RESUME: Resume = {
  id: "res_001",
  fileName: "Hardik_Resume_2024.pdf",
  uploadedAt: "2024-11-18T09:32:00Z",
  atsScore: 82,
  status: "Completed",
  aiAnalysis: {
    atsScore: 82,
    skillsMatched: ["React","Next.js","TypeScript","Tailwind CSS","Node.js","GraphQL","REST APIs","Git","Webpack","Vite"],
    skillsMissing: ["Docker","CI/CD","Jest / Testing","Kubernetes","AWS","Redis"],
    strengths: [
      "Strong technical skillset aligned with role requirements",
      "Clear and descriptive project contributions",
      "Well-structured experience chronology",
      "Impressive portfolio of shipped production products",
      "Consistent employment history with no gaps",
    ],
    weaknesses: [
      "No quantified achievements — add numbers, %, or $ impact",
      "Missing a professional summary / objective section",
      "Formatting inconsistencies in date ranges detected",
      "Skills section lacks infrastructure / DevOps keywords",
    ],
    suggestions: [
      "Add measurable outcomes to each role (e.g. 'Reduced LCP by 42%')",
      "Write a 3–4 line professional summary targeted to this role",
      "Add Docker & CI/CD — they appear in 73% of Senior FE job descriptions",
      "Use exact keywords from the job posting (e.g. 'Next.js' not 'NextJS')",
      "Standardise date format to 'Jan 2021 – Mar 2023' throughout",
      "Add a 'Key Achievements' subsection under your most recent role",
    ],
  },
};

const SCORE_BREAKDOWN = [
  { label:"Keywords",    score:88, color:"#6366F1" },
  { label:"Formatting",  score:74, color:"#8B5CF6" },
  { label:"Experience",  score:91, color:"#22C55E" },
  { label:"Skills",      score:86, color:"#3B82F6" },
  { label:"Impact",      score:68, color:"#F59E0B" },
  { label:"Clarity",     score:79, color:"#14B8A6" },
];

const RADAR_DATA = [
  { skill:"Keywords",   A:88 },{ skill:"Formatting",A:74 },
  { skill:"Experience", A:91 },{ skill:"Skills",    A:86 },
  { skill:"Impact",     A:68 },{ skill:"Clarity",   A:79 },
];

const KEYWORD_GAP = [
  { kw:"React",       resume:true,  job:true  },
  { kw:"TypeScript",  resume:true,  job:true  },
  { kw:"Next.js",     resume:true,  job:true  },
  { kw:"GraphQL",     resume:true,  job:true  },
  { kw:"Tailwind CSS",resume:true,  job:true  },
  { kw:"Node.js",     resume:true,  job:true  },
  { kw:"Docker",      resume:false, job:true  },
  { kw:"CI/CD",       resume:false, job:true  },
  { kw:"Jest",        resume:false, job:true  },
  { kw:"Kubernetes",  resume:false, job:true  },
  { kw:"AWS",         resume:false, job:true  },
  { kw:"PostgreSQL",  resume:true,  job:false },
  { kw:"Redis",       resume:false, job:true  },
];

const CATEGORY_BAR = [
  { cat:"Technical", match:88 },{ cat:"Tools",    match:71 },
  { cat:"Soft",      match:65 },{ cat:"Domain",   match:58 },
  { cat:"Industry",  match:44 },
];

const SCORE_HISTORY = [
  { name:"v1", score:61 },{ name:"v2", score:68 },
  { name:"v3", score:74 },{ name:"v4 (now)", score:82 },
];

const SUGGESTIONS_DATA = [
  { priority:"high",   title:"Add measurable impact to each role",   body:"Replace vague bullets with quantified achievements. e.g. 'Reduced LCP by 42%' or 'Led team of 6 engineers delivering $1.2M project'.", tag:"Impact"    },
  { priority:"high",   title:"Write a targeted professional summary", body:"A 3–4 sentence summary at the top tailored to this role increases your ATS pass rate by ~28% based on our data.", tag:"Structure"  },
  { priority:"medium", title:"Add Docker & CI/CD to skills section",  body:"These appear in 73% of Senior Frontend job descriptions at large tech companies. Even basic familiarity is worth listing.", tag:"Keywords"   },
  { priority:"medium", title:"Mirror exact keywords from job posting", body:"Use 'TypeScript' not 'TS', 'Next.js' not 'NextJS'. ATS systems use exact-match filtering for many critical keywords.",    tag:"ATS"        },
  { priority:"medium", title:"Add a Key Achievements subsection",     body:"Under your most recent role, add 3–5 bullet points that lead with numbers. This is what impresses both ATS and human reviewers.", tag:"Impact"  },
  { priority:"low",    title:"Standardise date formatting",           body:"Use 'Jan 2021 – Mar 2023' consistently throughout. Mixing formats signals lack of attention to detail to ATS parsers.",          tag:"Formatting" },
];

/* ═════════════════════════ MAIN COMPONENT ════════════════════════════ */
export default function ResumeDetailPage() {
  const params  = useParams();
  const resumeId = params?.id as string;

  const [resume,  setResume]  = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview"|"keywords"|"suggestions"|"rewrite"|"jobmatch">("overview");

  /* job match */
  const [jd,        setJd]        = useState("");
  const [jobMatch,  setJobMatch]  = useState<JobMatch | null>(null);
  const [matching,  setMatching]  = useState(false);
  const [jdPasted,  setJdPasted]  = useState(false);

  /* rewrite */
  const [targetRole, setTargetRole]   = useState("");
  const [rewritten,  setRewritten]    = useState("");
  const [rewriting,  setRewriting]    = useState(false);
  const [rwProgress, setRwProgress]   = useState(0);
  const [rwSections, setRwSections]   = useState<string[]>([]);
  const [rwTone,     setRwTone]       = useState("professional");
  const [rwLength,   setRwLength]     = useState("concise");
  const [rwHighlight,setRwHighlight]  = useState(true);

  /* expanded suggestion */
  const [expanded, setExpanded] = useState<number | null>(null);

  /* copied share link */
  const [sharedLink, setSharedLink] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResume(data);
        setJobMatch(data.jobMatch ?? null);
      } catch {
        // fallback to mock for preview
        setResume(MOCK_RESUME);
      } finally {
        setLoading(false);
      }
    }
    if (resumeId) load(); else { setResume(MOCK_RESUME); setLoading(false); }
  }, [resumeId]);

  async function handleJobMatch() {
    if (!jd.trim()) return;
    setMatching(true); setJobMatch(null);
    try {
      const res = await fetch("/api/job-match", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ resumeId, jobDescription: jd }),
      });
      setJobMatch(await res.json());
    } catch {
      // mock result
      setJobMatch({
        matchScore: 74,
        matchedSkills: ["React","TypeScript","Next.js","Node.js","GraphQL"],
        missingSkills: ["Docker","CI/CD","AWS","Kubernetes"],
        recommendations: [
          "Add Docker and containerisation experience to your skills",
          "Mention any exposure to CI/CD pipelines (GitHub Actions, Jenkins)",
          "Include cloud platform experience (AWS, GCP or Azure)",
        ],
      });
    } finally { setMatching(false); }
  }

  async function handleRewrite() {
    if (!targetRole.trim()) return;
    setRewriting(true); setRewritten(""); setRwProgress(0); setRwSections([]);
    const sections = ["Professional Summary", "Skills Section", "Experience Bullets", "Education", "Final Polish"];
    for (let i = 0; i < sections.length; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      setRwSections(s => [...s, sections[i]]);
      setRwProgress(Math.round(((i + 1) / sections.length) * 100));
    }
    try {
      const res = await fetch("/api/rewrite-resume", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ resumeId, targetRole, tone: rwTone, length: rwLength }),
      });
      const data = await res.json();
      if (data.rewritten) setRewritten(data.rewritten);
    } catch {
      setRewritten(`REWRITTEN RESUME — ${targetRole.toUpperCase()}\n\n— Professional Summary —\nResults-driven software engineer with 5+ years building high-performance web products at scale. Expert in React, TypeScript, and Next.js. Passionate about developer experience, accessible UI, and measurable engineering outcomes.\n\n— Key Skills —\nReact · Next.js · TypeScript · Tailwind CSS · Node.js · GraphQL · REST APIs · Git · Webpack · Vite\n\n— Experience —\nSenior Frontend Engineer — Acme Corp (Jan 2022 – Present)\n• Reduced homepage LCP by 42% through lazy loading and code-splitting strategy\n• Led team of 4 engineers to deliver $1.2M redesign project 2 weeks ahead of schedule\n• Architected component design system adopted by 3 internal product teams\n\nFrontend Engineer — StartupXYZ (Mar 2020 – Dec 2021)\n• Built real-time dashboard processing 50k+ daily events using WebSocket and React Query\n• Improved Lighthouse performance score from 61 → 94 across core user journeys\n• Shipped 12 A/B experiments increasing conversion by a cumulative 18%`);
    }
    setRewriting(false);
  }

  /* ── loading / error states ── */
  if (loading) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700&family=DM+Sans:opsz,wght@9..40,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0A0A0F;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        .spin{width:36px;height:36px;border-radius:50%;border:3px solid rgba(99,102,241,.25);border-top-color:#6366F1;animation:rot .8s linear infinite}
        @keyframes rot{to{transform:rotate(360deg)}}
      `}</style>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, background:"#0A0A0F" }}>
        <div className="spin"/>
        <p style={{ fontSize:".875rem", color:"#6B6B80", fontFamily:"'DM Sans',sans-serif" }}>Loading resume analysis…</p>
      </div>
    </>
  );

  if (!resume) return (
    <div style={{ minHeight:"100vh", background:"#0A0A0F", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:"#F87171", fontFamily:"sans-serif" }}>
      <AlertCircle size={32}/>
      <p>Resume not found</p>
      <Link href="/dashboard"><span style={{ color:"#818CF8", textDecoration:"underline", fontSize:".875rem" }}>← Back to Dashboard</span></Link>
    </div>
  );

  if (resume.status === "Processing") return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0A0A0F;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        .prog{height:3px;background:rgba(99,102,241,.15);border-radius:2px;overflow:hidden;width:220px}
        .prog-inner{height:100%;background:linear-gradient(90deg,#6366F1,#8B5CF6);border-radius:2px;animation:prog 2s ease-in-out infinite}
        @keyframes prog{0%{width:0%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}
      `}</style>
      <div style={{ minHeight:"100vh", background:"#0A0A0F", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
        <div style={{ width:52, height:52, borderRadius:12, background:"rgba(99,102,241,.12)", border:"1px solid rgba(99,102,241,.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Sparkles size={22} style={{ color:"#6366F1" }}/>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:"1.1rem", fontWeight:700, color:"#F0F0F5", marginBottom:6 }}>Analyzing your resume…</div>
          <p style={{ fontSize:".82rem", color:"#6B6B80" }}>Our AI is reading every line. This takes ~20 seconds.</p>
        </div>
        <div className="prog"><div className="prog-inner"/></div>
      </div>
    </>
  );

  const a = resume.aiAnalysis ?? MOCK_RESUME.aiAnalysis!;
  const atsScore = resume.atsScore ?? a.atsScore;
  const scoreColor = atsScore >= 80 ? "var(--green)" : atsScore >= 60 ? "var(--amber)" : "var(--red)";
  const scoreLabel = atsScore >= 80 ? "Strong Match" : atsScore >= 60 ? "Decent Match" : "Needs Work";
  const uploadDate = new Date(resume.uploadedAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

  const pColor = (p: string) => p === "high" ? "var(--red)" : p === "medium" ? "var(--amber)" : "var(--m2)";
  const pBg    = (p: string) => p === "high" ? "rgba(239,68,68,.07)"  : p === "medium" ? "rgba(245,158,11,.07)" : "rgba(255,255,255,.03)";
  const pBorder= (p: string) => p === "high" ? "rgba(239,68,68,.2)"   : p === "medium" ? "rgba(245,158,11,.2)"  : "var(--b1)";

  const TABS = [
    { id:"overview",   label:"Overview",        icon:BarChart2  },
    { id:"keywords",   label:"Keywords",         icon:Target     },
    { id:"suggestions",label:"Suggestions",      icon:Lightbulb  },
    { id:"jobmatch",   label:"Job Match",         icon:TrendingUp },
    { id:"rewrite",    label:"AI Rewrite",        icon:Wand2      },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#0A0A0F;--s1:#111118;--s2:#16161F;--s3:#1C1C28;
          --b1:rgba(255,255,255,.06);--b2:rgba(255,255,255,.11);
          --text:#F0F0F5;--muted:#6B6B80;--m2:#9090A8;
          --accent:#6366F1;--a2:#8B5CF6;
          --green:#22C55E;--amber:#F59E0B;--red:#EF4444;
        }
        html,body{min-height:100%;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        a{text-decoration:none;color:inherit}
        button{font-family:'DM Sans',sans-serif}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.09);border-radius:2px}

        /* TOPBAR */
        .topbar{position:sticky;top:0;z-index:100;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;background:rgba(10,10,15,.92);backdrop-filter:blur(18px);border-bottom:1px solid var(--b1)}
        .tb-l{display:flex;align-items:center;gap:12px}
        .tb-r{display:flex;align-items:center;gap:8px}
        .back-btn{display:inline-flex;align-items:center;gap:6px;font-size:.82rem;color:var(--m2);background:none;border:1px solid transparent;padding:6px 12px;border-radius:7px;cursor:pointer;transition:all .15s}
        .back-btn:hover{color:var(--text);background:rgba(255,255,255,.05);border-color:var(--b1)}
        .file-pill{display:flex;align-items:center;gap:7px;padding:5px 12px;background:var(--s2);border:1px solid var(--b1);border-radius:7px;font-size:.78rem;color:var(--m2)}
        .file-pill strong{color:var(--text);font-weight:500}
        .ic-btn{width:34px;height:34px;border-radius:8px;border:1px solid var(--b1);background:none;display:flex;align-items:center;justify-content:center;color:var(--m2);cursor:pointer;transition:all .15s}
        .ic-btn:hover{background:rgba(255,255,255,.06);border-color:var(--b2);color:var(--text)}
        .dl-btn{display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,var(--accent),var(--a2));color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:.82rem;font-weight:500;cursor:pointer;box-shadow:0 0 0 1px rgba(99,102,241,.3);transition:all .2s}
        .dl-btn:hover{box-shadow:0 4px 18px rgba(99,102,241,.45);transform:translateY(-1px)}

        /* TABS */
        .tabs{display:flex;align-items:center;gap:1px;padding:0 28px;background:var(--s1);border-bottom:1px solid var(--b1);overflow-x:auto}
        .tabs::-webkit-scrollbar{height:0}
        .tab{padding:13px 15px;font-size:.82rem;color:var(--m2);border:none;background:none;cursor:pointer;transition:color .15s;position:relative;display:flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0}
        .tab:hover{color:var(--text)}
        .tab.on{color:var(--text);font-weight:500}
        .tab.on::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:var(--accent);border-radius:2px 2px 0 0}
        .tab-pro{display:inline-flex;align-items:center;gap:3px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);color:var(--amber);font-size:.55rem;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:4px;letter-spacing:.05em;text-transform:uppercase}

        /* PAGE */
        .page{padding:28px;max-width:1160px;margin:0 auto}

        /* CARDS */
        .card{background:var(--s1);border:1px solid var(--b1);border-radius:12px;overflow:hidden;transition:border-color .2s;margin-bottom:16px}
        .card:hover{border-color:var(--b2)}
        .ch{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--b1)}
        .ct{font-family:'Bricolage Grotesque',sans-serif;font-size:.88rem;font-weight:600;letter-spacing:-.01em;display:flex;align-items:center;gap:7px}
        .cb{padding:20px}

        /* GRIDS */
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px}
        .g-hero{display:grid;grid-template-columns:280px 1fr;gap:16px;margin-bottom:16px}
        .g13{display:grid;grid-template-columns:1fr 2fr;gap:16px;margin-bottom:16px}

        /* SCORE CARD */
        .score-card{background:linear-gradient(145deg,var(--s1),rgba(99,102,241,.06));border:1px solid rgba(99,102,241,.2);border-radius:12px;padding:26px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;position:relative;overflow:hidden}
        .score-card::before{content:'';position:absolute;top:-50px;right:-50px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,.12),transparent 70%);pointer-events:none}
        .score-label{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:100px;font-size:.72rem;font-weight:600;border:1px solid}
        .score-divider{width:100%;height:1px;background:var(--b1)}
        .score-stats{display:flex;gap:0;width:100%}
        .ss-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:0 6px}
        .ss-item+.ss-item{border-left:1px solid var(--b1)}
        .ss-val{font-family:'Bricolage Grotesque',sans-serif;font-size:1.15rem;font-weight:700;line-height:1}
        .ss-lbl{font-size:.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}

        /* AI SUMMARY */
        .summary-card{background:var(--s1);border:1px solid var(--b1);border-radius:12px;padding:22px;display:flex;flex-direction:column;gap:14px}
        .ai-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:100px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--accent)}
        .ai-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent);animation:blink 2s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

        /* QUICK STATS */
        .qs{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
        .qi{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--s1);border:1px solid var(--b1);border-radius:9px;flex:1;min-width:110px;transition:border-color .15s}
        .qi:hover{border-color:var(--b2)}
        .qi-ico{width:32px;height:32px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px}
        .qi-val{font-family:'Bricolage Grotesque',sans-serif;font-size:1rem;font-weight:700;line-height:1}
        .qi-lbl{font-size:.64rem;color:var(--muted);margin-top:2px;text-transform:uppercase;letter-spacing:.05em}

        /* BREAKDOWN */
        .br-row{display:flex;align-items:center;gap:10px;margin-bottom:11px}
        .br-row:last-child{margin-bottom:0}
        .br-lbl{font-size:.78rem;color:var(--m2);min-width:82px;font-weight:400}
        .br-num{font-family:'Bricolage Grotesque',sans-serif;font-size:.82rem;font-weight:600;min-width:24px;text-align:right}

        /* SKILL TAGS */
        .stag{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:7px;font-size:.78rem;font-weight:500;border:1px solid;cursor:default;transition:all .15s}
        .stag:hover{transform:translateY(-1px)}
        .stag-g{background:rgba(34,197,94,.08);border-color:rgba(34,197,94,.2);color:#4ADE80}
        .stag-r{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.2);color:#F87171}
        .stag-a{background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.2);color:#FCD34D}
        .stag-b{background:rgba(99,102,241,.08);border-color:rgba(99,102,241,.22);color:#818CF8}
        .tags-wrap{display:flex;flex-wrap:wrap;gap:8px}

        /* S/W ITEMS */
        .sw{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;border-radius:9px;border:1px solid var(--b1);background:var(--s2);margin-bottom:8px;transition:all .15s}
        .sw:last-child{margin-bottom:0}
        .sw:hover{border-color:var(--b2);transform:translateX(3px)}
        .sw-ico{font-size:1rem;flex-shrink:0;line-height:1.5}
        .sw-txt{font-size:.855rem;line-height:1.65;font-weight:300}

        /* KEYWORD TABLE */
        .kw-table{width:100%;border-collapse:collapse}
        .kw-table th{font-size:.62rem;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);padding:0 10px 12px;border-bottom:1px solid var(--b1);text-align:left}
        .kw-table td{padding:10px 10px;border-bottom:1px solid var(--b1);font-size:.84rem;vertical-align:middle}
        .kw-table tr:last-child td{border-bottom:none}
        .kw-table tbody tr:hover td{background:rgba(255,255,255,.02)}
        .kp{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;font-size:.72rem;font-weight:500}

        /* SUGGESTION CARDS */
        .sug{border-radius:10px;padding:18px 20px;border:1px solid;margin-bottom:10px;cursor:pointer;transition:all .2s}
        .sug:last-child{margin-bottom:0}
        .sug:hover{transform:translateX(3px)}
        .sug-prio{display:inline-flex;align-items:center;gap:4px;font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;padding:2px 8px;border-radius:100px;border:1px solid;margin-bottom:9px}
        .sug-title{font-family:'Bricolage Grotesque',sans-serif;font-size:.88rem;font-weight:600;margin-bottom:5px}
        .sug-body{font-size:.8rem;color:var(--m2);line-height:1.7;font-weight:300}
        .sug-tag{display:inline-flex;margin-top:10px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:var(--accent);font-size:.62rem;font-weight:600;padding:2px 8px;border-radius:100px}

        /* TAGS */
        .tag{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:100px;font-size:.66rem;font-weight:500;border:1px solid}
        .tg{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.2);color:#4ADE80}
        .ta{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.2);color:#FCD34D}
        .tb{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.25);color:#818CF8}
        .tr2{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.2);color:#F87171}

        /* INPUTS */
        .inp{background:var(--s2);border:1px solid var(--b1);border-radius:8px;padding:10px 14px;font-size:.875rem;color:var(--text);outline:none;transition:border-color .2s,box-shadow .2s;width:100%;font-family:'DM Sans',sans-serif}
        .inp::placeholder{color:var(--muted)}
        .inp:focus{border-color:rgba(99,102,241,.4);box-shadow:0 0 0 3px rgba(99,102,241,.09)}
        textarea.inp{resize:vertical;min-height:140px;line-height:1.65}

        /* BUTTONS */
        .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:.855rem;font-weight:500;cursor:pointer;transition:all .15s;border:none;font-family:'DM Sans',sans-serif}
        .btn-p{background:linear-gradient(135deg,var(--accent),var(--a2));color:#fff;box-shadow:0 0 0 1px rgba(99,102,241,.3)}
        .btn-p:hover{box-shadow:0 4px 18px rgba(99,102,241,.4);transform:translateY(-1px)}
        .btn-g{background:var(--s3);color:var(--m2);border:1px solid var(--b1)}
        .btn-g:hover{background:rgba(255,255,255,.08);color:var(--text);border-color:var(--b2)}
        .btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;box-shadow:none!important}

        /* SELECT PILL */
        .sel-g{display:inline-flex;background:var(--s2);border:1px solid var(--b1);border-radius:7px;padding:2px}
        .sel-o{padding:5px 13px;border-radius:5px;font-size:.78rem;font-weight:500;cursor:pointer;transition:all .15s;border:none;background:none;color:var(--m2)}
        .sel-o.on{background:var(--s3);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.3)}

        /* REWRITE PROGRESS */
        .rw-step{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;background:var(--s2);border:1px solid var(--b1);margin-bottom:8px;font-size:.82rem}
        .rw-step.done{border-color:rgba(99,102,241,.22);background:rgba(99,102,241,.07)}
        .rw-step.done .rw-ico{color:var(--accent)}

        /* PRO LOCK */
        .pro-gate{background:linear-gradient(135deg,rgba(245,158,11,.07),rgba(245,158,11,.03));border:1px solid rgba(245,158,11,.2);border-radius:12px;padding:28px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}

        /* SCORE HISTORY */
        .hist-tooltip{background:var(--s2);border:1px solid var(--b2);border-radius:8px;padding:8px 12px;font-size:.78rem;color:var(--text)}

        /* INFO BOX */
        .ibox{display:flex;align-items:flex-start;gap:9px;padding:11px 13px;background:rgba(99,102,241,.07);border:1px solid rgba(99,102,241,.18);border-radius:8px;margin-bottom:14px}
        .ibox p{font-size:.78rem;color:var(--m2);line-height:1.6}

        /* JOB MATCH SCORE RING AREA */
        .jm-score{display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px 20px;background:var(--s2);border:1px solid var(--b1);border-radius:11px}

        /* RESPONSIVE */
        @media(max-width:1024px){.g-hero{grid-template-columns:1fr}.g13{grid-template-columns:1fr}}
        @media(max-width:768px){
          .g2{grid-template-columns:1fr}.g3{grid-template-columns:1fr}
          .page{padding:16px}.topbar{padding:0 14px}.tabs{padding:0 14px}
          .file-pill{display:none}.qs{flex-direction:column}
        }
      `}</style>

      {/* ══ TOPBAR ══ */}
      <header className="topbar">
        <div className="tb-l">
          <Link href="/dashboard"><button className="back-btn"><ArrowLeft size={14}/>Dashboard</button></Link>
          <div className="file-pill">
            <FileText size={12}/>
            <strong>{resume.fileName}</strong>
            <span style={{color:"var(--muted)"}}>·</span>
            <span>{uploadDate}</span>
          </div>
        </div>
        <div className="tb-r">
          <button className="ic-btn" title="Refresh"><RefreshCw size={14}/></button>
          <button className="ic-btn" title="Share" onClick={() => { navigator.clipboard?.writeText(window.location.href); setSharedLink(true); setTimeout(() => setSharedLink(false), 2000); }}>
            {sharedLink ? <Check size={14} style={{color:"var(--green)"}}/> : <Share2 size={14}/>}
          </button>
          <button className="dl-btn"><Download size={13}/>Download Report</button>
        </div>
      </header>

      {/* ══ TABS ══ */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab${tab===t.id?" on":""}`} onClick={() => setTab(t.id)}>
            <t.icon size={13}/>
            {t.label}
            {(t.id === "jobmatch" || t.id === "rewrite") && <span className="tab-pro"><Crown size={7}/>Pro</span>}
          </button>
        ))}
      </div>

      {/* ════════ OVERVIEW ════════ */}
      {tab==="overview" && (
        <div className="page">
          {/* quick stats */}
          <div className="qs">
            {[
              { icon:"📄", val:"1 page",         lbl:"Length",          bg:"rgba(99,102,241,.1)"  },
              { icon:"📝", val:"487 words",       lbl:"Word Count",      bg:"rgba(139,92,246,.1)"  },
              { icon:"👁️", val:"91% readable",   lbl:"Readability",     bg:"rgba(34,197,94,.08)"  },
              { icon:"⏱️", val:"~6 sec",          lbl:"Recruiter Scan",  bg:"rgba(245,158,11,.08)" },
              { icon:"🎯", val:`${a.skillsMatched.length}/${a.skillsMatched.length+a.skillsMissing.length}`, lbl:"Skills Matched", bg:"rgba(59,130,246,.08)" },
              { icon:"📅", val:uploadDate,        lbl:"Uploaded",        bg:"rgba(20,184,166,.08)" },
            ].map((s,i) => (
              <div key={i} className="qi">
                <div className="qi-ico" style={{background:s.bg}}>{s.icon}</div>
                <div><div className="qi-val">{s.val}</div><div className="qi-lbl">{s.lbl}</div></div>
              </div>
            ))}
          </div>

          {/* hero */}
          <div className="g-hero">
            {/* score card */}
            <div className="score-card">
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <FileText size={13} style={{color:"var(--m2)"}}/>
                <span style={{fontSize:".75rem",color:"var(--m2)",fontWeight:500}}>ATS Score</span>
              </div>
              <ScoreRing score={atsScore} size={148}/>
              <div className="score-label" style={{
                background: atsScore>=80 ? "rgba(34,197,94,.12)" : atsScore>=60 ? "rgba(245,158,11,.12)" : "rgba(239,68,68,.12)",
                borderColor: atsScore>=80 ? "rgba(34,197,94,.25)" : atsScore>=60 ? "rgba(245,158,11,.25)" : "rgba(239,68,68,.25)",
                color: scoreColor,
              }}>
                {atsScore>=80 ? <CheckCircle2 size={11}/> : <AlertCircle size={11}/>}
                {scoreLabel}
              </div>
              <div className="score-divider"/>
              <div className="score-stats">
                {[
                  { val:a.skillsMatched.length, lbl:"Skills Hit",    color:"var(--green)"  },
                  { val:a.skillsMissing.length, lbl:"Skills Gap",    color:"var(--red)"    },
                  { val:SUGGESTIONS_DATA.length,lbl:"Actions",       color:"var(--accent)" },
                ].map((s,i) => (
                  <div key={i} className="ss-item">
                    <div className="ss-val" style={{color:s.color}}>{s.val}</div>
                    <div className="ss-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
              {/* score history */}
              <div style={{width:"100%",borderTop:"1px solid var(--b1)",paddingTop:14}}>
                <div style={{fontSize:".62rem",color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Score History</div>
                <div style={{height:60}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={SCORE_HISTORY}>
                      <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} dot={{fill:"#6366F1",r:3,strokeWidth:0}} activeDot={{r:4}}/>
                      <XAxis dataKey="name" tick={{fontSize:8,fill:"var(--muted)"}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:"var(--s2)",border:"1px solid var(--b2)",borderRadius:7,fontSize:11,color:"var(--text)"}} formatter={(v:number)=>[`${v}/100`,"Score"]}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{fontSize:".7rem",color:"var(--muted)",textAlign:"center",fontWeight:300,lineHeight:1.5}}>
                Vs <strong style={{color:"var(--m2)"}}>Senior Frontend Engineer</strong> @ Google
              </div>
            </div>

            {/* AI summary */}
            <div className="summary-card">
              <div>
                <div className="ai-badge"><div className="ai-dot"/>AI Analysis</div>
                <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"1.1rem",fontWeight:700,letterSpacing:"-.01em",marginTop:8}}>
                  Resume Report — Senior Frontend Engineer
                </div>
              </div>
              <p style={{fontSize:".88rem",color:"var(--m2)",lineHeight:1.75,fontWeight:300}}>
                Your resume is a strong match for this role and passes most ATS filters. Your technical skills section is well-aligned with the requirements. The main opportunities are in the <strong style={{color:"var(--text)"}}>impact layer</strong> — adding numbers and outcomes to your bullets — and writing a <strong style={{color:"var(--text)"}}>targeted professional summary</strong>. Filling the Docker&nbsp;/&nbsp;CI-CD gap would meaningfully boost your score.
              </p>

              {/* score breakdown */}
              <div style={{borderTop:"1px solid var(--b1)",paddingTop:14}}>
                <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:".72rem",fontWeight:700,marginBottom:12,color:"var(--m2)",textTransform:"uppercase",letterSpacing:".08em"}}>
                  Score Breakdown
                </div>
                {SCORE_BREAKDOWN.map((s,i) => (
                  <div key={s.label} className="br-row">
                    <span className="br-lbl">{s.label}</span>
                    <div style={{flex:1}}><Bar2 value={s.score} color={s.color} delay={i*70}/></div>
                    <span className="br-num" style={{color:s.color}}>{s.score}</span>
                  </div>
                ))}
              </div>

              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button className="btn btn-p" onClick={() => setTab("suggestions")}><Lightbulb size={13}/>View Suggestions</button>
                <button className="btn btn-g" onClick={() => setTab("keywords")}><Target size={13}/>Keyword Analysis</button>
                <button className="btn btn-g" onClick={() => setTab("jobmatch")}><TrendingUp size={13}/>Match a Job</button>
              </div>
            </div>
          </div>

          {/* skills */}
          <div className="g2">
            <div className="card">
              <div className="ch">
                <div>
                  <div className="ct"><CheckCircle2 size={13} style={{color:"var(--green)"}}/>Matched Skills</div>
                  <div style={{fontSize:".68rem",color:"var(--muted)",marginTop:2}}>{a.skillsMatched.length} keywords found in your resume</div>
                </div>
                <span className="tag tg">{a.skillsMatched.length} matched</span>
              </div>
              <div className="cb"><div className="tags-wrap">
                {a.skillsMatched.map(s => <span key={s} className="stag stag-g"><CheckCircle2 size={9}/>{s}</span>)}
              </div></div>
            </div>
            <div className="card">
              <div className="ch">
                <div>
                  <div className="ct"><XCircle size={13} style={{color:"var(--red)"}}/>Missing Skills</div>
                  <div style={{fontSize:".68rem",color:"var(--muted)",marginTop:2}}>{a.skillsMissing.length} keywords the ATS expects</div>
                </div>
                <span className="tag tr2">{a.skillsMissing.length} gaps</span>
              </div>
              <div className="cb"><div className="tags-wrap">
                {a.skillsMissing.map(s => <span key={s} className="stag stag-r"><XCircle size={9}/>{s}</span>)}
              </div></div>
            </div>
          </div>

          {/* radar + strengths/weaknesses */}
          <div className="g13">
            <div className="card" style={{marginBottom:0}}>
              <div className="ch"><div className="ct"><Award size={13}/>Skill Radar</div></div>
              <div className="cb" style={{paddingTop:6}}>
                <div style={{height:230}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={RADAR_DATA}>
                      <PolarGrid stroke="rgba(255,255,255,.06)"/>
                      <PolarAngleAxis dataKey="skill" tick={{fill:"var(--m2)",fontSize:10}}/>
                      <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                      <Radar dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.16} strokeWidth={2} dot={{fill:"#6366F1",r:3,strokeWidth:0}}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div className="card" style={{marginBottom:0}}>
                <div className="ch"><div className="ct" style={{color:"var(--green)"}}><CheckCircle2 size={13}/>Strengths</div><span className="tag tg">{a.strengths.length} found</span></div>
                <div className="cb" style={{paddingTop:12}}>
                  {a.strengths.map((s,i) => (
                    <div key={i} className="sw">
                      <span className="sw-ico">{["💪","📋","📅","🚀","✅"][i]||"✨"}</span>
                      <span className="sw-txt">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{marginBottom:0}}>
                <div className="ch"><div className="ct" style={{color:"var(--red)"}}><XCircle size={13}/>Areas to Improve</div><span className="tag tr2">{a.weaknesses.length} found</span></div>
                <div className="cb" style={{paddingTop:12}}>
                  {a.weaknesses.map((w,i) => (
                    <div key={i} className="sw">
                      <span className="sw-ico">{["📊","📝","⚠️","🔧"][i]||"💡"}</span>
                      <span className="sw-txt">{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ KEYWORDS ════════ */}
      {tab==="keywords" && (
        <div className="page">
          <div style={{marginBottom:22}}>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"1.2rem",fontWeight:700,letterSpacing:"-.02em",marginBottom:4}}>Keyword Analysis</div>
            <p style={{fontSize:".875rem",color:"var(--m2)",fontWeight:300}}>See exactly which job keywords appear in your resume — and which are missing.</p>
          </div>

          <div className="g2">
            {/* bar chart */}
            <div className="card" style={{marginBottom:0}}>
              <div className="ch"><div className="ct"><BarChart2 size={13}/>Match Rate by Category</div></div>
              <div className="cb" style={{paddingTop:6}}>
                <div style={{height:210}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CATEGORY_BAR} barSize={20}>
                      <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="4 4" vertical={false}/>
                      <XAxis dataKey="cat" stroke="var(--muted)" tick={{fontSize:11,fill:"var(--m2)"}} axisLine={false} tickLine={false}/>
                      <YAxis domain={[0,100]} stroke="var(--muted)" tick={{fontSize:10,fill:"var(--muted)"}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:"var(--s2)",border:"1px solid var(--b2)",borderRadius:8,fontSize:12,color:"var(--text)"}} formatter={(v:number)=>[`${v}%`,"Match"]}/>
                      <Bar dataKey="match" radius={[4,4,0,0]}>
                        {CATEGORY_BAR.map((v,i) => <Cell key={i} fill={v.match>=75?"#6366F1":v.match>=55?"#8B5CF6":"#4B4E72"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* coverage summary */}
            <div className="card" style={{marginBottom:0}}>
              <div className="ch"><div className="ct"><Target size={13}/>Coverage Overview</div></div>
              <div className="cb">
                <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
                  {[
                    {l:"In both",count:KEYWORD_GAP.filter(k=>k.resume&&k.job).length, color:"var(--green)"},
                    {l:"Missing", count:KEYWORD_GAP.filter(k=>!k.resume&&k.job).length,color:"var(--red)"  },
                    {l:"Extra",   count:KEYWORD_GAP.filter(k=>k.resume&&!k.job).length,color:"var(--amber)"},
                  ].map(r => (
                    <div key={r.l} style={{flex:1,minWidth:70,padding:"12px 10px",background:"var(--s2)",border:"1px solid var(--b1)",borderRadius:9,textAlign:"center"}}>
                      <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"1.4rem",fontWeight:700,color:r.color}}>{r.count}</div>
                      <div style={{fontSize:".62rem",color:"var(--muted)",marginTop:2,textTransform:"uppercase",letterSpacing:".06em"}}>{r.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:8}}>
                  <Bar2 value={Math.round(KEYWORD_GAP.filter(k=>k.resume&&k.job).length/KEYWORD_GAP.filter(k=>k.job).length*100)} color="var(--accent)"/>
                </div>
                <p style={{fontSize:".75rem",color:"var(--m2)",fontWeight:300}}>
                  <strong style={{color:"var(--text)"}}>{Math.round(KEYWORD_GAP.filter(k=>k.resume&&k.job).length/KEYWORD_GAP.filter(k=>k.job).length*100)}%</strong> of required keywords present
                </p>
                <div className="ibox" style={{marginTop:14,marginBottom:0}}>
                  <Info size={13} style={{color:"var(--accent)",flexShrink:0,marginTop:1}}/>
                  <p>Keywords in "Extra" are in your resume but not required by this job — they're not harmful, but you could trim them to sharpen your focus.</p>
                </div>
              </div>
            </div>
          </div>

          {/* full keyword table */}
          <div className="card">
            <div className="ch">
              <div className="ct"><Eye size={13}/>Full Keyword Table</div>
              <span style={{fontSize:".72rem",color:"var(--m2)"}}>{KEYWORD_GAP.length} keywords analyzed</span>
            </div>
            <div className="cb" style={{padding:0,overflowX:"auto"}}>
              <table className="kw-table">
                <thead>
                  <tr>
                    <th style={{paddingLeft:20}}>Keyword</th>
                    <th>In Your Resume</th>
                    <th>In Job Post</th>
                    <th style={{paddingRight:20}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {KEYWORD_GAP.map(k => {
                    const status = k.resume&&k.job?"Matched":!k.resume&&k.job?"Missing":k.resume&&!k.job?"Extra":"N/A";
                    return (
                      <tr key={k.kw}>
                        <td style={{paddingLeft:20,fontWeight:500}}>{k.kw}</td>
                        <td>{k.resume
                          ? <span style={{display:"inline-flex",alignItems:"center",gap:4,color:"var(--green)"}}><CheckCircle2 size={12}/>Yes</span>
                          : <span style={{display:"inline-flex",alignItems:"center",gap:4,color:"var(--muted)"}}><XCircle size={12}/>No</span>}
                        </td>
                        <td>{k.job
                          ? <span style={{display:"inline-flex",alignItems:"center",gap:4}}><CheckCircle2 size={12} style={{color:"var(--accent)"}}/>Required</span>
                          : <span style={{color:"var(--muted)"}}>—</span>}
                        </td>
                        <td style={{paddingRight:20}}>
                          <span className="kp" style={{
                            background:status==="Matched"?"rgba(34,197,94,.1)":status==="Missing"?"rgba(239,68,68,.1)":status==="Extra"?"rgba(245,158,11,.1)":"rgba(99,102,241,.1)",
                            border:`1px solid ${status==="Matched"?"rgba(34,197,94,.2)":status==="Missing"?"rgba(239,68,68,.2)":status==="Extra"?"rgba(245,158,11,.2)":"rgba(99,102,241,.2)"}`,
                            color:status==="Matched"?"#4ADE80":status==="Missing"?"#F87171":status==="Extra"?"#FCD34D":"#818CF8",
                          }}>{status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════ SUGGESTIONS ════════ */}
      {tab==="suggestions" && (
        <div className="page">
          <div style={{marginBottom:22}}>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"1.2rem",fontWeight:700,letterSpacing:"-.02em",marginBottom:4}}>AI Recommendations</div>
            <p style={{fontSize:".875rem",color:"var(--m2)",fontWeight:300}}>Prioritised action items to improve your ATS score.</p>
          </div>

          {/* priority counts */}
          <div className="g3">
            {[
              {p:"high",   l:"High Priority",   count:SUGGESTIONS_DATA.filter(s=>s.priority==="high").length,   color:"var(--red)",   bg:"rgba(239,68,68,.08)",  border:"rgba(239,68,68,.2)"},
              {p:"medium", l:"Medium Priority",  count:SUGGESTIONS_DATA.filter(s=>s.priority==="medium").length, color:"var(--amber)", bg:"rgba(245,158,11,.08)", border:"rgba(245,158,11,.2)"},
              {p:"low",    l:"Low Priority",     count:SUGGESTIONS_DATA.filter(s=>s.priority==="low").length,    color:"var(--m2)",    bg:"rgba(255,255,255,.04)", border:"var(--b1)"},
            ].map(r => (
              <div key={r.p} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",background:r.bg,border:`1px solid ${r.border}`,borderRadius:10}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:r.color,flexShrink:0,boxShadow:`0 0 8px ${r.color}`}}/>
                <div>
                  <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"1.3rem",fontWeight:700,color:r.color,lineHeight:1}}>{r.count}</div>
                  <div style={{fontSize:".62rem",color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginTop:3}}>{r.l}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="ch">
              <div className="ct"><Sparkles size={13} style={{color:"var(--accent)"}}/>Action Items</div>
              <span style={{fontSize:".72rem",color:"var(--m2)"}}>{SUGGESTIONS_DATA.length} recommendations</span>
            </div>
            <div className="cb">
              {SUGGESTIONS_DATA.map((s, i) => (
                <div key={i} className="sug" style={{background:pBg(s.priority),borderColor:pBorder(s.priority)}}
                  onClick={() => setExpanded(expanded === i ? null : i)}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                    <div style={{flex:1}}>
                      <div className="sug-prio" style={{color:pColor(s.priority),background:pBg(s.priority),borderColor:pBorder(s.priority)}}>
                        {s.priority==="high"&&<AlertCircle size={8}/>}
                        {s.priority==="medium"&&<TrendingUp size={8}/>}
                        {s.priority==="low"&&<Zap size={8}/>}
                        {s.priority} priority
                      </div>
                      <div className="sug-title">{s.title}</div>
                      {expanded === i && <p className="sug-body">{s.body}</p>}
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                        <span className="sug-tag">{s.tag}</span>
                        {expanded === i && <CopyBtn text={`${s.title}: ${s.body}`}/>}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:pBg(s.priority),border:`1px solid ${pBorder(s.priority)}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:".75rem",color:pColor(s.priority)}}>{i+1}</div>
                      {expanded===i ? <ChevronUp size={14} style={{color:"var(--m2)"}}/> : <ChevronDown size={14} style={{color:"var(--m2)"}}/>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* re-upload CTA */}
          <div style={{background:"linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.07))",border:"1px solid rgba(99,102,241,.2)",borderRadius:12,padding:"24px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}>
            <div>
              <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"1rem",fontWeight:700,marginBottom:4}}>Applied these suggestions?</div>
              <p style={{fontSize:".875rem",color:"var(--m2)",fontWeight:300}}>Re-upload your updated resume and watch your score climb.</p>
            </div>
            <Link href="/dashboard">
              <button className="btn btn-p" style={{flexShrink:0}}><RefreshCw size={13}/>Re-upload Resume</button>
            </Link>
          </div>
        </div>
      )}

      {/* ════════ JOB MATCH ════════ */}
      {tab==="jobmatch" && (
        <div className="page">
          <div style={{marginBottom:22}}>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"1.2rem",fontWeight:700,letterSpacing:"-.02em",marginBottom:4}}>Job Description Matching</div>
            <p style={{fontSize:".875rem",color:"var(--m2)",fontWeight:300}}>Paste any job description and our AI will score how well your resume matches it.</p>
          </div>

          <div className="g2">
            {/* input side */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div className="card" style={{marginBottom:0}}>
                <div className="ch"><div className="ct"><FileText size={13}/>Paste Job Description</div></div>
                <div className="cb">
                  <textarea className="inp" value={jd} onChange={e => { setJd(e.target.value); setJdPasted(e.target.value.length > 50); }}
                    placeholder="Paste the full job description here — requirements, responsibilities, and qualifications…"/>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
                    <span style={{fontSize:".72rem",color:jdPasted?"var(--green)":"var(--muted)"}}>{jd.length > 0 && `${jd.split(" ").filter(Boolean).length} words`}</span>
                    <button className="btn btn-p" onClick={handleJobMatch} disabled={matching || !jd.trim()}>
                      {matching ? <><Loader2 size={13} style={{animation:"spin .8s linear infinite"}}/>Analyzing…</> : <><Play size={13}/>Match Job</>}
                    </button>
                  </div>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              </div>

              {!jobMatch && (
                <div className="ibox" style={{marginBottom:0}}>
                  <Info size={13} style={{color:"var(--accent)",flexShrink:0,marginTop:1}}/>
                  <p>We'll compare every skill, keyword, and requirement from the posting against your resume and return a detailed match report in seconds.</p>
                </div>
              )}
            </div>

            {/* result side */}
            <div>
              {jobMatch ? (
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div className="jm-score">
                    <div style={{fontSize:".72rem",color:"var(--m2)",fontWeight:500,textTransform:"uppercase",letterSpacing:".08em"}}>Match Score</div>
                    <ScoreRing score={jobMatch.matchScore} size={120}/>
                    <div style={{fontSize:".8rem",color:"var(--m2)",fontWeight:300}}>
                      {jobMatch.matchScore>=80?"Strong match — apply with confidence":jobMatch.matchScore>=60?"Good match — a few gaps to fill":"Weak match — significant gaps"}
                    </div>
                  </div>
                  <div className="card" style={{marginBottom:0}}>
                    <div className="ch"><div className="ct"><CheckCircle2 size={13} style={{color:"var(--green)"}}/>Matched Skills</div></div>
                    <div className="cb"><div className="tags-wrap">{jobMatch.matchedSkills.map(s=><span key={s} className="stag stag-g">{s}</span>)}</div></div>
                  </div>
                  <div className="card" style={{marginBottom:0}}>
                    <div className="ch"><div className="ct"><XCircle size={13} style={{color:"var(--red)"}}/>Missing Skills</div></div>
                    <div className="cb"><div className="tags-wrap">{jobMatch.missingSkills.map(s=><span key={s} className="stag stag-r">{s}</span>)}</div></div>
                  </div>
                  <div className="card" style={{marginBottom:0}}>
                    <div className="ch"><div className="ct"><Lightbulb size={13} style={{color:"var(--amber)"}}/>Recommendations</div></div>
                    <div className="cb">
                      {jobMatch.recommendations.map((r,i)=>(
                        <div key={i} className="sw"><span className="sw-ico">💡</span><span className="sw-txt">{r}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",minHeight:280,background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:12,gap:12,padding:28,textAlign:"center"}}>
                  <div style={{width:52,height:52,borderRadius:12,background:"rgba(99,102,241,.1)",border:"1px solid rgba(99,102,241,.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <TrendingUp size={22} style={{color:"var(--accent)"}}/>
                  </div>
                  <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:600,fontSize:".95rem"}}>Results will appear here</div>
                  <p style={{fontSize:".8rem",color:"var(--m2)",fontWeight:300,maxWidth:220,lineHeight:1.65}}>Paste a job description on the left and click Match Job to see your personalised score.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ AI REWRITE ════════ */}
      {tab==="rewrite" && (
        <div className="page">
          <div style={{marginBottom:22}}>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"1.2rem",fontWeight:700,letterSpacing:"-.02em",marginBottom:4,display:"flex",alignItems:"center",gap:10}}>
              AI Resume Rewrite
              <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(245,158,11,.12)",border:"1px solid rgba(245,158,11,.22)",color:"var(--amber)",fontSize:".62rem",fontWeight:700,padding:"3px 9px",borderRadius:100,letterSpacing:".08em",textTransform:"uppercase"}}>
                <Crown size={9}/>Pro Feature
              </span>
            </div>
            <p style={{fontSize:".875rem",color:"var(--m2)",fontWeight:300}}>Our AI rewrites your resume targeted to a specific role — optimised for ATS and human readers.</p>
          </div>

          <div className="g2">
            {/* controls */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div className="card" style={{marginBottom:0}}>
                <div className="ch"><div className="ct"><Wand2 size={13}/>Rewrite Settings</div></div>
                <div className="cb" style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div>
                    <label style={{fontSize:".72rem",fontWeight:500,color:"var(--m2)",letterSpacing:".02em",display:"block",marginBottom:6}}>Target Role</label>
                    <input className="inp" style={{height:42}} value={targetRole} onChange={e=>setTargetRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer"/>
                  </div>
                  <div>
                    <label style={{fontSize:".72rem",fontWeight:500,color:"var(--m2)",letterSpacing:".02em",display:"block",marginBottom:7}}>Writing Tone</label>
                    <div className="sel-g">
                      {["professional","confident","concise"].map(t=>(
                        <button key={t} className={`sel-o${rwTone===t?" on":""}`} onClick={()=>setRwTone(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:".72rem",fontWeight:500,color:"var(--m2)",letterSpacing:".02em",display:"block",marginBottom:7}}>Resume Length</label>
                    <div className="sel-g">
                      {["concise","standard","detailed"].map(t=>(
                        <button key={t} className={`sel-o${rwLength===t?" on":""}`} onClick={()=>setRwLength(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:".82rem",fontWeight:500,marginBottom:2}}>Highlight improvements</div>
                      <div style={{fontSize:".72rem",color:"var(--m2)",fontWeight:300}}>Show what changed vs original</div>
                    </div>
                    <Toggle checked={rwHighlight} onChange={setRwHighlight}/>
                  </div>
                  <button className="btn btn-p" style={{width:"100%",justifyContent:"center"}} onClick={handleRewrite} disabled={rewriting||!targetRole.trim()}>
                    {rewriting ? <><Loader2 size={13} style={{animation:"spin .8s linear infinite"}}/>Rewriting…</> : <><Wand2 size={13}/>Rewrite Resume</>}
                  </button>
                </div>
              </div>

              {/* progress steps */}
              {(rewriting || rwSections.length > 0) && (
                <div className="card" style={{marginBottom:0}}>
                  <div className="ch">
                    <div className="ct"><Sparkles size={13} style={{color:"var(--accent)"}}/>Progress</div>
                    {rewriting && <span style={{fontSize:".72rem",color:"var(--accent)"}}>{rwProgress}%</span>}
                  </div>
                  <div className="cb">
                    {["Professional Summary","Skills Section","Experience Bullets","Education","Final Polish"].map((step,i)=>{
                      const done = rwSections.includes(step);
                      const active = rewriting && rwSections.length === i;
                      return (
                        <div key={step} className={`rw-step${done?" done":""}`}>
                          <span className="rw-ico">
                            {done ? <CheckCircle2 size={14} style={{color:"var(--accent)"}}/> : active ? <Loader2 size={14} style={{animation:"spin .8s linear infinite",color:"var(--amber)"}}/> : <div style={{width:14,height:14,borderRadius:"50%",border:"1px solid var(--b2)"}}/>}
                          </span>
                          <span style={{color: done ? "var(--text)" : "var(--m2)"}}>{step}</span>
                        </div>
                      );
                    })}
                    {!rewriting && rwProgress === 100 && (
                      <div style={{marginTop:10,height:5,background:"rgba(255,255,255,.07)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:"100%",background:"linear-gradient(90deg,var(--accent),var(--a2))",borderRadius:3}}/>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* output */}
            <div>
              {rewritten ? (
                <div className="card" style={{marginBottom:0,height:"100%"}}>
                  <div className="ch">
                    <div className="ct"><FileText size={13}/>Rewritten Resume</div>
                    <div style={{display:"flex",gap:8}}>
                      <CopyBtn text={rewritten} style={{padding:"5px 10px",background:"var(--s3)",border:"1px solid var(--b1)",borderRadius:6}}/>
                      <button className="btn btn-g" style={{fontSize:".75rem",padding:"5px 12px"}}><Download size={11}/>Export</button>
                    </div>
                  </div>
                  <div className="cb">
                    <pre style={{whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif",fontSize:".82rem",lineHeight:1.75,color:"var(--m2)",background:"var(--s2)",border:"1px solid var(--b1)",borderRadius:9,padding:16,maxHeight:500,overflowY:"auto"}}>
                      {rewritten}
                    </pre>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",minHeight:360,background:"var(--s1)",border:"1px dashed var(--b2)",borderRadius:12,gap:14,padding:28,textAlign:"center"}}>
                  <div style={{width:52,height:52,borderRadius:12,background:"rgba(139,92,246,.1)",border:"1px solid rgba(139,92,246,.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Wand2 size={22} style={{color:"var(--a2)"}}/>
                  </div>
                  <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:600,fontSize:".95rem"}}>Your rewritten resume</div>
                  <p style={{fontSize:".8rem",color:"var(--m2)",fontWeight:300,maxWidth:220,lineHeight:1.7}}>Configure your settings, enter a target role, and hit Rewrite. The full resume will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}