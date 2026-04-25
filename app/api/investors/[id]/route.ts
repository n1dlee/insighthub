import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateInvestorSchema } from "@/lib/validations";
import { apiError, apiOk } from "@/lib/utils";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  const investor = await prisma.investor.findUnique({
    where: { id: Number(id) },
    select: {
      id: true, name: true, surname: true, middle: true, age: true,
      email: true, companyName: true, jobFunc: true, bio: true,
      profileImage: true, location: true, livesOutsideUS: true, createdAt: true,
      workHistory:   { orderBy: { startDate: "desc" } },
      workExperience: { orderBy: { yearsOfExperience: "desc" } },
    },
  });

  if (!investor) return apiError("Investor not found", 404);
  return apiOk({ investor });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  if (session.user.id !== id) return apiError("Forbidden", 403);

  let body: unknown;
  try { body = await req.json(); }
  catch { return apiError("Invalid JSON body", 400); }

  const parsed = UpdateInvestorSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);
  }

  const { workHistory, workExperience, ...profileData } = parsed.data;
  const numId = Number(id);

  // Transactionally update investor + replace work records
  await prisma.$transaction(async (tx) => {
    await tx.investor.update({ where: { id: numId }, data: profileData });

    if (workHistory !== undefined) {
      await tx.workHistory.deleteMany({ where: { investorId: numId } });
      if (workHistory.length > 0) {
        await tx.workHistory.createMany({
          data: workHistory.map(w => ({
            ...w,
            investorId: numId,
            startDate:  new Date(w.startDate),
            endDate:    w.endDate ? new Date(w.endDate) : null,
          })),
        });
      }
    }

    if (workExperience !== undefined) {
      await tx.workExperience.deleteMany({ where: { investorId: numId } });
      if (workExperience.length > 0) {
        await tx.workExperience.createMany({
          data: workExperience.map(w => ({ ...w, investorId: numId })),
        });
      }
    }
  });

  const investor = await prisma.investor.findUnique({
    where:  { id: numId },
    select: { id: true, name: true, surname: true, bio: true, location: true, profileImage: true },
  });

  return apiOk({ investor });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  if (session.user.id !== id) return apiError("Forbidden", 403);

  await prisma.investor.delete({ where: { id: Number(id) } });
  return apiOk({ message: "Account deleted" });
}
