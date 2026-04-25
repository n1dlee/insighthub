import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

function isAdmin(email: string | null | undefined) {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return apiError("Forbidden", 403);

  const { id } = await params;
  await prisma.investor.delete({ where: { id: Number(id) } });
  return apiOk({ message: "Investor deleted" });
}
