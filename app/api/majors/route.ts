import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const search = req.nextUrl.searchParams.get("search") ?? undefined;
  const majors = await prisma.major.findMany({
    where:   search ? { name: { contains: search, mode: "insensitive" } } : {},
    orderBy: { name: "asc" },
    take:    100,
  });

  return apiOk({ majors });
}
