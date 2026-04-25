/**
 * Prisma seed — universities & majors (UTF-8, no iconv-lite needed)
 * Run: npx prisma db seed
 */
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import "dotenv/config";

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const UNIVERSITIES = [
  { name: "MIT",                         location: "Cambridge, USA" },
  { name: "Stanford University",          location: "Stanford, USA" },
  { name: "Harvard University",           location: "Cambridge, USA" },
  { name: "Yale University",              location: "New Haven, USA" },
  { name: "Princeton University",         location: "Princeton, USA" },
  { name: "Columbia University",          location: "New York, USA" },
  { name: "University of Oxford",         location: "Oxford, UK" },
  { name: "University of Cambridge",      location: "Cambridge, UK" },
  { name: "Imperial College London",      location: "London, UK" },
  { name: "ETH Zurich",                   location: "Zurich, Switzerland" },
  { name: "National University of Singapore", location: "Singapore" },
  { name: "University of Toronto",        location: "Toronto, Canada" },
  { name: "University of Melbourne",      location: "Melbourne, Australia" },
  { name: "Lomonosov Moscow State University", location: "Moscow, Russia" },
  // Uzbekistan
  { name: "Westminster International University in Tashkent", location: "Tashkent, Uzbekistan" },
  { name: "INHA University in Tashkent",  location: "Tashkent, Uzbekistan" },
  { name: "Turin Polytechnic University in Tashkent", location: "Tashkent, Uzbekistan" },
  { name: "National University of Uzbekistan", location: "Tashkent, Uzbekistan" },
  { name: "Tashkent State Technical University", location: "Tashkent, Uzbekistan" },
  { name: "Samarkand State University",   location: "Samarkand, Uzbekistan" },
  { name: "Tashkent University of Information Technologies", location: "Tashkent, Uzbekistan" },
  { name: "Kazakh National University",   location: "Almaty, Kazakhstan" },
  { name: "Nazarbayev University",        location: "Astana, Kazakhstan" },
  { name: "Kyrgyz National University",   location: "Bishkek, Kyrgyzstan" },
];

const MAJORS = [
  "Computer Science",
  "Data Science",
  "Artificial Intelligence",
  "Cybersecurity",
  "Software Engineering",
  "Information Technology",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Biomedical Engineering",
  "Mathematics",
  "Statistics",
  "Physics",
  "Chemistry",
  "Biology",
  "Business Administration",
  "Finance",
  "Accounting",
  "Economics",
  "Marketing",
  "Management",
  "International Business",
  "Psychology",
  "Sociology",
  "Political Science",
  "International Relations",
  "Law",
  "Medicine",
  "Pharmacy",
  "Nursing",
  "Public Health",
  "Architecture",
  "Graphic Design",
  "Industrial Design",
  "Education",
  "Linguistics",
  "English Literature",
  "History",
  "Philosophy",
  "Environmental Science",
  "Biotechnology",
  "Robotics",
  "Machine Learning",
  "Blockchain Technology",
  "Game Development",
  "UX/UI Design",
  "Digital Marketing",
  "Supply Chain Management",
];

async function main() {
  console.log("🌱 Seeding database…");

  // Upsert universities
  let uniCount = 0;
  for (const uni of UNIVERSITIES) {
    await prisma.university.upsert({
      where:  { id: await getOrCreate(uni.name) },
      update: {},
      create: uni,
    });
    uniCount++;
  }

  // Upsert majors
  let majorCount = 0;
  for (const name of MAJORS) {
    const existing = await prisma.major.findFirst({ where: { name } });
    if (!existing) {
      await prisma.major.create({ data: { name } });
      majorCount++;
    }
  }

  console.log(`✅ Seeded ${uniCount} universities, ${majorCount} new majors`);
}

async function getOrCreate(name: string): Promise<number> {
  const existing = await prisma.university.findFirst({ where: { name } });
  if (existing) return existing.id;
  // Return a dummy ID that won't match — upsert create path will handle it
  return -1;
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
