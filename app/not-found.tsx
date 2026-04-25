import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div
        className="text-8xl font-bold mb-4"
        style={{
          background: "linear-gradient(135deg, #6366F1, #10B981)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </div>
      <h1 className="text-2xl font-bold text-[#1E1B4B] mb-2">Page not found</h1>
      <p className="text-[#9CA3AF] mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/feed"
        className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
      >
        Back to feed
      </Link>
    </div>
  );
}
