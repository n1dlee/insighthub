import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradient blobs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #10B981 0%, transparent 70%)" }}
      />

      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          IH
        </div>
        <span className="text-xl font-bold text-foreground group-hover:text-[#6366F1] transition-colors">
          InsightHub
        </span>
      </Link>

      {/* Auth card */}
      <div className="glass w-full max-w-md rounded-2xl border shadow-[0_8px_40px_rgba(99,102,241,0.12)] p-8">
        {children}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} InsightHub. All rights reserved.
      </p>
    </div>
  );
}
