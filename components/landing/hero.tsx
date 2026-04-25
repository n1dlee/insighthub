import Link from "next/link";

const stats = [
  { value: "2,400+", label: "Students" },
  { value: "380+",   label: "Investors" },
  { value: "94%",    label: "Match rate" },
  { value: "47",     label: "Countries" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 px-6">
      {/* Radial gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-60 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -right-40 h-[400px] w-[400px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #10B981 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(99,102,241,0.25)] bg-white/60 px-4 py-1.5 text-sm font-medium text-[#6366F1] backdrop-blur-sm mb-8">
          <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
          Now connecting students from 47 countries
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1E1B4B] leading-[1.08]">
          Where{" "}
          <span
            className="gradient-text"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6, #10B981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            talent
          </span>{" "}
          meets{" "}
          <span
            className="gradient-text"
            style={{
              background: "linear-gradient(135deg, #10B981, #6366F1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            opportunity
          </span>
        </h1>

        <p className="mt-6 text-xl text-[#4B5563] max-w-2xl mx-auto leading-relaxed">
          InsightHub connects ambitious students from Central Asia with global
          investors and mentors — building the next generation of leaders.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register/student"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            Join as Student
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/register/investor"
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(99,102,241,0.25)] bg-white/70 px-7 py-3.5 text-base font-semibold text-[#6366F1] backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-md cursor-pointer"
          >
            Join as Investor
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="glass rounded-2xl p-5 text-center card-hover"
            >
              <p className="text-3xl font-bold text-[#6366F1]">{value}</p>
              <p className="mt-1 text-sm text-[#6B7280]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
