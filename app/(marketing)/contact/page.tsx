import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | InsightHub",
  description: "Get in touch with the InsightHub team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#6366F1] mb-4">
          Contact
        </span>
        <h1 className="text-4xl font-bold text-[#1E1B4B] mb-4">Get in Touch</h1>
        <p className="text-[#6B7280] text-lg">
          Have a question or want to learn more about InsightHub? We&apos;d love to hear from you.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {/* Email */}
        <a
          href="mailto:zayniddnovnodi@gmail.com"
          className="group glass rounded-2xl p-6 border border-[rgba(99,102,241,0.1)] hover:border-[rgba(99,102,241,0.3)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.12)] transition-all duration-200 cursor-pointer"
        >
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Email</p>
          <p className="font-semibold text-[#1E1B4B] group-hover:text-[#6366F1] transition-colors break-all">
            zayniddnovnodi@gmail.com
          </p>
          <p className="text-sm text-[#9CA3AF] mt-2">We reply within 24 hours</p>
        </a>

        {/* Phone */}
        <a
          href="tel:+12232722590"
          className="group glass rounded-2xl p-6 border border-[rgba(99,102,241,0.1)] hover:border-[rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.10)] transition-all duration-200 cursor-pointer"
        >
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Phone</p>
          <p className="font-semibold text-[#1E1B4B] group-hover:text-[#10B981] transition-colors">
            +1 (223) 272-25-90
          </p>
          <p className="text-sm text-[#9CA3AF] mt-2">Mon–Fri, 9 AM – 6 PM</p>
        </a>
      </div>

      {/* FAQ */}
      <div className="glass rounded-2xl p-8 border border-[rgba(99,102,241,0.1)]">
        <h2 className="text-xl font-bold text-[#1E1B4B] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-5">
          {[
            {
              q: "Who can join InsightHub?",
              a: "InsightHub is open to students from Central Asia and global investors and mentors who want to connect with them.",
            },
            {
              q: "Is InsightHub free to use?",
              a: "Yes, InsightHub is currently free for all users during our beta period.",
            },
            {
              q: "How do I delete my account?",
              a: "You can delete your account from your profile settings page. All your data will be permanently removed.",
            },
            {
              q: "How is my data protected?",
              a: "We take privacy seriously. Your data is encrypted and never sold to third parties. See our Privacy Policy for details.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-[rgba(99,102,241,0.08)] pb-5 last:border-0 last:pb-0">
              <p className="font-semibold text-[#1E1B4B] mb-1">{q}</p>
              <p className="text-sm text-[#6B7280]">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
