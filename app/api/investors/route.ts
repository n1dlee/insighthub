import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterInvestorSchema, PaginationSchema } from "@/lib/validations";
import { apiError, apiOk } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

// GET /api/investors?page=1&limit=20
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const { page, limit } = PaginationSchema.parse({
    page:  searchParams.get("page")  ?? 1,
    limit: searchParams.get("limit") ?? 20,
  });

  const search = searchParams.get("search") ?? undefined;
  const where = search ? {
    OR: [
      { name:        { contains: search, mode: "insensitive" as const } },
      { surname:     { contains: search, mode: "insensitive" as const } },
      { companyName: { contains: search, mode: "insensitive" as const } },
    ],
  } : {};

  const [investors, total] = await Promise.all([
    prisma.investor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, surname: true, age: true,
        companyName: true, jobFunc: true, location: true,
        bio: true, profileImage: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.investor.count({ where }),
  ]);

  return apiOk({
    investors,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/investors — register investor
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = rateLimit(`register:${ip}`, { limit: 5, windowMs: 60 });
  if (!rl.success) return apiError("Too many requests. Try again later.", 429);

  let body: unknown;
  try { body = await req.json(); }
  catch { return apiError("Invalid JSON body", 400); }

  const parsed = RegisterInvestorSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);
  }

  const { email, password, ...rest } = parsed.data;

  const exists = await prisma.investor.findUnique({ where: { email } });
  if (exists) return apiError("Email already in use", 409);

  const hashed = await bcrypt.hash(password, 12);

  const investor = await prisma.investor.create({
    data: { email, password: hashed, ...rest },
    select: { id: true, name: true, surname: true, email: true, createdAt: true },
  });

  return apiOk({ investor }, 201);
}
