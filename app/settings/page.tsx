"use client";

import { useState, useRef } from "react";
import {
  User, Shield, CreditCard, AlertTriangle, Bell, Palette,
  ChevronRight, Check, X, Eye, EyeOff, Upload, Zap,
  Lock, Globe, Smartphone, LogOut, Trash2, Download,
  CheckCircle2, ExternalLink, Info, Star, Crown, Sparkles,
  BarChart2, Home, FileText, Settings
} from "lucide-react";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";

/* ── Toggle Switch ─────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch" aria-checked={checked}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? "var(--accent)" : "rgba(255,255,255,0.1)",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background .2s, box-shadow .2s", flexShrink: 0,
        boxShadow: checked ? "0 0 14px rgba(99,102,241,0.45)" : "none",
      }}
    >
      <span style={{
        position: "absolute", top: 3,
        left: checked ? 23 : 3, width: 18, height: 18,
        borderRadius: "50%", background: "#fff",
        transition: "left .18s cubic-bezier(.4,0,.2,1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
      }} />
    </button>
  );
}

/* ── Plan definitions ──────────────────────────────────────────────────── */
const PLANS = [
  {
    id: "free", name: "Free", mo: "$0", yr: "$0", badge: null, badgeColor: "",
    desc: "Get started with basic resume analysis",
    has: ["3 uploads / month", "Basic ATS scoring", "Keyword extraction", "PDF download"],
    missing: ["Job-match scoring", "Unlimited uploads", "Cover letter AI", "Priority support"],
    cta: "Current Plan", ctaStyle: "ghost",
  },
  {
    id: "pro", name: "Pro", mo: "$12", yr: "$8", badge: "Most Popular", badgeColor: "accent",
    desc: "Everything you need to land more interviews",
    has: ["Unlimited uploads", "Advanced ATS scoring", "Job-match scoring", "Keyword gap analysis", "Cover letter AI", "Priority support"],
    missing: [],
    cta: "Upgrade to Pro", ctaStyle: "primary",
  },
  {
    id: "team", name: "Team", mo: "$29", yr: "$20", badge: "Best Value", badgeColor: "amber",
    desc: "For career coaches and recruiting teams",
    has: ["Everything in Pro", "5 team members", "Shared resume vault", "Analytics dashboard", "API access", "Dedicated support"],
    missing: [],
    cta: "Get Team", ctaStyle: "amber",
  },
];

