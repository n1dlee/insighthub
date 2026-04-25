import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/utils";

function isAdmin(email: string | null | undefined) {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return apiError("Forbidden", 403);

  const [students, investors, studentPosts, investorPosts, conversations, messages] =
    await Promise.all([
      prisma.student.count(),
      prisma.investor.count(),
      prisma.studentPost.count(),
      prisma.investorPost.count(),
      prisma.conversation.count(),
      prisma.message.count(),
    ]);

  // New registrations in last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [newStudents, newInvestors] = await Promise.all([
    prisma.student.count({ where: { createdAt: { gte: since } } }),
    prisma.investor.count({ where: { createdAt: { gte: since } } }),
  ]);

  return apiOk({
    students, investors, studentPosts, investorPosts, conversations, messages,
    newStudents, newInvestors,
  });
}
