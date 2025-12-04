"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / 100, y: e.clientY / 100 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060B27] text-white">

      {/* === BACKGROUND ORBS === */}
      <div className="absolute -top-40 -left-40 h-[400px] w-[400px] bg-purple-600 opacity-30 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 -right-40 h-[400px] w-[400px] bg-indigo-600 opacity-30 blur-[150px] rounded-full animate-pulse delay-700" />

      {/* === OVERLAY === */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0F1639]/50 to-[#060B27]" />

      {/* === NAVBAR === */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 bg-linear-to-tr from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-lg">★</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">ResumeLens AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in" className="text-sm font-medium hover:text-gray-300 transition">
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-linear-to-r from-[#6A5CFF] to-[#9D4EDD] hover:opacity-90 transition shadow-[0_0_15px_rgba(130,70,255,0.5)]"
            >
              Get Started
            </Link>
          </SignedOut>

          <SignedIn>
            <Link
              href="/sign-in"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-linear-to-r from-[#6A5CFF] to-[#9D4EDD] hover:opacity-90 transition shadow-lg"
            >
              Get Started
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* === HERO SECTION WITH IMAGE TO THE RIGHT === */}
      <section
        className="relative z-20 pt-32 px-6 transition-all duration-300"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* LEFT TEXT */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight 
              bg-clip-text text-transparent 
              bg-[linear-gradient(90deg,#a78bfa,#c084fc,#93c5fd)] 
              bg-size-[200%_200%] animate-gradientX drop-shadow-2xl"
            >
              AI-Powered Resume  
              <br />
              Analysis & Insights
            </h1>

            <p className="text-gray-300 max-w-xl mt-6 text-lg md:text-xl leading-relaxed">
              Get instant ATS score, skill extraction, formatting analysis, and actionable improvement 
              suggestions powered by advanced AI.
            </p>

            <div className="mt-10 flex gap-4 justify-center md:justify-start">

              <Link href="/sign-in">
                <Button className="px-6 py-6 text-lg bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Sign In
                </Button>
              </Link>

              <Link href="/sign-up">
                <Button className="px-6 py-6 text-lg bg-linear-to-r from-[#6A5CFF] to-[#9D4EDD] text-white shadow-[0_0_25px_rgba(120,70,255,0.6)] hover:shadow-[0_0_35px_rgba(150,90,255,0.9)] transition">
                  Get Started
                </Button>
              </Link>

            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-lg">
              <div className="absolute -top-12 -left-10 h-64 w-64 bg-purple-600/30 blur-[120px] rounded-full -z-10"></div>

              <Image
                src="/landingpage.png"
                alt="AI Resume Analysis Dashboard"
                width={1000}
                height={1000}
                className="rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.4)]"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ⭐⭐⭐ FEATURES SECTION ⭐⭐⭐ */}
      <section className="relative z-20 mt-28 px-6 max-w-4xl mx-auto space-y-6">

        {/* Card 1 */}
        <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl 
          shadow-[0_0_30px_rgba(0,0,0,0.15)] hover:bg-white/10 transition duration-300 group"
        >
          <div className="flex items-start gap-4">
            <div className="text-purple-400 group-hover:text-purple-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 13h4v8H7v-8zm6-6h4v14h-4V7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">ATS Score Analysis</h3>
              <p className="text-gray-400 mt-1">
                Real-time ATS compatibility score with detailed breakdowns
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl 
          shadow-[0_0_30px_rgba(0,0,0,0.15)] hover:bg-white/10 transition duration-300 group"
        >
          <div className="flex items-start gap-4">
            <div className="text-purple-400 group-hover:text-purple-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Instant Insights</h3>
              <p className="text-gray-400 mt-1">
                Extract skills, detect missing keywords, and get recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl 
          shadow-[0_0_30px_rgba(0,0,0,0.15)] hover:bg-white/10 transition duration-300 group"
        >
          <div className="flex items-start gap-4">
            <div className="text-purple-400 group-hover:text-purple-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-3-3m3 3l3-3m5-4a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Job Match Score</h3>
              <p className="text-gray-400 mt-1">
                Compare your resume against job descriptions
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* ⭐⭐⭐ TESTIMONIALS SECTION ⭐⭐⭐ */}
      <section className="relative z-20 mt-32 px-6 max-w-4xl mx-auto">

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Trusted by Professionals
        </h2>

        <div className="space-y-8">

          {/* Testimonial 1 */}
          <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 
            backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.2)] hover:bg-white/10 transition duration-300"
          >
            <div className="flex text-yellow-400 mb-3">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p className="text-gray-200 text-lg leading-relaxed mb-4">
              &quot;ResumeLens AI helped me boost my ATS score from 45% to 82%. Landed my dream job!&quot;
            </p>
            <div>
              <h3 className="font-semibold text-white">Sarah Chen</h3>
              <p className="text-gray-400 text-sm">Product Designer</p>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 
            backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.2)] hover:bg-white/10 transition duration-300"
          >
            <div className="flex text-yellow-400 mb-3">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p className="text-gray-200 text-lg leading-relaxed mb-4">
              &quot;The skill extraction was incredibly accurate. Saved me hours of manual work.&quot;
            </p>
            <div>
              <h3 className="font-semibold text-white">Mike Johnson</h3>
              <p className="text-gray-400 text-sm">Full Stack Developer</p>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 
            backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.2)] hover:bg-white/10 transition duration-300"
          >
            <div className="flex text-yellow-400 mb-3">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p className="text-gray-200 text-lg leading-relaxed mb-4">
              &quot;Best investment for job hunting. The recommendations are spot-on!&quot;
            </p>
            <div>
              <h3 className="font-semibold text-white">Emily Rodriguez</h3>
              <p className="text-gray-400 text-sm">Marketing Manager</p>
            </div>
          </div>

        </div>

      </section>

      {/* ⭐⭐⭐ CTA SECTION ⭐⭐⭐ */}
      <section className="relative z-20 mt-32 px-6 max-w-4xl mx-auto text-center">

        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Optimize Your Resume?
        </h2>

        <p className="text-gray-300 max-w-xl mx-auto mb-8 text-lg">
          Join thousands of professionals using ResumeLens to land their dream jobs.
        </p>

        <Link href="/dashboard">
          <button className="px-8 py-4 text-lg font-semibold bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl shadow-[0_0_20px_rgba(120,70,255,0.5)] hover:opacity-90 transition">
            Start Analysis Now
          </button>
        </Link>
      </section>

      {/* ⭐⭐⭐ FOOTER ⭐⭐⭐ */}
      <footer className="relative z-20 mt-32 border-t border-white/10 py-16 px-6 bg-transparent">

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-gray-300">

          <div>
            <h3 className="text-xl font-semibold text-white mb-2">ResumeLens AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              AI-powered resume analysis for professionals.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition">About</Link></li>
              <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
            </ul>
          </div>

        </div>

        <div className="text-center mt-12 text-gray-400 text-sm">
          © {new Date().getFullYear()} ResumeLens AI. All rights reserved.
        </div>

      </footer>

    </main>
  );
}
// minor ui update for github commit

