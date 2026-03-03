"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #0A0A0F;
          --surface:   #111118;
          --surface2:  #16161F;
          --border:    rgba(255,255,255,0.07);
          --border-md: rgba(255,255,255,0.12);
          --text:      #F0F0F5;
          --muted:     #6B6B80;
          --muted2:    #9090A8;
          --accent:    #6366F1;
          --accent2:   #8B5CF6;
          --green:     #22C55E;
          --amber:     #F59E0B;
        }

        html { scroll-behavior: smooth; }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        a { text-decoration: none; color: inherit; }

        .display {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }
        .heading {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        .label {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .container { max-width: 1160px; margin: 0 auto; padding: 0 32px; }

        /* NAVBAR */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
        }
        .navbar.scrolled {
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .navbar-inner {
          display: flex; align-items: center; justify-content: space-between;
          height: 64px; max-width: 1160px; margin: 0 auto; padding: 0 32px;
        }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          box-shadow: 0 0 20px rgba(99,102,241,0.35);
        }
        .logo-text {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700; font-size: 1.05rem; letter-spacing: -0.02em;
        }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          padding: 7px 14px; font-size: 0.875rem; color: var(--muted2);
          border-radius: 7px; transition: color 0.2s, background 0.2s; font-weight: 400;
        }
        .nav-link:hover { color: var(--text); background: rgba(255,255,255,0.05); }

        .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 0.875rem; font-weight: 500; border-radius: 8px;
          padding: 9px 20px; cursor: pointer; border: none;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost {
          background: transparent; color: var(--muted2);
          border: 1px solid var(--border-md);
        }
        .btn-ghost:hover { color: var(--text); background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.18); }
        .btn-primary {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.5);
        }
        .btn-primary:hover {
          box-shadow: 0 4px 24px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.6);
          transform: translateY(-1px);
        }
        .btn-lg { padding: 13px 28px; font-size: 0.95rem; border-radius: 10px; }
        .btn-xl { padding: 15px 36px; font-size: 1rem; border-radius: 12px; font-weight: 600; }

        /* HERO */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero {
          padding: 148px 32px 100px; max-width: 1160px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25);
          border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 28px;
          animation: fadeUp 0.5s ease both;
        }
        .badge-dot {
          width: 20px; height: 20px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center; font-size: 10px;
        }
        .badge-text { font-size: 0.78rem; font-weight: 500; color: rgba(165,165,220,0.9); }
        .hero h1 {
          font-size: clamp(2.6rem, 4.5vw, 3.8rem); margin-bottom: 24px;
          animation: fadeUp 0.5s 0.08s ease both; color: var(--text);
        }
        .hero h1 .gradient-word {
          background: linear-gradient(135deg, #818CF8, #A78BFA, #C084FC);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub {
          font-size: 1.05rem; line-height: 1.75; color: var(--muted2);
          max-width: 440px; margin-bottom: 40px; font-weight: 300;
          animation: fadeUp 0.5s 0.16s ease both;
        }
        .hero-cta { display: flex; align-items: center; gap: 14px; animation: fadeUp 0.5s 0.24s ease both; margin-bottom: 56px; }
        .hero-proof {
          display: flex; align-items: center; gap: 24px;
          animation: fadeUp 0.5s 0.32s ease both;
          padding-top: 32px; border-top: 1px solid var(--border);
        }
        .proof-avatars { display: flex; }
        .proof-avatar {
          width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--bg);
          margin-left: -8px; display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 600; color: white;
        }
        .proof-avatar:first-child { margin-left: 0; }
        .proof-text { font-size: 0.82rem; color: var(--muted2); line-height: 1.4; }
        .proof-text strong { color: var(--text); font-weight: 500; }

        /* HERO VISUAL */
        .hero-visual { position: relative; animation: fadeUp 0.6s 0.2s ease both; }
        .dashboard-card {
          background: var(--surface); border: 1px solid var(--border-md);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          position: relative;
        }
        .dashboard-topbar {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 18px; border-bottom: 1px solid var(--border); background: var(--surface2);
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }

        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .float-card {
          position: absolute; background: var(--surface2); border: 1px solid var(--border-md);
          border-radius: 12px; padding: 14px 18px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5); backdrop-filter: blur(12px);
          animation: floatY 4s ease-in-out infinite;
        }
        .float-card-2 { animation-delay: -2s; animation-duration: 5s; }

        /* LOGOS STRIP */
        .logos-strip { padding: 32px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .logos-inner {
          display: flex; align-items: center; justify-content: center; gap: 48px;
          flex-wrap: wrap; max-width: 1160px; margin: 0 auto; padding: 0 32px;
        }
        .logo-chip {
          display: flex; align-items: center; gap: 8px;
          color: var(--muted); font-size: 0.85rem; font-weight: 500;
          letter-spacing: -0.01em; transition: color 0.2s;
        }
        .logo-chip:hover { color: var(--muted2); }

        /* SECTIONS */
        section { padding: 100px 0; }
        .section-label { margin-bottom: 12px; }
        .section-title { font-size: clamp(1.8rem, 3vw, 2.6rem); margin-bottom: 16px; color: var(--text); }
        .section-desc { font-size: 1rem; color: var(--muted2); line-height: 1.7; max-width: 480px; font-weight: 300; }

        /* FEATURES GRID */
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: var(--border);
          border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-top: 64px;
        }
        .feature-cell {
          background: var(--bg); padding: 36px 32px;
          transition: background 0.2s; position: relative; overflow: hidden;
        }
        .feature-cell::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at top left, rgba(99,102,241,0.07) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-cell:hover { background: var(--surface); }
        .feature-cell:hover::after { opacity: 1; }
        .feature-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px; font-size: 18px;
        }
        .feature-title {
          font-family: 'Bricolage Grotesque', sans-serif; font-weight: 600;
          font-size: 1rem; letter-spacing: -0.01em; margin-bottom: 10px; color: var(--text);
        }
        .feature-desc { font-size: 0.875rem; color: var(--muted2); line-height: 1.65; font-weight: 300; }

        /* SCORE SECTION */
        .score-section { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .score-panel {
          background: var(--surface); border: 1px solid var(--border-md);
          border-radius: 20px; padding: 32px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
        }
        .score-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--border);
        }
        .score-circle-wrap { display: flex; flex-direction: column; align-items: center; margin-bottom: 28px; }
        .score-circle {
          width: 120px; height: 120px; border-radius: 50%;
          background: conic-gradient(#6366F1 0% 82%, rgba(255,255,255,0.06) 82% 100%);
          display: flex; align-items: center; justify-content: center;
          position: relative; margin-bottom: 12px;
        }
        .score-circle-inner {
          width: 90px; height: 90px; border-radius: 50%; background: var(--surface);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .score-num { font-family: 'Bricolage Grotesque', sans-serif; font-size: 1.8rem; font-weight: 700; color: var(--text); line-height: 1; }
        .score-sub { font-size: 0.6rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .metric-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid var(--border);
        }
        .metric-row:last-child { border-bottom: none; }
        .metric-label { font-size: 0.82rem; color: var(--muted2); }
        .metric-bar-wrap { flex: 1; margin: 0 14px; height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
        .metric-bar { height: 100%; border-radius: 2px; }
        .metric-val { font-size: 0.78rem; font-weight: 500; color: var(--text); min-width: 30px; text-align: right; }
        .tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .tag { padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 500; border: 1px solid; }
        .tag-green { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.25); color: #4ADE80; }
        .tag-amber { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #FCD34D; }
        .tag-blue  { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3);  color: #818CF8; }

        /* HOW IT WORKS */
        .steps-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 64px; position: relative;
        }
        .steps-grid::before {
          content: ''; position: absolute; top: 28px;
          left: calc(16.66% + 28px); right: calc(16.66% + 28px); height: 1px;
          background: linear-gradient(90deg, var(--accent), var(--accent2)); opacity: 0.25;
        }
        .step-item { text-align: center; }
        .step-num {
          width: 56px; height: 56px; border-radius: 14px; border: 1px solid var(--border-md);
          background: var(--surface); display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 1.1rem;
          color: var(--accent); position: relative; z-index: 1; transition: all 0.2s;
        }
        .step-item:hover .step-num {
          background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.35);
          box-shadow: 0 0 24px rgba(99,102,241,0.2);
        }
        .step-title { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 600; font-size: 1rem; margin-bottom: 10px; }
        .step-desc { font-size: 0.85rem; color: var(--muted2); line-height: 1.65; font-weight: 300; }

        /* TESTIMONIALS */
        .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 64px; }
        .testi-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 28px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .testi-card:hover { border-color: var(--border-md); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .stars { display: flex; gap: 3px; margin-bottom: 16px; color: #FBBF24; font-size: 0.85rem; }
        .testi-quote { font-size: 0.9rem; color: rgba(240,240,245,0.75); line-height: 1.7; margin-bottom: 24px; font-weight: 300; }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .author-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 600; color: white;
        }
        .author-name { font-size: 0.85rem; font-weight: 500; color: var(--text); }
        .author-role { font-size: 0.75rem; color: var(--muted); margin-top: 1px; }

        /* CTA BANNER */
        .cta-banner {
          background: var(--surface); border: 1px solid var(--border-md); border-radius: 24px;
          padding: 72px 64px; text-align: center; position: relative; overflow: hidden;
        }
        .cta-banner::before {
          content: ''; position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-banner h2 { font-size: clamp(2rem, 3.5vw, 2.8rem); margin-bottom: 16px; position: relative; }
        .cta-banner p { font-size: 1rem; color: var(--muted2); max-width: 440px; margin: 0 auto 40px; line-height: 1.7; font-weight: 300; position: relative; }

        /* FOOTER */
        footer { border-top: 1px solid var(--border); padding: 56px 0 40px; }
        .footer-inner { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 56px; margin-bottom: 48px; }
        .footer-brand p { font-size: 0.85rem; color: var(--muted); line-height: 1.7; margin-top: 12px; max-width: 220px; }
        .footer-col h5 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 0.82rem; font-weight: 600; margin-bottom: 16px; color: var(--text); letter-spacing: -0.01em; }
        .footer-col a { display: block; font-size: 0.82rem; color: var(--muted); margin-bottom: 10px; transition: color 0.2s; }
        .footer-col a:hover { color: var(--muted2); }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 32px; border-top: 1px solid var(--border); }
        .footer-copy { font-size: 0.8rem; color: var(--muted); }
        .status-pill { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--muted); }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 6px var(--green); }
      `}</style>

      <main>

        {/* NAVBAR */}
        <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
          <div className="navbar-inner">
            <Link href="/" className="logo">
              <div className="logo-icon">📄</div>
              <span className="logo-text">ResumeLens</span>
            </Link>

            <div className="nav-links">
              <Link href="#features" className="nav-link">Features</Link>
              <Link href="#how" className="nav-link">How it works</Link>
              <Link href="#testimonials" className="nav-link">Reviews</Link>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {!isSignedIn ? (
                <>
                  <Link href="/sign-in"><button className="btn btn-ghost">Sign in</button></Link>
                  <Link href="/sign-up"><button className="btn btn-primary">Get started free</button></Link>
                </>
              ) : (
                <Link href="/dashboard"><button className="btn btn-primary">Dashboard →</button></Link>
              )}
            </div>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero">
          <div>
            <div className="hero-badge">
              <div className="badge-dot">✦</div>
              <span className="badge-text">AI-powered resume analysis</span>
            </div>

            <h1 className="display">
              Your resume,<br />
              <span className="gradient-word">optimized</span> for<br />
              every job.
            </h1>

            <p className="hero-sub">
              Upload your resume and get an instant ATS score, skill gap analysis,
              and specific improvements that help you land more interviews.
            </p>

            <div className="hero-cta">
              <Link href="/sign-up">
                <button className="btn btn-primary btn-xl">Analyze my resume →</button>
              </Link>
              <Link href="/sign-in">
                <button className="btn btn-ghost btn-lg">Sign in</button>
              </Link>
            </div>

            <div className="hero-proof">
              <div className="proof-avatars">
                {[
                  { i: "AK", g: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
                  { i: "SR", g: "linear-gradient(135deg,#0EA5E9,#6366F1)" },
                  { i: "MJ", g: "linear-gradient(135deg,#8B5CF6,#EC4899)" },
                  { i: "LP", g: "linear-gradient(135deg,#22C55E,#0EA5E9)" },
                  { i: "TC", g: "linear-gradient(135deg,#F59E0B,#EF4444)" },
                ].map((a, idx) => (
                  <div key={idx} className="proof-avatar" style={{ background: a.g }}>{a.i}</div>
                ))}
              </div>
              <p className="proof-text">
                <strong>50,000+</strong> professionals have improved<br />
                their resume score with ResumeLens
              </p>
            </div>
          </div>

          {/* Right — Dashboard visual */}
          <div className="hero-visual">
            <div className="dashboard-card">
              <div className="dashboard-topbar">
                <div className="dot" style={{ background: "#FF5F56" }} />
                <div className="dot" style={{ background: "#FFBD2E" }} />
                <div className="dot" style={{ background: "#27C93F" }} />
                <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400 }}>
                  ResumeLens — Analysis Report
                </span>
              </div>
              <Image
                src="/landingpage.png"
                alt="ResumeLens Dashboard"
                width={1000}
                height={800}
                style={{ width: "100%", height: "auto", display: "block" }}
                priority
              />
            </div>

            {/* ATS Score chip */}
            <div className="float-card" style={{ top: "14%", right: "-52px", minWidth: "140px" }}>
              <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>ATS Score</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: "2rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
                87<span style={{ fontSize: "1rem", color: "var(--muted)", fontWeight: 400 }}>/100</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "6px" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--green)" }}>↑ +24 pts</span>
                <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>vs before</span>
              </div>
            </div>

            {/* Keywords chip */}
            <div className="float-card float-card-2" style={{ bottom: "12%", left: "-44px", minWidth: "168px" }}>
              <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Keywords matched</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {["React", "TypeScript", "Node.js", "CI/CD"].map(k => (
                  <span key={k} className="tag tag-blue" style={{ fontSize: "0.68rem", padding: "2px 8px" }}>{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LOGOS STRIP */}
        <div className="logos-strip">
          <div className="logos-inner">
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginRight: 8, whiteSpace: "nowrap" }}>
              Used by people from
            </span>
            {["Google", "Amazon", "Microsoft", "Meta", "Stripe", "Notion", "Linear", "Vercel"].map(name => (
              <div key={name} className="logo-chip">
                <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: "0.9rem" }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section id="features">
          <div className="container">
            <div style={{ maxWidth: 560 }}>
              <p className="label section-label">Features</p>
              <h2 className="heading section-title">Everything you need to beat the ATS</h2>
              <p className="section-desc">ResumeLens runs your resume through the same logic that recruiters&apos; systems use — then tells you exactly what to fix.</p>
            </div>

            <div className="features-grid">
              {[
                { icon: "📊", title: "ATS Compatibility Score", desc: "Get a 0–100 score showing how well your resume passes automated screening, with a full breakdown by section." },
                { icon: "🔍", title: "Keyword Extraction", desc: "AI identifies every skill and keyword in your resume and shows what's missing compared to the job description." },
                { icon: "🎯", title: "Job Match Analysis", desc: "Paste any job posting and instantly see your match percentage. Know where you stand before you apply." },
                { icon: "✏️", title: "Improvement Suggestions", desc: "Line-by-line suggestions to sharpen bullet points, fix weak verbs, and add quantifiable impact." },
                { icon: "📐", title: "Format & Structure Check", desc: "Detect font issues, inconsistent formatting, missing sections, and layout problems that confuse ATS parsers." },
                { icon: "⚡", title: "Instant Results", desc: "Analysis completes in under 10 seconds. No waiting, no email reports — everything is in your browser." },
              ].map((f, i) => (
                <div key={i} className="feature-cell">
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SCORE VISUAL SECTION */}
        <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div className="score-section">
              <div>
                <div className="score-panel">
                  <div className="score-panel-header">
                    <div>
                      <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>Resume Report</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>software-engineer-resume.pdf</div>
                    </div>
                    <span className="tag tag-green">Passed</span>
                  </div>

                  <div className="score-circle-wrap">
                    <div className="score-circle">
                      <div className="score-circle-inner">
                        <div className="score-num">87</div>
                        <div className="score-sub">/ 100</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted2)" }}>ATS Compatibility Score</div>
                  </div>

                  {[
                    { label: "Keywords",   val: 91, color: "#6366F1", text: "91%" },
                    { label: "Formatting", val: 78, color: "#8B5CF6", text: "78%" },
                    { label: "Impact",     val: 84, color: "#22C55E", text: "84%" },
                    { label: "Skills",     val: 95, color: "#0EA5E9", text: "95%" },
                  ].map(m => (
                    <div key={m.label} className="metric-row">
                      <span className="metric-label">{m.label}</span>
                      <div className="metric-bar-wrap">
                        <div className="metric-bar" style={{ width: `${m.val}%`, background: m.color }} />
                      </div>
                      <span className="metric-val">{m.text}</span>
                    </div>
                  ))}

                  <div style={{ marginTop: "20px" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      Skills detected
                    </div>
                    <div className="tag-list">
                      {["React", "TypeScript", "Node.js", "AWS", "Docker", "GraphQL"].map(s => (
                        <span key={s} className="tag tag-blue">{s}</span>
                      ))}
                      {["Redux", "Testing"].map(s => (
                        <span key={s} className="tag tag-amber">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="label section-label">See it in action</p>
                <h2 className="heading section-title">A full picture of your resume&apos;s health</h2>
                <p className="section-desc" style={{ maxWidth: "100%", marginBottom: "32px" }}>
                  Every analysis gives you a detailed breakdown — not just a number. Understand exactly
                  what&apos;s working, what needs fixing, and which keywords you&apos;re missing for the role you want.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    "Section-by-section quality scoring",
                    "Missing keyword identification by role",
                    "Bullet point strength analysis",
                    "Formatting compatibility check",
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "22px", height: "22px", borderRadius: "50%",
                        background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.65rem", color: "var(--green)", flexShrink: 0,
                      }}>✓</div>
                      <span style={{ fontSize: "0.9rem", color: "var(--muted2)" }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "40px" }}>
                  <Link href="/sign-up">
                    <button className="btn btn-primary btn-lg">Try it free →</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how">
          <div className="container" style={{ textAlign: "center" }}>
            <p className="label section-label">How it works</p>
            <h2 className="heading section-title">From upload to insights in seconds</h2>
            <p className="section-desc" style={{ margin: "0 auto" }}>Three simple steps. No setup, no installs, no fuss.</p>

            <div className="steps-grid">
              {[
                { n: "1", title: "Upload your resume", desc: "Drop your PDF or paste the text. We accept all common resume formats." },
                { n: "2", title: "AI analysis runs",   desc: "Our engine checks your resume across 40+ criteria including keywords, formatting, and impact language." },
                { n: "3", title: "Get your action plan", desc: "Review your score, explore section feedback, and follow prioritized suggestions to improve fast." },
              ].map((s, i) => (
                <div key={i} className="step-item">
                  <div className="step-num">{s.n}</div>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div style={{ maxWidth: 560 }}>
              <p className="label section-label">Reviews</p>
              <h2 className="heading section-title">People are landing jobs with ResumeLens</h2>
            </div>
            <div className="testi-grid">
              {[
                {
                  quote: "My ATS score jumped from 45 to 82 in one session. I had three interview requests the following week. Genuinely shocked at how actionable the feedback was.",
                  name: "Sarah Chen", role: "Product Designer · hired at Figma",
                  grad: "linear-gradient(135deg,#6366F1,#8B5CF6)", init: "SC",
                },
                {
                  quote: "The keyword gap feature alone is worth it. I had no idea I was missing half the terms recruiters were filtering for. Fixed it in 20 minutes.",
                  name: "Marcus Johnson", role: "Full Stack Engineer · hired at Stripe",
                  grad: "linear-gradient(135deg,#0EA5E9,#6366F1)", init: "MJ",
                },
                {
                  quote: "Spent weeks applying with no callbacks. After using ResumeLens I understood exactly why. The recommendations are specific and they actually work.",
                  name: "Emily Rodriguez", role: "Marketing Manager · hired at Notion",
                  grad: "linear-gradient(135deg,#8B5CF6,#EC4899)", init: "ER",
                },
              ].map((t, i) => (
                <div key={i} className="testi-card">
                  <div className="stars">★★★★★</div>
                  <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="testi-author">
                    <div className="author-avatar" style={{ background: t.grad }}>{t.init}</div>
                    <div>
                      <div className="author-name">{t.name}</div>
                      <div className="author-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="container">
            <div className="cta-banner">
              <p className="label" style={{ marginBottom: 20 }}>Get started today</p>
              <h2 className="display">Ready to fix your resume?</h2>
              <p>Join 50,000+ professionals who use ResumeLens to get more interviews. Free to start — no credit card needed.</p>
              <Link href="/sign-up">
                <button className="btn btn-primary btn-xl">Analyze my resume for free →</button>
              </Link>
              <div style={{ marginTop: 20, fontSize: "0.8rem", color: "var(--muted)" }}>
                ✓ Free tier available &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Results in 10 seconds
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="container">
            <div className="footer-inner">
              <div className="footer-brand">
                <div className="logo">
                  <div className="logo-icon">📄</div>
                  <span className="logo-text">ResumeLens</span>
                </div>
                <p>AI-powered resume analysis that helps professionals get more interviews and land better jobs.</p>
              </div>
              {[
                { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
                { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
                { title: "Legal",   links: ["Privacy", "Terms", "Security", "Cookies"] },
              ].map(col => (
                <div key={col.title} className="footer-col">
                  <h5>{col.title}</h5>
                  {col.links.map(l => <Link key={l} href="#">{l}</Link>)}
                </div>
              ))}
            </div>
            <div className="footer-bottom">
              <span className="footer-copy">© {new Date().getFullYear()} ResumeLens AI. All rights reserved.</span>
              <div className="status-pill">
                <div className="status-dot" />
                All systems operational
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}