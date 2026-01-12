"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / 100, y: e.clientY / 100 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Prevent hydration mismatch
  if (!isLoaded) return null;

  return (
    <nav className="relative z-50 flex items-center justify-between px-8 py-6 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
      {/* LOGO */}
      <Link href="/" className="flex items-center gap-2">
        <div className="h-9 w-9 bg-linear-to-tr from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-extrabold text-lg">★</span>
        </div>
        <span className="font-semibold text-lg tracking-tight">
          ResumeLens AI
        </span>
      </Link>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-4">
        {/* NOT SIGNED IN */}
        {!isSignedIn && (
          <>
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
          </>
        )}

        {/* SIGNED IN */}
        {isSignedIn && (
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition"
          >
            Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}
