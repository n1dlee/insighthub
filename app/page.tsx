import { NavbarLanding } from "@/components/landing/navbar-landing";
import { Hero }          from "@/components/landing/hero";
import { Features }      from "@/components/landing/features";
import { CTA }           from "@/components/landing/cta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InsightHub — Student-Investor Networking Platform",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarLanding />

      <main className="flex-1">
        <Hero />
        <div id="features">
          <Features />
        </div>
        <CTA />
      </main>

      <footer className="border-t border-[rgba(99,102,241,0.1)] py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9CA3AF]">
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center text-white font-bold text-[10px]"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              IH
            </div>
            <span>InsightHub © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-[#6366F1] transition-colors">Privacy</a>
            <a href="/terms"   className="hover:text-[#6366F1] transition-colors">Terms</a>
            <a href="/contact" className="hover:text-[#6366F1] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
