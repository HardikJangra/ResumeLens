"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, Download, RefreshCw, Share2,
  CheckCircle2, XCircle, AlertCircle, Lightbulb,
  TrendingUp, Copy, Check, FileText,
  BarChart2, Wand2,
  Play, Loader2, Crown,
  Info
} from "lucide-react";

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
  const color = score >= 80 ? "#16704F" : score >= 60 ? "#A46118" : "#A33B32";
  const [off, setOff] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setOff(circ - (score / 100) * circ), 80);
    return () => clearTimeout(t);
  }, [score, circ]);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(45,40,32,.08)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 8px ${color}55)` }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"'Source Serif 4',serif", fontSize:"2.1rem", fontWeight:800, color, lineHeight:1, letterSpacing:"-.04em" }}>
          <Counter to={score}/>
        </span>
        <span style={{ fontSize:".6rem", color:"var(--muted)", textTransform:"uppercase", letterSpacing:".1em", marginTop:2 }}>/ 100</span>
      </div>
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
      style={{ width:40, height:22, borderRadius:11, background: checked ? "var(--accent)" : "var(--s3)", border:"none", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0, boxShadow: checked ? "0 8px 18px rgba(15,118,110,.2)" : "inset 0 0 0 1px var(--b1)" }}>
      <span style={{ position:"absolute", top:2, left: checked ? 20 : 2, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .18s cubic-bezier(.4,0,.2,1)", boxShadow:"0 1px 4px rgba(45,40,32,.18)" }}/>
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

/* ═════════════════════════ MAIN COMPONENT ════════════════════════════ */
export default function ResumeDetailPage() {
  const params  = useParams();
  const resumeId = params?.id as string;

  const [resume,  setResume]  = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview"|"rewrite"|"jobmatch">("overview");

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
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F6F1E8;font-family:'Instrument Sans',sans-serif;-webkit-font-smoothing:antialiased}
        .spin{width:36px;height:36px;border-radius:50%;border:3px solid rgba(15,118,110,.18);border-top-color:#0F766E;animation:rot .8s linear infinite}
        @keyframes rot{to{transform:rotate(360deg)}}
      `}</style>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, background:"#F6F1E8" }}>
        <div className="spin"/>
        <p style={{ fontSize:".875rem", color:"#5F675F", fontFamily:"'Instrument Sans',sans-serif" }}>Loading resume analysis…</p>
      </div>
    </>
  );

  if (!resume) return (
    <div style={{ minHeight:"100vh", background:"#F6F1E8", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:"#A33B32", fontFamily:"Instrument Sans, sans-serif" }}>
      <AlertCircle size={32}/>
      <p>Resume not found</p>
      <Link href="/dashboard"><span style={{ color:"#0F766E", textDecoration:"underline", fontSize:".875rem" }}>← Back to Dashboard</span></Link>
    </div>
  );

  if (resume.status === "Processing") return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F6F1E8;font-family:'Instrument Sans',sans-serif;-webkit-font-smoothing:antialiased}
        .prog{height:3px;background:rgba(15,118,110,.14);border-radius:2px;overflow:hidden;width:220px}
        .prog-inner{height:100%;background:linear-gradient(90deg,#0F766E,#B86B4B);border-radius:2px;animation:prog 2s ease-in-out infinite}
        @keyframes prog{0%{width:0%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}
      `}</style>
      <div style={{ minHeight:"100vh", background:"#F6F1E8", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
        <div style={{ width:52, height:52, borderRadius:12, background:"rgba(15,118,110,.10)", border:"1px solid rgba(15,118,110,.22)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Sparkles size={22} style={{ color:"#0F766E" }}/>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:"1.1rem", fontWeight:700, color:"#17201C", marginBottom:6 }}>Analyzing your resume…</div>
          <p style={{ fontSize:".82rem", color:"#81786B" }}>Our AI is reading every line. This takes ~20 seconds.</p>
        </div>
        <div className="prog"><div className="prog-inner"/></div>
      </div>
    </>
  );

  const a = resume.aiAnalysis ?? MOCK_RESUME.aiAnalysis!;
  const uploadDate = new Date(resume.uploadedAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

  const TABS = [
    { id:"overview",   label:"Overview",        icon:BarChart2  },
    { id:"jobmatch",   label:"Job Match",         icon:TrendingUp },
    { id:"rewrite",    label:"AI Rewrite",        icon:Wand2      },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#F6F1E8;--s1:#FFFBF2;--s2:#F1E8DA;--s3:#E7D9C6;
          --b1:rgba(45,40,32,0.10);--b2:rgba(45,40,32,0.18);
          --text:#17201C;--muted:#81786B;--m2:#5F675F;
          --accent:#0F766E;--a2:#B86B4B;
          --green:#16704F;--amber:#A46118;--red:#A33B32;
        }
        html,body{min-height:100%;background:var(--bg);color:var(--text);font-family:'Instrument Sans',sans-serif;-webkit-font-smoothing:antialiased}
        a{text-decoration:none;color:inherit}
        button{font-family:'Instrument Sans',sans-serif}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(45,40,32,.18);border-radius:2px}

        /* TOPBAR */
        .topbar{position:sticky;top:0;z-index:100;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:rgba(246,241,232,.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--b1)}
        .tb-l{display:flex;align-items:center;gap:12px}
        .tb-r{display:flex;align-items:center;gap:8px}
        .back-btn{display:inline-flex;align-items:center;gap:6px;font-size:.82rem;color:var(--m2);background:none;border:1px solid transparent;padding:6px 12px;border-radius:7px;cursor:pointer;transition:all .15s}
        .back-btn:hover{color:var(--text);background:rgba(15,118,110,.07);border-color:var(--b1)}
        .file-pill{display:flex;align-items:center;gap:7px;padding:5px 12px;background:var(--s2);border:1px solid var(--b1);border-radius:7px;font-size:.78rem;color:var(--m2)}
        .file-pill strong{color:var(--text);font-weight:500}
        .ic-btn{width:34px;height:34px;border-radius:8px;border:1px solid var(--b1);background:none;display:flex;align-items:center;justify-content:center;color:var(--m2);cursor:pointer;transition:all .15s}
        .ic-btn:hover{background:rgba(15,118,110,.07);border-color:var(--b2);color:var(--text)}
        .dl-btn{display:inline-flex;align-items:center;gap:7px;background:var(--accent);color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:.82rem;font-weight:500;cursor:pointer;box-shadow:0 1px 2px rgba(45,40,32,.14);transition:all .2s}
        .dl-btn:hover{box-shadow:0 12px 28px rgba(15,118,110,.22);transform:translateY(-1px)}

        /* TABS */
        .tabs{display:flex;align-items:center;gap:1px;padding:0 28px;background:var(--s1);border-bottom:1px solid var(--b1);overflow-x:auto}
        .tabs::-webkit-scrollbar{height:0}
        .tab{padding:13px 15px;font-size:.82rem;color:var(--m2);border:none;background:none;cursor:pointer;transition:color .15s;position:relative;display:flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0}
        .tab:hover{color:var(--text)}
        .tab.on{color:var(--text);font-weight:500}
        .tab.on::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:var(--accent);border-radius:2px 2px 0 0}
        .tab-pro{display:inline-flex;align-items:center;gap:3px;background:rgba(164,97,24,.1);border:1px solid rgba(164,97,24,.2);color:var(--amber);font-size:.55rem;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:4px;letter-spacing:.05em;text-transform:uppercase}

        /* PAGE */
        .page{padding:28px;max-width:1160px;margin:0 auto}

        /* CARDS */
        .card{background:var(--s1);border:1px solid var(--b1);border-radius:8px;overflow:hidden;transition:border-color .2s;margin-bottom:16px}
        .card:hover{border-color:var(--b2)}
        .ch{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--b1)}
        .ct{font-family:'Instrument Sans',sans-serif;font-size:.88rem;font-weight:600;letter-spacing:-.01em;display:flex;align-items:center;gap:7px}
        .cb{padding:20px}

        /* GRIDS */
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px}
        .g13{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}

        /* SKILL TAGS */
        .stag{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:7px;font-size:.78rem;font-weight:500;border:1px solid;cursor:default;transition:all .15s}
        .stag:hover{transform:translateY(-1px)}
        .stag-g{background:rgba(22,112,79,.08);border-color:rgba(22,112,79,.2);color:var(--green)}
        .stag-r{background:rgba(163,59,50,.08);border-color:rgba(163,59,50,.2);color:var(--red)}
        .stag-a{background:rgba(164,97,24,.08);border-color:rgba(164,97,24,.2);color:var(--amber)}
        .stag-b{background:rgba(15,118,110,.08);border-color:rgba(15,118,110,.22);color:var(--accent)}
        .tags-wrap{display:flex;flex-wrap:wrap;gap:8px}

        /* S/W ITEMS */
        .sw{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;border-radius:9px;border:1px solid var(--b1);background:var(--s2);margin-bottom:8px;transition:all .15s}
        .sw:last-child{margin-bottom:0}
        .sw:hover{border-color:var(--b2);transform:translateX(3px)}
        .sw-ico{font-size:1rem;flex-shrink:0;line-height:1.5}
        .sw-txt{font-size:.855rem;line-height:1.65;font-weight:300}

        /* TAGS */
        .tag{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:100px;font-size:.66rem;font-weight:500;border:1px solid}
        .tg{background:rgba(22,112,79,.1);border-color:rgba(22,112,79,.2);color:var(--green)}
        .ta{background:rgba(164,97,24,.1);border-color:rgba(164,97,24,.2);color:var(--amber)}
        .tb{background:rgba(15,118,110,.1);border-color:rgba(15,118,110,.25);color:var(--accent)}
        .tr2{background:rgba(163,59,50,.1);border-color:rgba(163,59,50,.2);color:var(--red)}

        /* INPUTS */
        .inp{background:var(--s2);border:1px solid var(--b1);border-radius:8px;padding:10px 14px;font-size:.875rem;color:var(--text);outline:none;transition:border-color .2s,box-shadow .2s;width:100%;font-family:'Instrument Sans',sans-serif}
        .inp::placeholder{color:var(--muted)}
        .inp:focus{border-color:rgba(15,118,110,.38);box-shadow:0 0 0 3px rgba(15,118,110,.10)}
        textarea.inp{resize:vertical;min-height:140px;line-height:1.65}

        /* BUTTONS */
        .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:.855rem;font-weight:500;cursor:pointer;transition:all .15s;border:none;font-family:'Instrument Sans',sans-serif}
        .btn-p{background:var(--accent);color:#fff;box-shadow:0 1px 2px rgba(45,40,32,.14)}
        .btn-p:hover{box-shadow:0 12px 26px rgba(15,118,110,.22);transform:translateY(-1px)}
        .btn-g{background:var(--s3);color:var(--m2);border:1px solid var(--b1)}
        .btn-g:hover{background:rgba(255,251,242,.75);color:var(--text);border-color:var(--b2)}
        .btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;box-shadow:none!important}

        /* SELECT PILL */
        .sel-g{display:inline-flex;background:var(--s2);border:1px solid var(--b1);border-radius:7px;padding:2px}
        .sel-o{padding:5px 13px;border-radius:5px;font-size:.78rem;font-weight:500;cursor:pointer;transition:all .15s;border:none;background:none;color:var(--m2)}
        .sel-o.on{background:var(--s1);color:var(--text);box-shadow:0 1px 4px rgba(45,40,32,.12)}

        /* REWRITE PROGRESS */
        .rw-step{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;background:var(--s2);border:1px solid var(--b1);margin-bottom:8px;font-size:.82rem}
        .rw-step.done{border-color:rgba(15,118,110,.22);background:rgba(15,118,110,.07)}
        .rw-step.done .rw-ico{color:var(--accent)}

        /* PRO LOCK */
        .pro-gate{background:linear-gradient(135deg,rgba(164,97,24,.08),rgba(184,107,75,.04));border:1px solid rgba(164,97,24,.2);border-radius:12px;padding:28px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}

        /* INFO BOX */
        .ibox{display:flex;align-items:flex-start;gap:9px;padding:11px 13px;background:rgba(15,118,110,.07);border:1px solid rgba(15,118,110,.18);border-radius:8px;margin-bottom:14px}
        .ibox p{font-size:.78rem;color:var(--m2);line-height:1.6}

        /* JOB MATCH SCORE RING AREA */
        .jm-score{display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px 20px;background:var(--s2);border:1px solid var(--b1);border-radius:11px}

        /* RESPONSIVE */
        @media(max-width:1024px){.g13{grid-template-columns:1fr}}
        @media(max-width:768px){
          .g2{grid-template-columns:1fr}.g3{grid-template-columns:1fr}
          .page{padding:16px}.topbar{padding:0 14px}.tabs{padding:0 14px}
          .file-pill{display:none}
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
                  <div style={{fontSize:".68rem",color:"var(--muted)",marginTop:2}}>{a.skillsMissing.length} keywords the role expects</div>
                </div>
                <span className="tag tr2">{a.skillsMissing.length} gaps</span>
              </div>
              <div className="cb"><div className="tags-wrap">
                {a.skillsMissing.map(s => <span key={s} className="stag stag-r"><XCircle size={9}/>{s}</span>)}
              </div></div>
            </div>
          </div>

          {/* strengths/weaknesses */}
          <div className="g13">
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
      )}

      {/* ════════ JOB MATCH ════════ */}
      {tab==="jobmatch" && (
        <div className="page">
          <div style={{marginBottom:22}}>
            <div style={{fontFamily:"'Source Serif 4',serif",fontSize:"1.2rem",fontWeight:700,letterSpacing:"-.02em",marginBottom:4}}>Job Description Matching</div>
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
                  <div style={{width:52,height:52,borderRadius:12,background:"rgba(15,118,110,.1)",border:"1px solid rgba(15,118,110,.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <TrendingUp size={22} style={{color:"var(--accent)"}}/>
                  </div>
                  <div style={{fontFamily:"'Instrument Sans',sans-serif",fontWeight:600,fontSize:".95rem"}}>Results will appear here</div>
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
            <div style={{fontFamily:"'Source Serif 4',serif",fontSize:"1.2rem",fontWeight:700,letterSpacing:"-.02em",marginBottom:4,display:"flex",alignItems:"center",gap:10}}>
              AI Resume Rewrite
              <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(164,97,24,.12)",border:"1px solid rgba(164,97,24,.22)",color:"var(--amber)",fontSize:".62rem",fontWeight:700,padding:"3px 9px",borderRadius:100,letterSpacing:".08em",textTransform:"uppercase"}}>
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
                      <div style={{marginTop:10,height:5,background:"rgba(45,40,32,.08)",borderRadius:3,overflow:"hidden"}}>
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
                    <pre style={{whiteSpace:"pre-wrap",fontFamily:"'Instrument Sans',sans-serif",fontSize:".82rem",lineHeight:1.75,color:"var(--m2)",background:"var(--s2)",border:"1px solid var(--b1)",borderRadius:9,padding:16,maxHeight:500,overflowY:"auto"}}>
                      {rewritten}
                    </pre>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",minHeight:360,background:"var(--s1)",border:"1px dashed var(--b2)",borderRadius:12,gap:14,padding:28,textAlign:"center"}}>
                  <div style={{width:52,height:52,borderRadius:12,background:"rgba(184,107,75,.1)",border:"1px solid rgba(184,107,75,.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Wand2 size={22} style={{color:"var(--a2)"}}/>
                  </div>
                  <div style={{fontFamily:"'Instrument Sans',sans-serif",fontWeight:600,fontSize:".95rem"}}>Your rewritten resume</div>
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
