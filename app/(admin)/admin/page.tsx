import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard | InsightHub" };

async function getStats() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [students, investors, studentPosts, investorPosts, conversations, messages, newStudents, newInvestors] =
    await Promise.all([
      prisma.student.count(),
      prisma.investor.count(),
      prisma.studentPost.count(),
      prisma.investorPost.count(),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.student.count({ where: { createdAt: { gte: since } } }),
      prisma.investor.count({ where: { createdAt: { gte: since } } }),
    ]);
  return { students, investors, studentPosts, investorPosts, conversations, messages, newStudents, newInvestors };
}

async function getRecent() {
  const [recentStudents, recentInvestors] = await Promise.all([
    prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, surname: true, email: true, educationPlace: true, createdAt: true },
    }),
    prisma.investor.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, surname: true, email: true, companyName: true, createdAt: true },
    }),
  ]);
  return { recentStudents, recentInvestors };
}

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getStats(), getRecent()]);

  const cards = [
    { label: "Total Students",   value: stats.students,      badge: `+${stats.newStudents} this week`,  color: "#6366F1", href: "/admin/students" },
    { label: "Total Investors",  value: stats.investors,     badge: `+${stats.newInvestors} this week`, color: "#10B981", href: "/admin/investors" },
    { label: "Student Posts",    value: stats.studentPosts,  badge: "all time", color: "#8B5CF6", href: null },
    { label: "Investor Posts",   value: stats.investorPosts, badge: "all time", color: "#F59E0B", href: null },
    { label: "Conversations",    value: stats.conversations, badge: "all time", color: "#3B82F6", href: null },
    { label: "Messages Sent",    value: stats.messages,      badge: "all time", color: "#EC4899", href: null },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1E1B4B]">Dashboard</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Platform overview and statistics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(({ label, value, badge, color, href }) => {
          const inner = (
            <div className="glass rounded-2xl p-5 border border-[rgba(99,102,241,0.1)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.10)] transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-[#6B7280]">{label}</p>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ background: color }}
                >
                  {badge}
                </span>
              </div>
              <p className="text-3xl font-bold" style={{ color }}>{value.toLocaleString()}</p>
            </div>
          );
          return href ? (
            <Link key={label} href={href} className="block cursor-pointer">{inner}</Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>

      {/* Recent registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent students */}
        <div className="glass rounded-2xl border border-[rgba(99,102,241,0.1)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(99,102,241,0.08)]">
            <h2 className="font-semibold text-[#1E1B4B]">Recent Students</h2>
            <Link href="/admin/students" className="text-xs text-[#6366F1] hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-[rgba(99,102,241,0.06)]">
            {recent.recentStudents.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[#9CA3AF]">No students yet</p>
            ) : recent.recentStudents.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                >
                  {s.name[0]}{s.surname[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E1B4B] truncate">{s.name} {s.surname}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">{s.email}</p>
                </div>
                <p className="text-xs text-[#9CA3AF] shrink-0">{new Date(s.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent investors */}
        <div className="glass rounded-2xl border border-[rgba(99,102,241,0.1)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(99,102,241,0.08)]">
            <h2 className="font-semibold text-[#1E1B4B]">Recent Investors</h2>
            <Link href="/admin/investors" className="text-xs text-[#10B981] hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-[rgba(99,102,241,0.06)]">
            {recent.recentInvestors.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[#9CA3AF]">No investors yet</p>
            ) : recent.recentInvestors.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
                >
                  {inv.name[0]}{inv.surname[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E1B4B] truncate">{inv.name} {inv.surname}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">{inv.companyName}</p>
                </div>
                <p className="text-xs text-[#9CA3AF] shrink-0">{new Date(inv.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
