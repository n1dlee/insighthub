import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | InsightHub",
  description: "Terms and conditions for using the InsightHub platform.",
};

const EFFECTIVE_DATE = "April 25, 2025";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#6366F1] mb-4">
          Legal
        </span>
        <h1 className="text-4xl font-bold text-[#1E1B4B] mb-3">Terms of Service</h1>
        <p className="text-[#9CA3AF] text-sm">Effective date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="glass rounded-2xl p-8 border border-[rgba(99,102,241,0.1)]">
        <Section title="1. Acceptance of Terms">
          By registering for or using InsightHub, you agree to be bound by these Terms of Service.
          If you do not agree, do not use the platform. These terms constitute a legally binding agreement
          between you and InsightHub.
        </Section>

        <Section title="2. Description of Service">
          InsightHub is an educational networking platform that connects students — primarily from Central Asia —
          with global investors, mentors, and professionals. The platform provides profile creation,
          user discovery, messaging, and content posting features.
        </Section>

        <Section title="3. Eligibility">
          <ul>
            <li>You must be at least 14 years old to use InsightHub</li>
            <li>Investors and professionals must be at least 18 years old</li>
            <li>You must provide accurate and complete registration information</li>
            <li>You may not create more than one account per person</li>
          </ul>
        </Section>

        <Section title="4. User Accounts">
          <ul>
            <li>You are responsible for maintaining the confidentiality of your password</li>
            <li>You are responsible for all activity that occurs under your account</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
          </ul>
        </Section>

        <Section title="5. Acceptable Use">
          You agree NOT to:
          <ul>
            <li>Post false, misleading, or fraudulent information</li>
            <li>Harass, threaten, or intimidate other users</li>
            <li>Send unsolicited messages or spam</li>
            <li>Attempt to gain unauthorized access to any part of the platform</li>
            <li>Use the platform for any illegal purpose</li>
            <li>Impersonate another person or entity</li>
            <li>Scrape, crawl, or extract data from the platform without permission</li>
            <li>Upload malicious code or files</li>
          </ul>
        </Section>

        <Section title="6. Content">
          You retain ownership of content you post. By posting content, you grant InsightHub a
          non-exclusive, worldwide, royalty-free license to display and distribute that content
          on the platform. You are solely responsible for the content you post. We reserve the right
          to remove content that violates these terms without notice.
        </Section>

        <Section title="7. Privacy">
          Your use of InsightHub is also governed by our{" "}
          <a href="/privacy" className="text-[#6366F1] hover:underline">Privacy Policy</a>,
          which is incorporated into these terms by reference.
        </Section>

        <Section title="8. Intellectual Property">
          All platform code, design, logos, and trademarks are the property of InsightHub.
          You may not copy, reproduce, or redistribute any part of the platform without written permission.
        </Section>

        <Section title="9. Disclaimers">
          InsightHub is provided &quot;as is&quot; without warranties of any kind. We do not guarantee:
          <ul>
            <li>That the platform will be uninterrupted or error-free</li>
            <li>That connections made on the platform will result in investment or employment</li>
            <li>The accuracy of information provided by other users</li>
          </ul>
        </Section>

        <Section title="10. Limitation of Liability">
          To the fullest extent permitted by law, InsightHub shall not be liable for any indirect,
          incidental, special, or consequential damages arising from your use of the platform.
        </Section>

        <Section title="11. Termination">
          We may suspend or terminate your access to InsightHub at any time, with or without cause,
          with or without notice. You may delete your account at any time from your profile settings.
        </Section>

        <Section title="12. Changes to Terms">
          We reserve the right to modify these terms at any time. Continued use of the platform
          after changes constitutes acceptance of the new terms. The &quot;Effective date&quot; at the top
          of this page will be updated accordingly.
        </Section>

        <Section title="13. Governing Law">
          These terms are governed by and construed in accordance with applicable law.
          Any disputes shall be resolved through good-faith negotiation, or if necessary, binding arbitration.
        </Section>

        <Section title="14. Contact">
          For questions about these Terms, contact us at{" "}
          <a href="mailto:zayniddnovnodi@gmail.com" className="text-[#6366F1] hover:underline">
            zayniddnovnodi@gmail.com
          </a>
          {" "}or +1 (223) 272-25-90.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-[#1E1B4B] mb-3">{title}</h2>
      <div className="text-[#4B5563] text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
