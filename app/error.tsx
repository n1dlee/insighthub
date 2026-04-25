"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error:  Error & { digest?: string };
  reset:  () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-[#1E1B4B] mb-2">Something went wrong</h1>
      <p className="text-[#9CA3AF] mb-8 max-w-sm text-sm">
        An unexpected error occurred. Our team has been notified.
      </p>
      <button
        onClick={reset}
        className="rounded-xl px-6 py-3 text-sm font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
      >
        Try again
      </button>
    </div>
  );
}
