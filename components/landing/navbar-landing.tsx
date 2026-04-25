import Link from "next/link";

export function NavbarLanding() {
  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="mx-auto max-w-6xl glass rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            IH
          </div>
          <span className="font-bold text-[#1E1B4B]">InsightHub</span>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#6B7280]">
          <a href="#features" className="hover:text-[#6366F1] transition-colors cursor-pointer">Features</a>
          <a href="#about"    className="hover:text-[#6366F1] transition-colors cursor-pointer">About</a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-[#6366F1] hover:underline cursor-pointer"
          >
            Sign in
          </Link>
          <Link
            href="/register/student"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white cursor-pointer transition-all duration-200 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
