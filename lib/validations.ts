import { z } from "zod";

// Helper: accept null/undefined, transform both to undefined (optional DB field)
const nullStr = (max: number) =>
  z.string().max(max).nullish().transform(v => v ?? undefined);

// ─── Student ──────────────────────────────────────────────────────────────

export const RegisterStudentSchema = z.object({
  name:           z.string().min(1, "Name is required").max(50),
  surname:        z.string().min(1, "Surname is required").max(50),
  middle:         nullStr(50),
  age:            z.number().int().min(14).max(100),
  email:          z.string().email("Invalid email"),
  password:       z.string().min(8, "Password must be at least 8 characters").max(100),
  educationPlace: z.string().min(1).max(200),
  primaryDegree:  z.enum(["School", "Bachelors", "Masters", "PhD"]).default("Bachelors"),
  livesOutsideUS: z.boolean().optional().default(false),
});

export const UpdateStudentSchema = z.object({
  name:           z.string().min(1).max(50).optional(),
  surname:        z.string().min(1).max(50).optional(),
  middle:         nullStr(50),
  location:       nullStr(100),
  major:          nullStr(100),
  bio:            nullStr(2000),
  achievements:   nullStr(2000),
  gpa:            z.number().min(0).max(4).nullish().transform(v => v ?? undefined),
  sat:            z.number().int().min(400).max(1600).nullish().transform(v => v ?? undefined),
  ielts:          z.number().min(0).max(9).nullish().transform(v => v ?? undefined),
  livesOutsideUS: z.boolean().optional(),
  profileImage:   nullStr(500),
});

// ─── Investor ─────────────────────────────────────────────────────────────

export const RegisterInvestorSchema = z.object({
  name:           z.string().min(1).max(50),
  surname:        z.string().min(1).max(50),
  middle:         nullStr(50),
  age:            z.number().int().min(18).max(100),
  email:          z.string().email(),
  password:       z.string().min(8).max(100),
  companyName:    z.string().min(1).max(200),
  jobFunc:        z.string().min(1).max(200),
  livesOutsideUS: z.boolean().optional().default(false),
});

export const WorkHistorySchema = z.object({
  companyName:      z.string().min(1).max(200),
  position:         z.string().min(1).max(200),
  startDate:        z.string().datetime(),
  endDate:          z.string().datetime().nullish().transform(v => v ?? undefined),
  responsibilities: nullStr(2000),
});

export const WorkExperienceSchema = z.object({
  skillName:         z.string().min(1).max(100),
  yearsOfExperience: z.number().int().min(0).max(50),
  proficiencyLevel:  z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  description:       nullStr(1000),
});

export const UpdateInvestorSchema = z.object({
  name:           z.string().min(1).max(50).optional(),
  surname:        z.string().min(1).max(50).optional(),
  location:       nullStr(100),
  bio:            nullStr(2000),
  companyName:    z.string().max(200).optional(),
  jobFunc:        z.string().max(200).optional(),
  profileImage:   nullStr(500),
  workHistory:    z.array(WorkHistorySchema).optional(),
  workExperience: z.array(WorkExperienceSchema).optional(),
});

// ─── Auth ─────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  role:     z.enum(["STUDENT", "INVESTOR"]),
});

// ─── Chat ─────────────────────────────────────────────────────────────────

export const SendMessageSchema = z.object({
  conversationId: z.number().int().positive(),
  content:        z.string().min(1).max(5000).transform(s => s.trim()),
});

export const StartConversationSchema = z.object({
  participantId: z.number().int().positive(),
});

// ─── Post ─────────────────────────────────────────────────────────────────

export const CreatePostSchema = z.object({
  title:   z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
});

// ─── Pagination ───────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
