"use client";

import { User, Shield, CreditCard, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-[#050816] via-[#0b102a] to-[#050816] text-white">

      {/* ===== HEADER ===== */}
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/30 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/30 blur-[120px]" />

        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Settings
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl">
            Manage your profile, subscription, and security preferences.
          </p>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-10">

        {/* ===== PROFILE ===== */}
        <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(120,70,255,0.15)]">
          <div className="flex items-center gap-4 mb-6">
            <User className="text-purple-400" />
            <h2 className="text-2xl font-semibold">Profile</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-400">Full Name</label>
              <input
                type="text"
                placeholder="Hardik Jangra"
                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Email Address</label>
              <input
                type="email"
                placeholder="hardik@email.com"
                disabled
                className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <button className="mt-6 px-6 py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(120,70,255,0.6)] hover:opacity-90 transition">
            Save Changes
          </button>
        </section>

        {/* ===== PLAN ===== */}
        <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <CreditCard className="text-indigo-400" />
            <h2 className="text-2xl font-semibold">Subscription</h2>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-gray-400">Current Plan</p>
              <h3 className="text-3xl font-bold mt-1">Free</h3>
              <p className="text-gray-400 mt-1">
                Upgrade to unlock advanced AI insights.
              </p>
            </div>

            <button className="px-6 py-3 rounded-xl border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition">
              Upgrade Plan
            </button>
          </div>
        </section>

        {/* ===== SECURITY ===== */}
        <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="text-green-400" />
            <h2 className="text-2xl font-semibold">Security</h2>
          </div>

          <div className="space-y-4">
            <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-black/30 border border-white/10 hover:bg-white/5 transition">
              Change Password
            </button>

            <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-black/30 border border-white/10 hover:bg-white/5 transition">
              Manage Sessions
            </button>
          </div>
        </section>

        {/* ===== DANGER ZONE ===== */}
        <section className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <AlertTriangle className="text-red-400" />
            <h2 className="text-2xl font-semibold text-red-300">
              Danger Zone
            </h2>
          </div>

          <p className="text-red-300 mb-6">
            Deleting your account is permanent and cannot be undone.
          </p>

          <button className="px-6 py-3 rounded-xl bg-red-500/80 hover:bg-red-600 transition shadow-[0_0_20px_rgba(255,0,0,0.4)]">
            Delete Account
          </button>
        </section>

      </div>
    </main>
  );
}
