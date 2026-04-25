import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePostSchema, PaginationSchema } from "@/lib/validations";
import { apiError, apiOk } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const investorId = searchParams.get("investorId");
  const { page, limit } = PaginationSchema.parse({
    page:  searchParams.get("page"),
    limit: searchParams.get("limit"),
  });

  const where = investorId ? { investorId: Number(investorId) } : {};

  const [posts, total] = await Promise.all([
    prisma.investorPost.findMany({
      where,
      skip:  (page - 1) * limit,
      take:  limit,
      orderBy: { createdAt: "desc" },
      include: {
        investor: { select: { id: true, name: true, surname: true, companyName: true, profileImage: true } },
      },
    }),
    prisma.investorPost.count({ where }),
  ]);

  return apiOk({ posts, pagination: { page, limit, total } });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const role = (session.user as { role?: string }).role;
  if (role !== "INVESTOR") return apiError("Only investors can create investor posts", 403);

  let body: unknown;
  try { body = await req.json(); }
  catch { return apiError("Invalid JSON body", 400); }

  const parsed = CreatePostSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);
  }

  const post = await prisma.investorPost.create({
    data: { ...parsed.data, investorId: Number(session.user.id) },
    include: { investor: { select: { id: true, name: true, surname: true, companyName: true } } },
  });

  return apiOk({ post }, 201);
}
