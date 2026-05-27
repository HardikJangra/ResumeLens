import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F1E8] px-4 py-10">
      <SignIn
        redirectUrl="/dashboard"
        afterSignInUrl="/dashboard"
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
            rootBox: "w-full flex justify-center",
            card: "w-full max-w-md border border-[rgba(45,40,32,0.10)] bg-[#FFFBF2] shadow-[0_24px_70px_rgba(45,40,32,0.12)]",
            headerTitle: "text-[#17201C]",
            headerSubtitle: "text-[#5F675F]",
            socialButtonsBlockButton: "border-[rgba(45,40,32,0.12)] bg-[#FFFBF2] text-[#17201C] hover:bg-[#F1E8DA]",
            formButtonPrimary: "bg-[#0F766E] hover:bg-[#0D665F] text-white shadow-[0_10px_22px_rgba(15,118,110,0.22)]",
            formFieldInput: "bg-[#F1E8DA] border-[rgba(45,40,32,0.12)] text-[#17201C]",
            footerActionLink: "text-[#0F766E] hover:text-[#0D665F]",
          },
        }}
      />
    </div>
  );
}
