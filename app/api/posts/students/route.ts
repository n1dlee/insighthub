import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePostSchema, PaginationSchema } from "@/lib/validations";
import { apiError, apiOk } from "@/lib/utils";
import { auth } from "@/lib/auth";

// GET /api/posts/students?studentId=1&page=1
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const studentId = searchParams.get("studentId");
  const { page, limit } = PaginationSchema.parse({
    page:  searchParams.get("page"),
    limit: searchParams.get("limit"),
  });

  const where = studentId ? { studentId: Number(studentId) } : {};

  const [posts, total] = await Promise.all([
    prisma.studentPost.findMany({
      where,
      skip:  (page - 1) * limit,
      take:  limit,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, surname: true, profileImage: true } },
      },
    }),
    prisma.studentPost.count({ where }),
  ]);

  return apiOk({ posts, pagination: { page, limit, total } });
}

// POST /api/posts/students — create post (auth required, ownership enforced)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  let body: unknown;
  try { body = await req.json(); }
  catch { return apiError("Invalid JSON body", 400); }

  const parsed = CreatePostSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);
  }

  const post = await prisma.studentPost.create({
    data: {
      ...parsed.data,
      studentId: Number(session.user.id), // ← ALWAYS use session, never client-supplied userId
    },
    include: {
      student: { select: { id: true, name: true, surname: true } },
    },
  });

  return apiOk({ post }, 201);
}
