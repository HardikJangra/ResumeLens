"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#050716] flex justify-center py-10 text-white">
      <div className="w-full max-w-4xl bg-[#0D1128] border border-[#1A1F36] rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

        <UserProfile
          appearance={{
            elements: {
              card: "bg-transparent shadow-none",
              navbar: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}
