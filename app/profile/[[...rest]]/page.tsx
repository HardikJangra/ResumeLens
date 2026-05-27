"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#F6F1E8] flex justify-center px-4 py-10 text-[#17201C]">
      <div className="w-full max-w-4xl bg-[#FFFBF2] border border-[rgba(45,40,32,0.10)] rounded-lg p-6 shadow-[0_24px_70px_rgba(45,40,32,0.10)]">
        <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

        <UserProfile
          appearance={{
            variables: {
              colorPrimary: "#0F766E",
              colorBackground: "#FFFBF2",
              colorText: "#17201C",
              colorTextSecondary: "#5F675F",
              colorInputBackground: "#F1E8DA",
              colorInputText: "#17201C",
              borderRadius: "8px",
              fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif",
            },
            elements: {
              card: "bg-transparent shadow-none",
              navbar: "bg-[#F1E8DA] border border-[rgba(45,40,32,0.10)] rounded-lg",
              navbarButton: "text-[#5F675F] hover:text-[#17201C]",
              navbarButtonIcon: "text-[#5F675F]",
              pageScrollBox: "bg-transparent",
              profileSection: "border-[rgba(45,40,32,0.10)]",
              profileSectionTitle: "text-[#17201C]",
              profileSectionContent: "text-[#5F675F]",
              formButtonPrimary: "bg-[#0F766E] hover:bg-[#0D665F] text-white shadow-[0_10px_22px_rgba(15,118,110,0.22)]",
              formFieldInput: "bg-[#F1E8DA] border-[rgba(45,40,32,0.12)] text-[#17201C]",
              badge: "bg-[rgba(15,118,110,0.10)] text-[#0F766E] border border-[rgba(15,118,110,0.18)]",
            },
          }}
        />
      </div>
    </div>
  );
}
