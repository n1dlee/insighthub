import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterStudentSchema, PaginationSchema } from "@/lib/validations";
import { apiError, apiOk } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

// GET /api/users?page=1&limit=20&university=MIT&major=CS
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const { page, limit } = PaginationSchema.parse({
    page:  searchParams.get("page")  ?? 1,
    limit: searchParams.get("limit") ?? 20,
  });

  const university = searchParams.get("university") ?? undefined;
  const major      = searchParams.get("major")      ?? undefined;
  const search     = searchParams.get("search")     ?? undefined;

  const where = {
    ...(university && { educationPlace: { contains: university, mode: "insensitive" as const } }),
    ...(major      && { major:          { contains: major,      mode: "insensitive" as const } }),
    ...(search     && {
      OR: [
        { name:    { contains: search, mode: "insensitive" as const } },
        { surname: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, surname: true, age: true,
        educationPlace: true, major: true, primaryDegree: true,
        location: true, bio: true, profileImage: true,
        gpa: true, sat: true, ielts: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.student.count({ where }),
  ]);

  return apiOk({
    students,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/users — register student (rate limited)
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = rateLimit(`register:${ip}`, { limit: 5, windowMs: 60 });
  if (!rl.success) return apiError("Too many requests. Try again later.", 429);

  let body: unknown;
  try { body = await req.json(); }
  catch { return apiError("Invalid JSON body", 400); }

  const parsed = RegisterStudentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);
  }

  const { email, password, ...rest } = parsed.data;

  // Check email uniqueness
  const exists = await prisma.student.findUnique({ where: { email } });
  if (exists) return apiError("Email already in use", 409);

  // bcrypt 12 rounds (fixed from original 5!)
  const hashed = await bcrypt.hash(password, 12);

  const student = await prisma.student.create({
    data: { email, password: hashed, ...rest },
    select: { id: true, name: true, surname: true, email: true, createdAt: true },
  });

  return apiOk({ student }, 201);
}
