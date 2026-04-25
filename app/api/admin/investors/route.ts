import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/utils";

function isAdmin(email: string | null | undefined) {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return apiError("Forbidden", 403);

  const { searchParams } = req.nextUrl;
  const page   = Number(searchParams.get("page")  ?? 1);
  const limit  = Number(searchParams.get("limit") ?? 20);
  const search = searchParams.get("search") ?? undefined;

  const where = search
    ? {
        OR: [
          { name:        { contains: search, mode: "insensitive" as const } },
          { surname:     { contains: search, mode: "insensitive" as const } },
          { email:       { contains: search, mode: "insensitive" as const } },
          { companyName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [investors, total] = await Promise.all([
    prisma.investor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, surname: true, email: true,
        companyName: true, jobFunc: true, createdAt: true,
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.investor.count({ where }),
  ]);

  return apiOk({ investors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}
