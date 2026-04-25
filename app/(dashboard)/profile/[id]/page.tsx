import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageButton } from "@/components/profile/message-button";
import { getInitials, getProfileImageUrl, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where:  { id: Number(id) },
    select: { name: true, surname: true },
  });
  if (!student) return { title: "Profile not found" };
  return { title: `${student.name} ${student.surname}` };
}

export default async function ProfilePage({ params }: Props) {
  const session = await auth();
  const { id }  = await params;

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

  if (!student) notFound();

  const isOwner  = session?.user?.id === String(student.id);
  const initials = getInitials(student.name, student.surname);
  const imageUrl = getProfileImageUrl("student", student.id, student.profileImage);

  const scores = [
    { label: "GPA",   value: student.gpa   != null ? student.gpa.toFixed(2)  : null, color: "#6366F1", max: "/ 4.0" },
    { label: "SAT",   value: student.sat   != null ? String(student.sat)      : null, color: "#8B5CF6", max: "/ 1600" },
    { label: "IELTS", value: student.ielts != null ? student.ielts.toFixed(1) : null, color: "#10B981", max: "/ 9.0" },
  ].filter(s => s.value !== null);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {/* Header card */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 mb-6 text-white"
        style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #10B981 100%)" }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6">
          <Avatar className="h-24 w-24 shrink-0 ring-4 ring-white/30">
            <AvatarImage src={imageUrl ?? undefined} alt={`${student.name} ${student.surname}`} />
            <AvatarFallback
              className="text-2xl font-bold text-[#6366F1] bg-white"
            >
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold">
              {student.name}{student.middle ? ` ${student.middle}` : ""} {student.surname}
            </h1>
            <p className="text-white/80 mt-1">{student.educationPlace}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white border-0 text-xs">{student.primaryDegree}</Badge>
              {student.major && <Badge className="bg-white/20 text-white border-0 text-xs">{student.major}</Badge>}
              {student.location && (
                <span className="text-white/70 text-xs flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {student.location}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 shrink-0">
            {isOwner ? (
              <Link
                href="/profile/edit"
                className="inline-flex items-center gap-2 rounded-xl bg-white/20 border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
                Edit Profile
              </Link>
            ) : (
              <MessageButton studentId={student.id} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Test Scores */}
          {scores.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h2 className="font-semibold text-[#1E1B4B] mb-4 flex items-center gap-2">
                <svg className="h-4 w-4 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
                Academic Scores
              </h2>
              <div className="space-y-3">
                {scores.map(({ label, value, color, max }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7280]">{label}</span>
                    <span className="text-sm font-bold" style={{ color }}>
                      {value} <span className="font-normal text-[#9CA3AF] text-xs">{max}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick info */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-[#1E1B4B]">Info</h2>
            <div className="text-sm space-y-2 text-[#6B7280]">
              <p>Age: <span className="text-[#1E1B4B] font-medium">{student.age}</span></p>
              <p>Member since: <span className="text-[#1E1B4B] font-medium">{formatDate(student.createdAt)}</span></p>
              {student.livesOutsideUS && (
                <Badge className="bg-[#EEF2FF] text-[#6366F1] border-0 text-xs">Lives outside US</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {student.bio && (
            <div className="glass rounded-2xl p-5">
              <h2 className="font-semibold text-[#1E1B4B] mb-3">About</h2>
              <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-line">{student.bio}</p>
            </div>
          )}

          {student.achievements && (
            <div className="glass rounded-2xl p-5">
              <h2 className="font-semibold text-[#1E1B4B] mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
                Achievements
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-line">{student.achievements}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
