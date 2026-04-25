import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3FF]">
      {/* Header */}
      <header className="border-b border-[rgba(99,102,241,0.1)] bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              IH
            </div>
            <span className="font-bold text-[#1E1B4B]">InsightHub</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="text-[#6B7280] hover:text-[#6366F1] transition-colors">Privacy</Link>
            <Link href="/terms"   className="text-[#6B7280] hover:text-[#6366F1] transition-colors">Terms</Link>
            <Link href="/contact" className="text-[#6B7280] hover:text-[#6366F1] transition-colors">Contact</Link>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(99,102,241,0.1)] bg-white/60 py-8">
        <div className="mx-auto max-w-4xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#9CA3AF]">
            © {new Date().getFullYear()} InsightHub. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/privacy" className="text-[#9CA3AF] hover:text-[#6366F1] transition-colors">Privacy</Link>
            <Link href="/terms"   className="text-[#9CA3AF] hover:text-[#6366F1] transition-colors">Terms</Link>
            <Link href="/contact" className="text-[#9CA3AF] hover:text-[#6366F1] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
