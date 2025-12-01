import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="backdrop-blur-md bg-white/70 border-b fixed w-full top-0 left-0 z-50">
      <div className="max-w-5xl mx-auto py-4 px-6 flex justify-between items-center">

        <Link href="/" className="font-bold text-xl">
          ResumeIQ
        </Link>

        <div className="flex items-center gap-6">
          <SignedIn>
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/history" className="hover:text-blue-600">
              History
            </Link>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <Link
              href="/sign-in"
              className="bg-black text-white px-4 py-2 rounded-md"
            >
              Sign In
            </Link>
          </SignedOut>
        </div>

      </div>
    </nav>
  );
}
