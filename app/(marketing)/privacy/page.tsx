import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | InsightHub",
  description: "How InsightHub collects, uses, and protects your personal data.",
};

const EFFECTIVE_DATE = "April 25, 2025";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#6366F1] mb-4">
          Legal
        </span>
        <h1 className="text-4xl font-bold text-[#1E1B4B] mb-3">Privacy Policy</h1>
        <p className="text-[#9CA3AF] text-sm">Effective date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="glass rounded-2xl p-8 border border-[rgba(99,102,241,0.1)] prose prose-slate max-w-none">
        <Section title="1. Introduction">
          InsightHub (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
          you use our platform that connects students with investors and mentors.
        </Section>

        <Section title="2. Information We Collect">
          <b>Information you provide directly:</b>
          <ul>
            <li>Account details: name, surname, email address, and password (stored as a bcrypt hash — never in plain text)</li>
            <li>Profile information: university, degree, GPA, IELTS score, SAT score, bio, location, and profile photo</li>
            <li>For investors: company name, job title, work history, and skill experience</li>
            <li>Messages you send through the platform&apos;s chat system</li>
            <li>Posts and content you publish on the platform</li>
          </ul>
          <b>Information collected automatically:</b>
          <ul>
            <li>IP address and request headers (used for rate limiting and security, not stored long-term)</li>
            <li>Browser type and device information</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <li>To create and manage your account</li>
            <li>To facilitate connections between students and investors</li>
            <li>To deliver real-time chat messages</li>
            <li>To display your profile to other authenticated users</li>
            <li>To improve and maintain the platform</li>
            <li>To protect against fraud, abuse, and unauthorized access</li>
          </ul>
        </Section>

        <Section title="4. Data Sharing">
          We do <b>not</b> sell, trade, or rent your personal data to third parties. Your profile information
          is visible only to other authenticated InsightHub users. We may share data with:
          <ul>
            <li>Service providers who assist in operating our platform (database hosting, etc.) under strict confidentiality agreements</li>
            <li>Law enforcement, when required by applicable law</li>
          </ul>
        </Section>

        <Section title="5. Data Security">
          We implement industry-standard security measures:
          <ul>
            <li>Passwords are hashed using bcrypt with 12 rounds — never stored in plain text</li>
            <li>All API endpoints require authentication except public routes</li>
            <li>Rate limiting protects against brute-force attacks</li>
            <li>File uploads use UUID-based filenames to prevent enumeration</li>
            <li>HTTPS is enforced in production</li>
          </ul>
          Despite these measures, no system is 100% secure. We encourage you to use a strong, unique password.
        </Section>

        <Section title="6. Data Retention">
          We retain your data as long as your account is active. You may request deletion of your account
          at any time from your profile settings, after which all associated data will be permanently removed.
        </Section>

        <Section title="7. Your Rights">
          Depending on your location, you may have the right to:
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
          </ul>
          To exercise these rights, contact us at <a href="mailto:zayniddnovnodi@gmail.com" className="text-[#6366F1]">zayniddnovnodi@gmail.com</a>.
        </Section>

        <Section title="8. Cookies">
          We use a single session cookie to keep you authenticated. No third-party tracking cookies are used.
        </Section>

        <Section title="9. Children's Privacy">
          InsightHub is not intended for users under the age of 14. We do not knowingly collect personal
          information from children under 14.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify users of significant changes
          by updating the &quot;Effective date&quot; at the top of this page.
        </Section>

        <Section title="11. Contact">
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:zayniddnovnodi@gmail.com" className="text-[#6366F1]">zayniddnovnodi@gmail.com</a>{" "}
          or by phone at +1 (223) 272-25-90.
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
