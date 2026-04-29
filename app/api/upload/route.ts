import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/utils";
import { auth } from "@/lib/auth";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE      = 3 * 1024 * 1024; // 3 MB

// POST /api/upload?role=student|investor
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const role = req.nextUrl.searchParams.get("role") as "student" | "investor" | null;
  if (!role || !["student", "investor"].includes(role)) {
    return apiError("role query param must be 'student' or 'investor'", 400);
  }

  const userId = session.user.id;

  const formData = await req.formData().catch(() => null);
  if (!formData) return apiError("Could not parse form data", 400);

  const file = formData.get("profileImage") as File | null;
  if (!file) return apiError("No file provided", 400);

  if (!ALLOWED_TYPES.includes(file.type)) {
    return apiError("Only PNG, JPG, JPEG, and WEBP images are allowed", 400);
  }
  if (file.size > MAX_SIZE) {
    return apiError("File too large. Maximum size is 3 MB.", 400);
  }

  const ext      = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `${randomUUID()}.${ext}`;
  const blobPath = `profiles/${role}/${userId}/${filename}`;

  // Upload to Vercel Blob Storage
  const blob = await put(blobPath, file, {
    access:      "public",
    contentType: file.type,
  });

  // Save full Blob URL to database
  if (role === "student") {
    await prisma.student.update({
      where: { id: Number(userId) },
      data:  { profileImage: blob.url },
    });
  } else {
    await prisma.investor.update({
      where: { id: Number(userId) },
      data:  { profileImage: blob.url },
    });
  }

  return apiOk({ imageUrl: blob.url });
}
