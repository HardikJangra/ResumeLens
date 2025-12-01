import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="pt-32 text-center space-y-10 px-6">

      <h1 className="text-5xl font-bold tracking-tight">
        Your AI-Powered Resume Intelligence Tool
      </h1>

      <p className="text-gray-600 max-w-xl mx-auto text-lg">
        Instantly analyze your resume with ATS scoring, missing skills detection,
        and role-based improvement suggestions — powered by AI.
      </p>

      <SignedOut>
        <Button asChild>
          <Link href="/sign-in">Get Started</Link>
        </Button>
      </SignedOut>

      <SignedIn>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </SignedIn>

    </main>
  );
}
