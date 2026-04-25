import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentCard } from "@/components/dashboard/user-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Feed" };

export default async function FeedPage() {
  const session = await auth();

  // Fetch recent students (server-side, no loading state needed)
  const students = await prisma.student.findMany({
    take:    12,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, surname: true, educationPlace: true,
      major: true, primaryDegree: true, location: true,
      gpa: true, profileImage: true,
    },
  });

  const investors = await prisma.investor.findMany({
    take:    6,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, surname: true,
      companyName: true, jobFunc: true, location: true, profileImage: true,
    },
  });

  const role = (session?.user as { role?: string })?.role;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Welcome banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 mb-8 text-white"
        style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6 60%, #10B981)" }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <p className="text-sm font-medium text-white/70 mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold">{session?.user?.name} 👋</h1>
        <p className="mt-1 text-white/80 text-sm">
          {role === "STUDENT"
            ? "Connect with investors and mentors who can help you grow."
            : "Discover talented students ready to make an impact."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Students section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#1E1B4B]">Recent Students</h2>
            <a href="/discover" className="text-sm text-[#6366F1] hover:underline cursor-pointer">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {students.map((s: typeof students[number]) => (
              <StudentCard key={s.id} student={s} />
            ))}
          </div>
        </div>

        {/* Investors sidebar */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#1E1B4B]">Investors</h2>
          </div>
          <div className="space-y-4">
            {investors.map((inv: typeof investors[number]) => (
              <div key={inv.id} className="glass rounded-2xl p-4 card-hover">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0"
                    style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
                  >
                    {inv.name[0]}{inv.surname[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1E1B4B] text-sm truncate">
                      {inv.name} {inv.surname}
                    </p>
                    <p className="text-xs text-[#9CA3AF] truncate">{inv.companyName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
