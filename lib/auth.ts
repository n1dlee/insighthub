import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },

  pages: {
    signIn:  "/login",
    error:   "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
        role:     { label: "Role",     type: "text"     },
      },

      async authorize(credentials) {
        // Validate input shape
        const parsed = LoginSchema.safeParse({
          email:    credentials?.email,
          password: credentials?.password,
          role:     credentials?.role,
        });
        if (!parsed.success) return null;

        const { email, password, role } = parsed.data;

        if (role === "STUDENT") {
          const student = await prisma.student.findUnique({ where: { email } });
          if (!student) return null;
          const valid = await bcrypt.compare(password, student.password);
          if (!valid) return null;
          return {
            id:    String(student.id),
            email: student.email,
            name:  `${student.name} ${student.surname}`,
            role:  "STUDENT",
          };
        }

        if (role === "INVESTOR") {
          const investor = await prisma.investor.findUnique({ where: { email } });
          if (!investor) return null;
          const valid = await bcrypt.compare(password, investor.password);
          if (!valid) return null;
          return {
            id:    String(investor.id),
            email: investor.email,
            name:  `${investor.name} ${investor.surname}`,
            role:  "INVESTOR",
          };
        }

        return null;
      },
    }),
  ],
});
