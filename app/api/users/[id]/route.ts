import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateStudentSchema } from "@/lib/validations";
import { apiError, apiOk } from "@/lib/utils";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/users/:id
export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  const student = await prisma.student.findUnique({
    where:  { id: Number(id) },
    select: {
      id: true, name: true, surname: true, middle: true, age: true,
      email: true, educationPlace: true, primaryDegree: true,
      major: true, bio: true, achievements: true, profileImage: true,
      gpa: true, sat: true, ielts: true, location: true,
      livesOutsideUS: true, createdAt: true,
    },
  });

  if (!student) return apiError("Student not found", 404);
  return apiOk({ student });
}

// PUT /api/users/:id  ← Owner-only (FIX: was completely unprotected!)
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;

  // ← SECURITY FIX: verify the caller owns this resource
  if (session.user.id !== id) return apiError("Forbidden", 403);

  let body: unknown;
  try { body = await req.json(); }
  catch { return apiError("Invalid JSON body", 400); }

  const parsed = UpdateStudentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);
  }

  const student = await prisma.student.update({
    where: { id: Number(id) },
    data:  parsed.data,
    select: {
      id: true, name: true, surname: true, major: true,
      bio: true, location: true, profileImage: true,
    },
  });

  return apiOk({ student });
}

// DELETE /api/users/:id  ← Owner-only
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  if (session.user.id !== id) return apiError("Forbidden", 403);

  await prisma.student.delete({ where: { id: Number(id) } });
  return apiOk({ message: "Account deleted" });
}