/* ── Sidebar nav items ─────────────────────────────────────────────────── */
const NAV = [
  { id: "profile",        label: "Profile",         icon: User },
  { id: "account",        label: "Account",          icon: Globe },
  { id: "notifications",  label: "Notifications",    icon: Bell },
  { id: "subscription",   label: "Subscription",     icon: CreditCard },
  { id: "security",       label: "Security",         icon: Shield },
  { id: "appearance",     label: "Appearance",       icon: Palette },
  { id: "danger",         label: "Danger Zone",      icon: AlertTriangle },
];

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  /* state */
  const [section, setSection]   = useState("profile");
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);

  /* profile */
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName,  setLastName]  = useState(user?.lastName  ?? "");
  const [jobTitle,  setJobTitle]  = useState("Software Engineer");
  const [location,  setLocation]  = useState("San Francisco, CA");
  const [website,   setWebsite]   = useState("");
  const [bio,       setBio]       = useState("Passionate engineer looking for new opportunities.");
  const [targetRole,setTargetRole]= useState("Software Engineer");
  const [expLevel,  setExpLevel]  = useState("Mid Level (3–5 yrs)");
  const [industry,  setIndustry]  = useState("Technology");
  const [workType,  setWorkType]  = useState("Full-time");
  const [avatar,    setAvatar]    = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* notifications */
  const [notifs, setNotifs] = useState({
    emailAnalysis:  true,
    emailWeekly:    false,
    emailTips:      true,
    emailMarketing: false,
    pushAnalysis:   true,
    pushMilestone:  true,
    pushReminders:  false,
  });

  /* account */
  const [lang,          setLang]          = useState("en");
  const [tz,            setTz]            = useState("America/Los_Angeles");
  const [pubProfile,    setPubProfile]    = useState(false);
  const [optOutAnalytics,setOptOut]       = useState(false);

  /* security */
  const [mfa,         setMfa]         = useState(false);
  const [curPw,       setCurPw]       = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confPw,      setConfPw]      = useState("");
  const [showCur,     setShowCur]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const sessions = [
    { id: 1, device: "Chrome · macOS",     loc: "San Francisco, CA", ago: "Active now",  cur: true  },
    { id: 2, device: "Safari · iPhone 15", loc: "San Francisco, CA", ago: "2 hours ago", cur: false },
    { id: 3, device: "Firefox · Windows",  loc: "New York, NY",      ago: "5 days ago",  cur: false },
  ];

  /* subscription */
  const [billing,    setBilling]   = useState<"mo"|"yr">("mo");
  const currentPlan = "free";

  /* appearance */
  const [accent, setAccent] = useState("indigo");
  const [density,setDensity]= useState<"compact"|"default"|"relaxed">("default");

  /* danger */
  const [delConfirm,  setDelConfirm]  = useState("");
  const [delModal,    setDelModal]    = useState(false);

  /* helpers */
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const saveableSections = ["profile","account","notifications","appearance"];

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 750));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const pwScore = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)         s++;
    if (/[A-Z]/.test(pw))       s++;
    if (/[0-9]/.test(pw))       s++;
    if (/[^A-Za-z0-9]/.test(pw))s++;
    return s;
  };
  const ps = pwScore(newPw);
  const psLabel = ["","Weak","Fair","Good","Strong"][ps];
  const psColor = ["","var(--red)","var(--amber)","#60A5FA","var(--green)"][ps];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#0A0A0F; --s1:#111118; --s2:#16161F; --s3:#1C1C28;
          --b1:rgba(255,255,255,.06); --b2:rgba(255,255,255,.11);
          --text:#F0F0F5; --muted:#6B6B80; --m2:#9090A8;
          --accent:#6366F1; --a2:#8B5CF6;
          --green:#22C55E; --amber:#F59E0B; --red:#EF4444;
        }
        html,body{height:100%;background:var(--bg);color:var(--text);
          font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        a{text-decoration:none;color:inherit}
        button,input,select,textarea{font-family:'DM Sans',sans-serif}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.09);border-radius:2px}

        /* ── shell ── */
        .shell{display:flex;min-height:100vh}

        /* ── sidebar ── */
        .snav{
          width:248px;flex-shrink:0;background:var(--s1);
          border-right:1px solid var(--b1);
          position:sticky;top:0;height:100vh;
          overflow-y:auto;display:flex;flex-direction:column;
        }
        .snav-top{padding:18px 16px 14px;border-bottom:1px solid var(--b1)}
        .back-link{display:inline-flex;align-items:center;gap:5px;
          font-size:.78rem;color:var(--m2);background:none;border:none;
          cursor:pointer;padding:0;margin-bottom:12px;transition:color .15s}
        .back-link:hover{color:var(--text)}
        .snav-title{font-family:'Bricolage Grotesque',sans-serif;
          font-weight:700;font-size:1rem;letter-spacing:-.02em}
        .snav-sub{font-size:.7rem;color:var(--muted);margin-top:2px}
        .snav-body{padding:10px 10px;flex:1}
        .snav-lbl{font-size:.58rem;font-weight:600;letter-spacing:.14em;
          text-transform:uppercase;color:var(--muted);padding:14px 10px 5px}
        .ni{
          display:flex;align-items:center;gap:10px;
          padding:9px 12px;border-radius:8px;
          font-size:.875rem;color:var(--m2);cursor:pointer;
          transition:all .15s;margin-bottom:2px;
          border:none;background:none;width:100%;text-align:left;
          position:relative;
        }
        .ni:hover{color:var(--text);background:rgba(255,255,255,.05)}
        .ni.on{color:var(--text);background:rgba(99,102,241,.12);font-weight:500}
        .ni.on::before{
          content:'';position:absolute;left:0;top:22%;bottom:22%;
          width:3px;background:var(--accent);border-radius:0 2px 2px 0;
        }
        .ni.on svg{color:var(--accent)}
        .ni.red{color:var(--red)!important}
        .ni.red:hover{background:rgba(239,68,68,.08)!important}
        .snav-foot{padding:12px 10px;border-top:1px solid var(--b1)}

        /* upgrade nudge */
        .nudge{
          background:rgba(99,102,241,.08);
          border:1px solid rgba(99,102,241,.18);
          border-radius:9px;padding:12px 14px;margin-bottom:10px;
        }
        .nudge-row{display:flex;align-items:center;gap:6px;
          font-size:.75rem;font-weight:600;margin-bottom:4px;color:var(--text)}
        .nudge p{font-size:.68rem;color:var(--m2);line-height:1.5;margin-bottom:8px}

        /* user chip */
        .uchip{
          display:flex;align-items:center;gap:10px;
          padding:10px 12px;border-radius:8px;
          background:var(--s2);border:1px solid var(--b1);
        }
        .av{
          width:30px;height:30px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,var(--accent),var(--a2));
          display:flex;align-items:center;justify-content:center;
          font-size:.72rem;font-weight:600;color:#fff;overflow:hidden;
        }
        .av img{width:100%;height:100%;object-fit:cover}
        .u-n{font-size:.8rem;font-weight:500;overflow:hidden;
          text-overflow:ellipsis;white-space:nowrap}
        .u-p{font-size:.62rem;color:var(--muted)}

        /* ── main area ── */
        .smain{flex:1;overflow-y:auto}

        /* topbar */
        .sbar{
          position:sticky;top:0;z-index:50;height:60px;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 32px;
          background:rgba(10,10,15,.88);backdrop-filter:blur(18px);
          border-bottom:1px solid var(--b1);
        }
        .sbar-l{display:flex;align-items:center;gap:0}
        .sbar-title{font-family:'Bricolage Grotesque',sans-serif;
          font-weight:600;font-size:1rem;letter-spacing:-.01em}
        .sbar-crumb{display:flex;align-items:center;gap:4px;
          font-size:.7rem;color:var(--muted);margin-top:2px}

        /* save button */
        .sbtn{
          display:inline-flex;align-items:center;gap:7px;
          background:linear-gradient(135deg,var(--accent),var(--a2));
          color:#fff;border:none;border-radius:8px;
          padding:9px 20px;font-size:.875rem;font-weight:500;cursor:pointer;
          box-shadow:0 1px 3px rgba(0,0,0,.4),0 0 0 1px rgba(99,102,241,.35);
          transition:all .2s;min-width:114px;justify-content:center;
        }
        .sbtn:hover{box-shadow:0 4px 20px rgba(99,102,241,.45);transform:translateY(-1px)}
        .sbtn:disabled{opacity:.55;cursor:not-allowed;transform:none!important;box-shadow:none!important}
        .sbtn.done{background:linear-gradient(135deg,#059669,#10B981)!important;
          box-shadow:0 0 18px rgba(16,185,129,.3)!important}

        /* ── page content ── */
        .page{padding:32px;max-width:860px}
        .ph{margin-bottom:26px}
        .ph h2{font-family:'Bricolage Grotesque',sans-serif;
          font-size:1.25rem;font-weight:700;letter-spacing:-.02em;margin-bottom:5px}
        .ph p{font-size:.875rem;color:var(--m2);font-weight:300;line-height:1.65}

        /* ── card ── */
        .card{
          background:var(--s1);border:1px solid var(--b1);
          border-radius:12px;overflow:hidden;
          margin-bottom:16px;transition:border-color .2s;
        }
        .card:hover{border-color:var(--b2)}
        .card-h{
          display:flex;align-items:center;justify-content:space-between;
          padding:15px 22px;border-bottom:1px solid var(--b1);
        }
        .card-t{
          font-family:'Bricolage Grotesque',sans-serif;
          font-size:.9rem;font-weight:600;letter-spacing:-.01em;
          display:flex;align-items:center;gap:8px;
        }
        .card-s{font-size:.7rem;color:var(--muted);margin-top:2px}
        .cb{padding:22px}
        .cbs{padding:16px 22px}

        /* ── form ── */
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .fg{display:flex;flex-direction:column;gap:6px}
        .fg.full{grid-column:1/-1}
        label{font-size:.73rem;font-weight:500;color:var(--m2);letter-spacing:.02em}
        .inp{
          background:var(--s2);border:1px solid var(--b1);border-radius:8px;
          padding:10px 14px;font-size:.875rem;color:var(--text);
          outline:none;transition:border-color .2s,box-shadow .2s;width:100%;
        }
        .inp::placeholder{color:var(--muted)}
        .inp:focus{border-color:rgba(99,102,241,.4);box-shadow:0 0 0 3px rgba(99,102,241,.09)}
        .inp:disabled{background:rgba(255,255,255,.025);color:var(--muted);cursor:not-allowed}
        textarea.inp{resize:vertical;min-height:88px;line-height:1.6}
        select.inp{cursor:pointer}
        select.inp option{background:var(--s2)}
        .iw{position:relative}
        .iw .inp{padding-right:42px}
        .iico{
          position:absolute;right:12px;top:50%;transform:translateY(-50%);
          background:none;border:none;color:var(--m2);cursor:pointer;
          padding:2px;line-height:0;transition:color .15s;
        }
        .iico:hover{color:var(--text)}
        .hint{font-size:.7rem;color:var(--muted);margin-top:3px}
        .hint.e{color:var(--red)}
        .hint.ok{color:var(--green)}

        /* avatar section */
        .av-sec{
          display:flex;align-items:center;gap:20px;
          padding:18px 20px;background:var(--s2);
          border:1px solid var(--b1);border-radius:10px;margin-bottom:20px;
        }
        .av-lg{
          width:68px;height:68px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,var(--accent),var(--a2));
          display:flex;align-items:center;justify-content:center;
          font-size:1.5rem;font-weight:700;color:#fff;
          overflow:hidden;border:3px solid var(--b2);
        }
        .av-lg img{width:100%;height:100%;object-fit:cover}

        /* buttons */
        .btn{
          display:inline-flex;align-items:center;gap:6px;
          padding:8px 16px;border-radius:8px;font-size:.82rem;
          font-weight:500;cursor:pointer;transition:all .15s;border:none;
        }
        .btn-p{
          background:linear-gradient(135deg,var(--accent),var(--a2));color:#fff;
          box-shadow:0 0 0 1px rgba(99,102,241,.3);
        }
        .btn-p:hover{box-shadow:0 4px 16px rgba(99,102,241,.4);transform:translateY(-1px)}
        .btn-g{background:var(--s3);color:var(--m2);border:1px solid var(--b1)}
        .btn-g:hover{background:rgba(255,255,255,.08);color:var(--text);border-color:var(--b2)}
        .btn-d{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.2)}
        .btn-d:hover{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.35)}
        .btn:disabled{opacity:.42;cursor:not-allowed;transform:none!important;box-shadow:none!important}

        /* toggle row */
        .tr{
          display:flex;align-items:flex-start;justify-content:space-between;
          gap:20px;padding:13px 0;border-bottom:1px solid var(--b1);
        }
        .tr:last-child{border-bottom:none}
        .tr h4{font-size:.875rem;font-weight:500;margin-bottom:3px}
        .tr p{font-size:.78rem;color:var(--m2);font-weight:300;line-height:1.5}

        /* info box */
        .ibox{
          display:flex;align-items:flex-start;gap:10px;
          padding:12px 14px;
          background:rgba(99,102,241,.07);
          border:1px solid rgba(99,102,241,.18);
          border-radius:8px;margin-bottom:16px;
        }
        .ibox p{font-size:.78rem;color:var(--m2);line-height:1.6}

        /* tags */
        .tag{
          display:inline-flex;align-items:center;gap:4px;
          padding:3px 9px;border-radius:100px;
          font-size:.67rem;font-weight:500;border:1px solid;
        }
        .tag-g{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.2);color:#4ADE80}
        .tag-a{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.2);color:#FCD34D}
        .tag-b{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.25);color:#818CF8}

        /* billing toggle */
        .btog{
          display:inline-flex;background:var(--s2);
          border:1px solid var(--b1);border-radius:8px;padding:3px;
          margin-bottom:20px;
        }
        .bopt{
          padding:7px 18px;border-radius:6px;font-size:.82rem;font-weight:500;
          cursor:pointer;transition:all .15s;border:none;background:none;color:var(--m2);
        }
        .bopt.on{background:var(--s3);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.3)}
        .save-pill{
          display:inline-flex;background:rgba(34,197,94,.12);
          border:1px solid rgba(34,197,94,.2);color:#4ADE80;
          font-size:.6rem;font-weight:600;padding:2px 7px;
          border-radius:100px;margin-left:5px;
        }

        /* plan cards */
        .plans{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .pc{
          background:var(--s2);border:1px solid var(--b1);
          border-radius:12px;padding:22px;cursor:pointer;
          transition:all .22s;position:relative;overflow:hidden;
        }
        .pc:hover{border-color:var(--b2);transform:translateY(-2px);
          box-shadow:0 10px 28px rgba(0,0,0,.35)}
        .pc.cur{border-color:rgba(99,102,241,.4);background:rgba(99,102,241,.06)}
        .pc.cur::after{
          content:'Current';position:absolute;top:14px;right:14px;
          font-size:.6rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;
          background:rgba(99,102,241,.16);border:1px solid rgba(99,102,241,.25);
          color:var(--accent);padding:2px 8px;border-radius:100px;
        }
        .pc-badge{
          display:inline-flex;align-items:center;gap:4px;
          font-size:.6rem;font-weight:600;padding:2px 8px;
          border-radius:100px;margin-bottom:12px;
          letter-spacing:.05em;text-transform:uppercase;
        }
        .pc-name{
          font-family:'Bricolage Grotesque',sans-serif;
          font-size:1.1rem;font-weight:700;margin-bottom:4px;
        }
        .pc-price{display:flex;align-items:baseline;gap:3px;margin-bottom:8px}
        .pc-num{
          font-family:'Bricolage Grotesque',sans-serif;
          font-size:1.8rem;font-weight:700;line-height:1;
        }
        .pc-per{font-size:.78rem;color:var(--m2)}
        .pc-desc{font-size:.78rem;color:var(--m2);margin-bottom:14px;line-height:1.5}
        .pc-feats{list-style:none;display:flex;flex-direction:column;gap:6px}
        .pc-feat{display:flex;align-items:center;gap:7px;font-size:.78rem}
        .pc-cta{
          margin-top:16px;width:100%;padding:9px;border-radius:8px;
          font-size:.82rem;font-weight:500;cursor:pointer;
          transition:all .2s;border:none;font-family:'DM Sans',sans-serif;
        }

        /* plan banner */
        .p-banner{
          background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.07));
          border:1px solid rgba(99,102,241,.2);border-radius:12px;
          padding:20px 24px;margin-bottom:20px;
          display:flex;align-items:center;justify-content:space-between;gap:16px;
        }

        /* security */
        .pw-bar{height:4px;background:rgba(255,255,255,.07);border-radius:2px;
          margin-top:8px;overflow:hidden}
        .pw-fill{height:100%;border-radius:2px;transition:width .3s,background .3s}
        .sess{
          display:flex;align-items:center;gap:12px;
          padding:13px 16px;background:var(--s2);
          border:1px solid var(--b1);border-radius:10px;margin-bottom:8px;
        }
        .sess:last-child{margin-bottom:0}
        .sess-ico{
          width:36px;height:36px;border-radius:8px;background:var(--s3);
          display:flex;align-items:center;justify-content:center;
          font-size:16px;flex-shrink:0;
        }
        .mfa-row{
          display:flex;align-items:center;justify-content:space-between;gap:16px;
          padding:14px 18px;background:var(--s2);border-radius:10px;
          margin-bottom:14px;transition:border-color .2s;
        }

        /* appearance */
        .col-g{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}
        .swatch{
          width:34px;height:34px;border-radius:8px;cursor:pointer;
          border:2px solid transparent;transition:all .15s;
        }
        .swatch.on{border-color:#fff;transform:scale(1.12);
          box-shadow:0 0 12px rgba(255,255,255,.15)}
        .dens-g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .dc{
          padding:14px;border-radius:8px;border:1px solid var(--b1);
          cursor:pointer;text-align:center;transition:all .15s;background:var(--s2);
        }
        .dc:hover{border-color:var(--b2)}
        .dc.on{border-color:rgba(99,102,241,.4);background:rgba(99,102,241,.08)}
        .dc-lbl{font-size:.82rem;font-weight:500;margin-top:6px}
        .dc-sub{font-size:.65rem;color:var(--muted);margin-top:2px}

        /* danger zone */
        .dz{
          background:rgba(239,68,68,.04);
          border:1px solid rgba(239,68,68,.14);
          border-radius:12px;padding:22px;margin-bottom:12px;
        }
        .dz.hot{
          background:rgba(239,68,68,.07);
          border:1px solid rgba(239,68,68,.28);
        }
        .dz-t{
          font-family:'Bricolage Grotesque',sans-serif;
          font-size:.9rem;font-weight:600;color:#F87171;
          margin-bottom:5px;display:flex;align-items:center;gap:7px;
        }
        .dz-d{font-size:.82rem;color:var(--m2);line-height:1.6;
          margin-bottom:14px;font-weight:300}
        .btn-red{
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(239,68,68,.1);color:var(--red);
          border:1px solid rgba(239,68,68,.22);border-radius:8px;
          padding:10px 20px;font-size:.875rem;font-weight:500;
          cursor:pointer;transition:all .2s;
        }
        .btn-red:hover{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.38)}

        /* modal */
        .mbg{
          position:fixed;inset:0;background:rgba(0,0,0,.65);
          backdrop-filter:blur(6px);z-index:600;
          display:flex;align-items:center;justify-content:center;padding:20px;
        }
        .modal{
          background:var(--s1);border:1px solid var(--b2);
          border-radius:16px;width:100%;max-width:440px;
          box-shadow:0 32px 80px rgba(0,0,0,.6);
          animation:su .24s cubic-bezier(.4,0,.2,1);
        }
        @keyframes su{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .m-h{display:flex;align-items:center;justify-content:space-between;
          padding:20px 24px;border-bottom:1px solid var(--b1)}
        .m-title{font-family:'Bricolage Grotesque',sans-serif;font-size:1rem;
          font-weight:600;color:#F87171;display:flex;align-items:center;gap:7px}
        .m-b{padding:24px}
        .m-f{display:flex;justify-content:flex-end;gap:10px;
          padding:16px 24px;border-top:1px solid var(--b1)}
        .xbtn{background:none;border:none;color:var(--m2);cursor:pointer;
          padding:4px;border-radius:4px;line-height:0;transition:color .15s}
        .xbtn:hover{color:var(--text)}

        /* responsive */
        @media(max-width:900px){
          .snav{display:none}
          .plans{grid-template-columns:1fr}
          .grid2{grid-template-columns:1fr}
          .page{padding:20px 16px}
          .sbar{padding:0 16px}
          .dens-g{grid-template-columns:1fr 1fr}
        }
        @media(max-width:480px){.dens-g{grid-template-columns:1fr}}
      `}</style>

      {/* ── DELETE MODAL ── */}
      {delModal && (
        <div className="mbg" onClick={() => setDelModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="m-h">
              <div className="m-title"><AlertTriangle size={16}/>Delete Account</div>
              <button className="xbtn" onClick={() => setDelModal(false)}><X size={17}/></button>
            </div>
            <div className="m-b">
              <p style={{fontSize:".875rem",color:"var(--m2)",lineHeight:1.7,marginBottom:20}}>
                This permanently deletes your account, all resumes, and analysis history.{" "}
                <strong style={{color:"var(--text)"}}>This cannot be undone.</strong>
              </p>
              <div className="fg">
                <label>Type <strong style={{color:"var(--text)"}}>DELETE</strong> to confirm</label>
                <input className="inp" placeholder="DELETE"
                  value={delConfirm} onChange={e=>setDelConfirm(e.target.value)}/>
              </div>
            </div>
            <div className="m-f">
              <button className="btn btn-g" onClick={()=>setDelModal(false)}>Cancel</button>
              <button className="btn" disabled={delConfirm!=="DELETE"} style={{
                background:delConfirm==="DELETE"?"var(--red)":"rgba(239,68,68,.15)",
                color:delConfirm==="DELETE"?"#fff":"rgba(239,68,68,.4)",
                border:"none",borderRadius:8,padding:"8px 18px",
                fontSize:".85rem",fontWeight:500,transition:"all .2s",
                cursor:delConfirm==="DELETE"?"pointer":"not-allowed",
                display:"inline-flex",alignItems:"center",gap:6,
              }}>
                <Trash2 size={13}/>Delete my account
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="shell">

        {/* ── LEFT SIDEBAR ── */}
        <nav className="snav">
          <div className="snav-top">
            <Link href="/dashboard">
              <button className="back-link">
                <ChevronRight size={12} style={{transform:"rotate(180deg)"}}/>
                Back to Dashboard
              </button>
            </Link>
            <div className="snav-title">Settings</div>
            <div className="snav-sub">Manage your account</div>
          </div>

          <div className="snav-body">
            <div className="snav-lbl">Preferences</div>
            {NAV.slice(0,6).map(n=>(
              <button key={n.id} className={`ni${section===n.id?" on":""}`}
                onClick={()=>setSection(n.id)}>
                <n.icon size={15}/>{n.label}
              </button>
            ))}
            <div className="snav-lbl" style={{marginTop:4}}>Advanced</div>
            <button className={`ni red${section==="danger"?" on":""}`}
              onClick={()=>setSection("danger")}>
              <AlertTriangle size={15}/>Danger Zone
            </button>
          </div>

          <div className="snav-foot">
            <div className="nudge">
              <div className="nudge-row"><Crown size={12} style={{color:"var(--accent)"}}/>Upgrade to Pro</div>
              <p>Unlimited uploads, job-match scoring &amp; cover letter AI.</p>
              <button className="btn btn-p" style={{width:"100%",justifyContent:"center",fontSize:".78rem",padding:"8px 14px"}}
                onClick={()=>setSection("subscription")}>
                View Plans →
              </button>
            </div>
            <div className="uchip">
              <div className="av">
                {avatar?<img src={avatar} alt=""/>:(user?.firstName?.charAt(0)??"U")}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="u-n">{user?.firstName??"User"} {user?.lastName??""}</div>
                <div className="u-p">Free Plan</div>
              </div>
            </div>
          </div>
        </nav>

        {/* ── MAIN CONTENT ── */}
        <div className="smain">

          {/* topbar */}
          <div className="sbar">
            <div className="sbar-l">
              <div>
                <div className="sbar-title">{NAV.find(n=>n.id===section)?.label??"Settings"}</div>
                <div className="sbar-crumb">
                  Settings <ChevronRight size={10}/>
                  <span style={{color:"var(--m2)"}}>{NAV.find(n=>n.id===section)?.label}</span>
                </div>
              </div>
            </div>
            {saveableSections.includes(section)&&(
              <button className={`sbtn${saved?" done":""}`} onClick={handleSave} disabled={saving}>
                {saved?<><Check size={15}/>Saved!</>:saving?"Saving…":<><Check size={15}/>Save Changes</>}
              </button>
            )}
          </div>

          {/* ═══ PROFILE ═══ */}
          {section==="profile"&&(
            <div className="page">
              <div className="ph">
                <h2>Your Profile</h2>
                <p>Update your personal information and job preferences.</p>
              </div>

              {/* avatar */}
              <div className="av-sec">
                <div className="av-lg">
                  {avatar?<img src={avatar} alt=""/>:(user?.firstName?.charAt(0)??"U")}
                </div>
                <div>
                  <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:600,fontSize:".95rem",marginBottom:3}}>
                    {user?.firstName??"User"} {user?.lastName??""}
                  </div>
                  <div style={{fontSize:".75rem",color:"var(--m2)",fontWeight:300,marginBottom:10}}>JPG, PNG or GIF · max 2 MB</div>
                  <div style={{display:"flex",gap:8}}>
                    <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
                      onChange={e=>{const f=e.target.files?.[0];if(f)setAvatar(URL.createObjectURL(f))}}/>
                    <button className="btn btn-p" onClick={()=>fileRef.current?.click()}>
                      <Upload size={12}/>Upload Photo
                    </button>
                    {avatar&&<button className="btn btn-g" onClick={()=>setAvatar(null)}>
                      <X size={12}/>Remove
                    </button>}
                  </div>
                </div>
              </div>

              {/* basic info */}
              <div className="card">
                <div className="card-h">
                  <div className="card-t"><User size={14}/>Basic Information</div>
                </div>
                <div className="cb">
                  <div className="grid2">
                    <div className="fg"><label>First Name</label><input className="inp" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name"/></div>
                    <div className="fg"><label>Last Name</label><input className="inp" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name"/></div>
                    <div className="fg"><label>Job Title</label><input className="inp" value={jobTitle} onChange={e=>setJobTitle(e.target.value)} placeholder="e.g. Software Engineer"/></div>
                    <div className="fg"><label>Location</label><input className="inp" value={location} onChange={e=>setLocation(e.target.value)} placeholder="City, Country"/></div>
                    <div className="fg"><label>Website / Portfolio</label><input className="inp" value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://yoursite.com" type="url"/></div>
                    <div className="fg">
                      <label>Email Address</label>
                      <input className="inp" value={email} disabled/>
                      <span className="hint">Managed by your auth provider</span>
                    </div>
                    <div className="fg full">
                      <label>Bio</label>
                      <textarea className="inp" value={bio} onChange={e=>setBio(e.target.value)} placeholder="A short bio about yourself…"/>
                      <span className="hint">{bio.length}/200 characters</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* job preferences */}
              <div className="card">
                <div className="card-h">
                  <div className="card-t"><Star size={14}/>Job Preferences</div>
                  <span className="tag tag-b">Improves AI suggestions</span>
                </div>
                <div className="cb">
                  <div className="ibox">
                    <Info size={14} style={{color:"var(--accent)",flexShrink:0,marginTop:1}}/>
                    <p>These preferences help ResumeLens tailor ATS scoring and keyword suggestions to roles you actually want.</p>
                  </div>
                  <div className="grid2">
                    <div className="fg"><label>Target Role</label>
                      <select className="inp" value={targetRole} onChange={e=>setTargetRole(e.target.value)}>
                        {["Software Engineer","Product Manager","Data Scientist","UX Designer","Marketing Manager","DevOps Engineer","Other"].map(o=><option key={o}>{o}</option>)}
                      </select></div>
                    <div className="fg"><label>Experience Level</label>
                      <select className="inp" value={expLevel} onChange={e=>setExpLevel(e.target.value)}>
                        {["Entry Level (0–2 yrs)","Mid Level (3–5 yrs)","Senior (6–10 yrs)","Lead / Staff (10+ yrs)"].map(o=><option key={o}>{o}</option>)}
                      </select></div>
                    <div className="fg"><label>Preferred Industry</label>
                      <select className="inp" value={industry} onChange={e=>setIndustry(e.target.value)}>
                        {["Technology","Finance","Healthcare","Education","E-commerce","Consulting"].map(o=><option key={o}>{o}</option>)}
                      </select></div>
                    <div className="fg"><label>Work Type</label>
                      <select className="inp" value={workType} onChange={e=>setWorkType(e.target.value)}>
                        {["Full-time","Part-time","Contract","Freelance","Internship"].map(o=><option key={o}>{o}</option>)}
                      </select></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ ACCOUNT ═══ */}
          {section==="account"&&(
            <div className="page">
              <div className="ph"><h2>Account Settings</h2><p>Manage regional settings, privacy, and data export.</p></div>
              <div className="card">
                <div className="card-h"><div className="card-t"><Globe size={14}/>Regional & Language</div></div>
                <div className="cb">
                  <div className="grid2">
                    <div className="fg"><label>Language</label>
                      <select className="inp" value={lang} onChange={e=>setLang(e.target.value)}>
                        <option value="en">English (US)</option>
                        <option value="en-gb">English (UK)</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="hi">Hindi</option>
                      </select></div>
                    <div className="fg"><label>Timezone</label>
                      <select className="inp" value={tz} onChange={e=>setTz(e.target.value)}>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Asia/Kolkata">India (IST)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="Australia/Sydney">Sydney (AEST)</option>
                      </select></div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-h"><div className="card-t"><Shield size={14}/>Privacy</div></div>
                <div className="cbs">
                  {[
                    {k:"pub",l:"Public profile",d:"Allow others to view your profile via a shareable link",v:pubProfile,s:setPubProfile},
                    {k:"opt",l:"Opt out of analytics",d:"Stop sending anonymised usage data to help improve ResumeLens",v:optOutAnalytics,s:setOptOut},
                  ].map(item=>(
                    <div key={item.k} className="tr">
                      <div><h4>{item.l}</h4><p>{item.d}</p></div>
                      <Toggle checked={item.v} onChange={item.s}/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-h"><div className="card-t"><Download size={14}/>Data & Export</div></div>
                <div className="cb">
                  <p style={{fontSize:".875rem",color:"var(--m2)",marginBottom:14,lineHeight:1.7,fontWeight:300}}>
                    Download a complete export of your account data — all resumes, scores, and analysis history.
                  </p>
                  <div style={{display:"flex",gap:10}}>
                    <button className="btn btn-g"><Download size={13}/>Export All Data</button>
                    <button className="btn btn-g"><ExternalLink size={13}/>Privacy Policy</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ NOTIFICATIONS ═══ */}
          {section==="notifications"&&(
            <div className="page">
              <div className="ph"><h2>Notification Preferences</h2><p>Choose what you want to hear about and how.</p></div>
              <div className="card">
                <div className="card-h"><div className="card-t"><Bell size={14}/>Email Notifications</div></div>
                <div className="cbs">
                  {[
                    {k:"emailAnalysis", l:"Analysis complete",    d:"Get an email when your resume analysis finishes"},
                    {k:"emailWeekly",   l:"Weekly digest",        d:"A weekly summary of your resume performance & tips"},
                    {k:"emailTips",     l:"Improvement tips",     d:"Occasional strategies to boost your ATS score"},
                    {k:"emailMarketing",l:"Product updates",      d:"News about new features and special plans"},
                  ].map(item=>(
                    <div key={item.k} className="tr">
                      <div><h4>{item.l}</h4><p>{item.d}</p></div>
                      <Toggle checked={(notifs as Record<string,boolean>)[item.k]}
                        onChange={v=>setNotifs(p=>({...p,[item.k]:v}))}/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-h"><div className="card-t"><Smartphone size={14}/>In-App Notifications</div></div>
                <div className="cbs">
                  {[
                    {k:"pushAnalysis",  l:"Analysis complete",   d:"Notification when resume processing finishes"},
                    {k:"pushMilestone", l:"Score milestone",     d:"Alert when you hit a new best ATS score"},
                    {k:"pushReminders", l:"Upload reminders",    d:"Remind you to update your resume after 30 days"},
                  ].map(item=>(
                    <div key={item.k} className="tr">
                      <div><h4>{item.l}</h4><p>{item.d}</p></div>
                      <Toggle checked={(notifs as Record<string,boolean>)[item.k]}
                        onChange={v=>setNotifs(p=>({...p,[item.k]:v}))}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ SUBSCRIPTION ═══ */}
          {section==="subscription"&&(
            <div className="page">
              <div className="ph"><h2>Subscription & Billing</h2><p>Manage your plan, billing cycle, and payment method.</p></div>

              {/* current plan banner */}
              <div className="p-banner">
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <Crown size={14} style={{color:"var(--accent)"}}/>
                    <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:600,fontSize:".9rem"}}>
                      You&apos;re on the Free plan
                    </span>
                    <span className="tag tag-b">Active</span>
                  </div>
                  <p style={{fontSize:".8rem",color:"var(--m2)",fontWeight:300}}>
                    3 uploads remaining this month · Upgrade for unlimited access
                  </p>
                </div>
                <button className="btn btn-g" style={{flexShrink:0}}>View Invoice</button>
              </div>

              {/* billing cycle toggle */}
              <div className="btog">
                <button className={`bopt${billing==="mo"?" on":""}`} onClick={()=>setBilling("mo")}>Monthly</button>
                <button className={`bopt${billing==="yr"?" on":""}`} onClick={()=>setBilling("yr")}>
                  Yearly<span className="save-pill">Save 30%</span>
                </button>
              </div>

              {/* plan grid */}
              <div className="plans">
                {PLANS.map(plan=>(
                  <div key={plan.id} className={`pc${plan.id===currentPlan?" cur":""}`}>
                    {plan.badge?(
                      <div className="pc-badge" style={{
                        background:plan.badgeColor==="accent"?"rgba(99,102,241,.15)":"rgba(245,158,11,.12)",
                        color:plan.badgeColor==="accent"?"var(--accent)":"var(--amber)",
                        border:`1px solid ${plan.badgeColor==="accent"?"rgba(99,102,241,.25)":"rgba(245,158,11,.2)"}`,
                      }}>
                        {plan.badgeColor==="accent"?<Sparkles size={8}/>:<Star size={8}/>}
                        {plan.badge}
                      </div>
                    ):<div style={{height:24}}/>}

                    <div className="pc-name" style={{color:plan.id==="pro"?"var(--accent)":plan.id==="team"?"var(--amber)":"var(--m2)"}}>
                      {plan.name}
                    </div>
                    <div className="pc-price">
                      <span className="pc-num">{billing==="yr"?plan.yr:plan.mo}</span>
                      <span className="pc-per">/month</span>
                    </div>
                    <p className="pc-desc">{plan.desc}</p>
                    <ul className="pc-feats">
                      {plan.has.map(f=>(
                        <li key={f} className="pc-feat" style={{color:"var(--text)"}}>
                          <Check size={11} style={{color:"var(--green)",flexShrink:0}}/>{f}
                        </li>
                      ))}
                      {plan.missing.map(f=>(
                        <li key={f} className="pc-feat" style={{color:"var(--muted)"}}>
                          <X size={11} style={{color:"var(--muted)",flexShrink:0}}/>{f}
                        </li>
                      ))}
                    </ul>
                    <button className="pc-cta" style={{
                      background:plan.id===currentPlan?"rgba(255,255,255,.05)":
                        plan.ctaStyle==="primary"?"linear-gradient(135deg,var(--accent),var(--a2))":
                        plan.ctaStyle==="amber"?"rgba(245,158,11,.12)":"rgba(255,255,255,.05)",
                      color:plan.id===currentPlan?"var(--m2)":
                        plan.ctaStyle==="primary"?"#fff":
                        plan.ctaStyle==="amber"?"var(--amber)":"var(--m2)",
                      border:plan.ctaStyle==="amber"?"1px solid rgba(245,158,11,.25)":"none",
                      cursor:plan.id===currentPlan?"default":"pointer",
                      boxShadow:plan.ctaStyle==="primary"&&plan.id!==currentPlan?"0 4px 16px rgba(99,102,241,.3)":"none",
                    }}>
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>

              {/* payment method */}
              <div className="card" style={{marginTop:20}}>
                <div className="card-h"><div className="card-t"><CreditCard size={14}/>Payment Method</div></div>
                <div className="cb">
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",background:"var(--s2)",border:"1px solid var(--b1)",borderRadius:10,marginBottom:14}}>
                    <div style={{width:40,height:26,background:"linear-gradient(135deg,#1a1f5e,#4b5090)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".52rem",fontWeight:700,color:"rgba(255,255,255,.7)",flexShrink:0,letterSpacing:".05em"}}>
                      VISA
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:".85rem",fontWeight:500}}>•••• •••• •••• 4242</div>
                      <div style={{fontSize:".7rem",color:"var(--muted)",marginTop:2}}>Expires 04 / 26</div>
                    </div>
                    <span className="tag tag-g"><CheckCircle2 size={8}/>Default</span>
                  </div>
                  <button className="btn btn-g"><CreditCard size={12}/>Update payment method</button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ SECURITY ═══ */}
          {section==="security"&&(
            <div className="page">
              <div className="ph"><h2>Security</h2><p>Manage your password, 2FA, and active sessions.</p></div>

              {/* 2FA */}
              <div className="card">
                <div className="card-h"><div className="card-t"><Smartphone size={14}/>Two-Factor Authentication</div></div>
                <div className="cb">
                  <div className="mfa-row" style={{border:`1px solid ${mfa?"rgba(34,197,94,.22)":"var(--b1)"}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:mfa?"rgba(34,197,94,.12)":"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .2s"}}>
                        {mfa?<CheckCircle2 size={17} style={{color:"var(--green)"}}/>:<Lock size={17} style={{color:"var(--m2)"}}/>}
                      </div>
                      <div>
                        <div style={{fontSize:".875rem",fontWeight:500}}>Authenticator App</div>
                        <div style={{fontSize:".72rem",color:"var(--muted)",marginTop:2}}>
                          {mfa?"2FA is active — your account is protected":"Add an extra layer of security"}
                        </div>
                      </div>
                    </div>
                    <Toggle checked={mfa} onChange={setMfa}/>
                  </div>
                  {!mfa&&<p style={{fontSize:".78rem",color:"var(--m2)",lineHeight:1.65,marginTop:10,fontWeight:300}}>
                    Works with Google Authenticator, Authy, and 1Password.
                    We strongly recommend enabling this.
                  </p>}
                </div>
              </div>

              {/* change password */}
              <div className="card">
                <div className="card-h"><div className="card-t"><Lock size={14}/>Change Password</div></div>
                <div className="cb">
                  <div className="grid2">
                    <div className="fg full">
                      <label>Current Password</label>
                      <div className="iw">
                        <input className="inp" type={showCur?"text":"password"} value={curPw}
                          onChange={e=>setCurPw(e.target.value)} placeholder="Enter current password"/>
                        <button className="iico" onClick={()=>setShowCur(p=>!p)}>
                          {showCur?<EyeOff size={14}/>:<Eye size={14}/>}
                        </button>
                      </div>
                    </div>
                    <div className="fg">
                      <label>New Password</label>
                      <div className="iw">
                        <input className="inp" type={showNew?"text":"password"} value={newPw}
                          onChange={e=>setNewPw(e.target.value)} placeholder="Min 8 characters"/>
                        <button className="iico" onClick={()=>setShowNew(p=>!p)}>
                          {showNew?<EyeOff size={14}/>:<Eye size={14}/>}
                        </button>
                      </div>
                      {newPw&&<>
                        <div className="pw-bar"><div className="pw-fill" style={{width:`${(ps/4)*100}%`,background:psColor}}/></div>
                        <span style={{fontSize:".68rem",color:psColor,marginTop:3,display:"block"}}>{psLabel}</span>
                      </>}
                    </div>
                    <div className="fg">
                      <label>Confirm New Password</label>
                      <input className="inp" type="password" value={confPw}
                        onChange={e=>setConfPw(e.target.value)} placeholder="Repeat new password"/>
                      {confPw&&newPw&&<span className={`hint${confPw===newPw?" ok":" e"}`}>
                        {confPw===newPw?"✓ Passwords match":"✗ Passwords don't match"}
                      </span>}
                    </div>
                  </div>
                  <button className="btn btn-p" style={{marginTop:16}}
                    disabled={!curPw||!newPw||newPw!==confPw||ps<2}>
                    <Lock size={12}/>Update Password
                  </button>
                </div>
              </div>

              {/* active sessions */}
              <div className="card">
                <div className="card-h">
                  <div className="card-t"><Shield size={14}/>Active Sessions</div>
                  <button className="btn btn-g" style={{fontSize:".75rem"}}><LogOut size={12}/>Sign out all</button>
                </div>
                <div className="cb">
                  {sessions.map(s=>(
                    <div key={s.id} className="sess">
                      <div className="sess-ico">{s.device.includes("iPhone")?"📱":s.device.includes("Safari")?"🍎":"💻"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:".85rem",fontWeight:500,display:"flex",alignItems:"center",gap:6}}>
                          {s.device}
                          {s.cur&&<span style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",color:"#4ADE80",fontSize:".6rem",padding:"2px 7px",borderRadius:100}}>
                            <CheckCircle2 size={8}/>This device
                          </span>}
                        </div>
                        <div style={{fontSize:".7rem",color:"var(--muted)",marginTop:2}}>{s.loc} · {s.ago}</div>
                      </div>
                      {!s.cur&&<button className="btn btn-g" style={{padding:"5px 10px",fontSize:".72rem"}}><LogOut size={11}/>Revoke</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ APPEARANCE ═══ */}
          {section==="appearance"&&(
            <div className="page">
              <div className="ph"><h2>Appearance</h2><p>Customize how ResumeLens looks and feels.</p></div>

              <div className="card">
                <div className="card-h"><div className="card-t"><Palette size={14}/>Accent Color</div></div>
                <div className="cb">
                  <p style={{fontSize:".82rem",color:"var(--m2)",marginBottom:14,fontWeight:300}}>
                    Choose your preferred accent color across the interface.
                  </p>
                  <div className="col-g">
                    {[
                      {id:"indigo",bg:"linear-gradient(135deg,#6366F1,#8B5CF6)"},
                      {id:"blue",  bg:"linear-gradient(135deg,#3B82F6,#6366F1)"},
                      {id:"violet",bg:"linear-gradient(135deg,#8B5CF6,#A78BFA)"},
                      {id:"rose",  bg:"linear-gradient(135deg,#F43F5E,#EC4899)"},
                      {id:"amber", bg:"linear-gradient(135deg,#F59E0B,#FBBF24)"},
                      {id:"green", bg:"linear-gradient(135deg,#22C55E,#10B981)"},
                      {id:"teal",  bg:"linear-gradient(135deg,#14B8A6,#06B6D4)"},
                    ].map(c=>(
                      <div key={c.id} className={`swatch${accent===c.id?" on":""}`}
                        style={{background:c.bg}} title={c.id}
                        onClick={()=>setAccent(c.id)}/>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-h"><div className="card-t"><Zap size={14}/>Content Density</div></div>
                <div className="cb">
                  <p style={{fontSize:".82rem",color:"var(--m2)",marginBottom:14,fontWeight:300}}>
                    Control how compact or spacious the interface feels.
                  </p>
                  <div className="dens-g">
                    {(["compact","default","relaxed"] as const).map(d=>(
                      <div key={d} className={`dc${density===d?" on":""}`} onClick={()=>setDensity(d)}>
                        <div style={{display:"flex",flexDirection:"column",gap:d==="compact"?3:d==="default"?5:8,alignItems:"center"}}>
                          {[1,2,3].map(i=><div key={i} style={{height:3,width:`${80-i*10}%`,background:density===d?"var(--accent)":"rgba(255,255,255,.14)",borderRadius:2}}/>)}
                        </div>
                        <div className="dc-lbl" style={{color:density===d?"var(--text)":"var(--m2)"}}>{d.charAt(0).toUpperCase()+d.slice(1)}</div>
                        <div className="dc-sub">{d==="compact"?"More on screen":d==="default"?"Balanced":"More breathing room"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ DANGER ZONE ═══ */}
          {section==="danger"&&(
            <div className="page">
              <div className="ph"><h2>Danger Zone</h2><p>Irreversible actions. Please proceed with extreme caution.</p></div>

              <div className="dz">
                <div className="dz-t"><Trash2 size={14}/>Clear All Resume Data</div>
                <p className="dz-d">Permanently delete all uploaded resumes and analysis history. Your account stays active but all data is wiped. Cannot be undone.</p>
                <button className="btn-red"><Trash2 size={14}/>Clear Resume Data</button>
              </div>

              <div className="dz">
                <div className="dz-t"><LogOut size={14}/>Sign Out Everywhere</div>
                <p className="dz-d">Immediately invalidate all active sessions across every device. You will be signed out of this session too.</p>
                <button className="btn-red" onClick={()=>signOut({redirectUrl:"/"})}>
                  <LogOut size={14}/>Sign Out All Sessions
                </button>
              </div>

              <div className="dz hot">
                <div className="dz-t"><AlertTriangle size={14}/>Delete Account</div>
                <p className="dz-d">
                  Permanently delete your ResumeLens account, all uploaded resumes, ATS scores, analysis reports, and billing history.{" "}
                  <strong style={{color:"#F87171"}}>This is irreversible.</strong>
                </p>
                <button className="btn-red" style={{background:"rgba(239,68,68,.14)",borderColor:"rgba(239,68,68,.3)"}}
                  onClick={()=>setDelModal(true)}>
                  <AlertTriangle size={14}/>Delete My Account
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}