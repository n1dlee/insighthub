import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <div
          className="relative overflow-hidden rounded-3xl p-12 text-center"
          style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #10B981 100%)" }}
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10" />

          <p className="relative text-sm font-semibold uppercase tracking-widest text-white/70 mb-4">
            Get started today
          </p>
          <h2 className="relative text-4xl font-bold text-white mb-4">
            Ready to find your match?
          </h2>
          <p className="relative text-lg text-white/80 max-w-xl mx-auto mb-10">
            Join thousands of students and investors already building connections on InsightHub.
            It&apos;s free to get started.
          </p>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register/student"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-[#6366F1] shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
            >
              Start as Student
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/register/investor"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 cursor-pointer"
            >
              Join as Investor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
