"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
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
          <div className="h-9 w-9 bg-linear-to-trrom-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-lg">★</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">ResumeLens AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm font-medium hover:text-gray-300 transition"
            >
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
            {/* As per your request: show Sign In + Sign Up even if logged in */}
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

      {/* === HERO SECTION === */}
      <section
        className="relative z-20 flex flex-col items-center text-center pt-32 px-6 transition-all duration-300"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
        }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(90deg,#a78bfa,#c084fc,#93c5fd)] bg-size-[200%_200%] animate-gradientX drop-shadow-2xl">
          AI-Powered Resume  
          <br />
          Analysis & Insights
        </h1>

        <p className="text-gray-300 max-w-2xl mt-6 text-lg md:text-xl leading-relaxed fade-in">
          Get instant ATS score, skill extraction, formatting analysis, and actionable improvement suggestions powered by advanced AI.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex gap-4 fade-in">

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
      </section>

      {/* ⭐⭐⭐ FEATURES SECTION ⭐⭐⭐ */}
      <section className="relative z-20 mt-28 px-6 max-w-4xl mx-auto space-y-6">

        {/* Card 1 */}
        <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.15)] hover:bg-white/10 transition duration-300 group">
          <div className="flex items-start gap-4">
            <div className="text-purple-400 group-hover:text-purple-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3v18h18M7 13h4v8H7v-8zm6-6h4v14h-4V7z" />
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
        <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.15)] hover:bg-white/10 transition duration-300 group">
          <div className="flex items-start gap-4">
            <div className="text-purple-400 group-hover:text-purple-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
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
        <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.15)] hover:bg-white/10 transition duration-300 group">
          <div className="flex items-start gap-4">
            <div className="text-purple-400 group-hover:text-purple-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 3v12m0 0l-3-3m3 3l3-3m5-4a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.2)] hover:bg-white/10 transition duration-300">
    
    <div className="flex text-yellow-400 mb-3">
      &#9733;&#9733;&#9733;&#9733;&#9733;
    </div>

    <p className="text-gray-200 text-lg leading-relaxed mb-4">
      &quot;ResumeLens AI helped me boost my ATS score from 45% to 82%. Landed my dream job!&quot;
    </p>

    <div>
      <h3 className="font-semibold text-white">Sarah Chen</h3>
      <p className="text-gray-400 text-sm">Product Designer</p>
    </div>
  </div>

  {/* Testimonial 2 */}
  <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.2)] hover:bg-white/10 transition duration-300">
    
    <div className="flex text-yellow-400 mb-3">
      &#9733;&#9733;&#9733;&#9733;&#9733;
    </div>

    <p className="text-gray-200 text-lg leading-relaxed mb-4">
      &quot;The skill extraction was incredibly accurate. Saved me hours of manual work.&quot;
    </p>

    <div>
      <h3 className="font-semibold text-white">Mike Johnson</h3>
      <p className="text-gray-400 text-sm">Full Stack Developer</p>
    </div>
  </div>

  {/* Testimonial 3 */}
  <div className="feature-fade bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.2)] hover:bg-white/10 transition duration-300">
    
    <div className="flex text-yellow-400 mb-3">
      &#9733;&#9733;&#9733;&#9733;&#9733;
    </div>

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
{/* ⭐⭐⭐ FOOTER SECTION ⭐⭐⭐ */}
<footer className="relative z-20 mt-32 border-t border-white/10 py-16 px-6 bg-transparent">

  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-gray-300">

    {/* Logo + Description */}
    <div>
      <h3 className="text-xl font-semibold text-white mb-2">ResumeLens AI</h3>
      <p className="text-gray-400 text-sm leading-relaxed">
        AI-powered resume analysis for professionals.
      </p>
    </div>

    {/* Product */}
    <div>
      <h4 className="font-semibold text-white mb-3">Product</h4>
      <ul className="space-y-2 text-sm">
        <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
        <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
      </ul>
    </div>

    {/* Company */}
    <div>
      <h4 className="font-semibold text-white mb-3">Company</h4>
      <ul className="space-y-2 text-sm">
        <li><Link href="#about" className="hover:text-white transition">About</Link></li>
        <li><Link href="#blog" className="hover:text-white transition">Blog</Link></li>
      </ul>
    </div>

    {/* Legal */}
    <div>
      <h4 className="font-semibold text-white mb-3">Legal</h4>
      <ul className="space-y-2 text-sm">
        <li><Link href="#privacy" className="hover:text-white transition">Privacy</Link></li>
        <li><Link href="#terms" className="hover:text-white transition">Terms</Link></li>
      </ul>
    </div>

  </div>

  {/* Bottom Row */}
  <div className="text-center mt-12 text-gray-400 text-sm">
    © {new Date().getFullYear()} ResumeLens AI. All rights reserved.
  </div>

  {/* Social Icons */}
  <div className="flex justify-center gap-6 mt-6 text-gray-400">

    <Link href="https://github.com" target="_blank" className="hover:text-white transition">
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.6-3.9-1.6-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.6 1.2 1.6 1.2 1 .1.9 2.4 3.8 1.8v-2.2c0-1-.3-1.7-.9-2.3-2.9-.3-6-1.5-6-6.8 0-1.5.6-2.9 1.6-3.9-.2-.4-.7-1.7.2-3.5 0 0 1.3-.4 4.1 1.6a13.6 13.6 0 0 1 7.4 0c2.8-2 4.1-1.6 4.1-1.6.9 1.8.4 3.1.2 3.5a5.6 5.6 0 0 1 1.6 3.9c0 5.3-3.1 6.4-6 6.8.6.5 1 1.4 1 2.7v2.4c0 .3.2.7.8.6a11.5 11.5 0 0 0 7.9-10.9C23.5 5.65 18.35.5 12 .5z"/>
      </svg>
    </Link>

    <Link href="https://linkedin.com" target="_blank" className="hover:text-white transition">
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.98 3.5C3.67 3.5 2.6 4.57 2.6 5.88s1.07 2.38 2.38 2.38c1.31 0 2.38-1.07 2.38-2.38S6.3 3.5 4.98 3.5zm.06 4.17H3.63V20h1.41V7.67zM9.59 7.67H8.19V20h1.4v-5.89c0-1.54.51-2.59 1.78-2.59 1.03 0 1.64.72 1.64 2.01V20h1.4v-6.44c0-2.48-1.31-3.63-3.07-3.63-1.45 0-2.05.81-2.35 1.36h.03V7.67z"/>
      </svg>
    </Link>

    <Link href="mailto:support@resumelens.ai" className="hover:text-white transition">
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 13.065 1.7 6h20.6L12 13.065zM12 15.23 2 8.5V18h20V8.5l-10 6.73z"/>
      </svg>
    </Link>

  </div>

</footer>




    </main>
  );
}
