import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, getProfileImageUrl } from "@/lib/utils";

interface StudentCardProps {
  student: {
    id:             number;
    name:           string;
    surname:        string;
    educationPlace: string;
    major?:         string | null;
    primaryDegree:  string;
    location?:      string | null;
    gpa?:           number | null;
    profileImage?:  string | null;
  };
}

export function StudentCard({ student }: StudentCardProps) {
  const initials  = getInitials(student.name, student.surname);
  const imageUrl  = getProfileImageUrl("student", student.id, student.profileImage);

  return (
    <Link
      href={`/profile/${student.id}`}
      className="block glass rounded-2xl p-5 card-hover group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 shrink-0 ring-2 ring-[rgba(99,102,241,0.15)]">
          <AvatarImage src={imageUrl ?? undefined} alt={`${student.name} ${student.surname}`} />
          <AvatarFallback
            className="text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#1E1B4B] group-hover:text-[#6366F1] transition-colors truncate">
            {student.name} {student.surname}
          </p>
          <p className="text-sm text-[#6B7280] truncate mt-0.5">{student.educationPlace}</p>
          {student.location && (
            <p className="text-xs text-[#9CA3AF] flex items-center gap-1 mt-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {student.location}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs bg-[#EEF2FF] text-[#6366F1] border-0">
          {student.primaryDegree}
        </Badge>
        {student.major && (
          <Badge variant="secondary" className="text-xs bg-[#F5F3FF] text-[#8B5CF6] border-0 truncate max-w-[140px]">
            {student.major}
          </Badge>
        )}
        {student.gpa != null && (
          <Badge variant="secondary" className="text-xs bg-[#ECFDF5] text-[#10B981] border-0">
            GPA {student.gpa.toFixed(1)}
          </Badge>
        )}
      </div>
    </Link>
  );
}

interface InvestorCardProps {
  investor: {
    id:           number;
    name:         string;
    surname:      string;
    companyName:  string;
    jobFunc:      string;
    location?:    string | null;
    profileImage?: string | null;
  };
}

export function InvestorCard({ investor }: InvestorCardProps) {
  const initials = getInitials(investor.name, investor.surname);
  const imageUrl = getProfileImageUrl("investor", investor.id, investor.profileImage);

  return (
    <Link
      href={`/profile/investor-${investor.id}`}
      className="block glass rounded-2xl p-5 card-hover group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 shrink-0 ring-2 ring-[rgba(16,185,129,0.15)]">
          <AvatarImage src={imageUrl ?? undefined} alt={`${investor.name} ${investor.surname}`} />
          <AvatarFallback
            className="text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#1E1B4B] group-hover:text-[#10B981] transition-colors truncate">
            {investor.name} {investor.surname}
          </p>
          <p className="text-sm text-[#6B7280] truncate mt-0.5">{investor.jobFunc}</p>
          <p className="text-xs text-[#9CA3AF] truncate mt-0.5">{investor.companyName}</p>
        </div>
      </div>

      {investor.location && (
        <p className="mt-3 text-xs text-[#9CA3AF] flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {investor.location}
        </p>
      )}

      <div className="mt-3">
        <Badge variant="secondary" className="text-xs bg-[#ECFDF5] text-[#10B981] border-0">
          Investor
        </Badge>
      </div>
    </Link>
  );
}
