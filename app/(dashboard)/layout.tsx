import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/dashboard/navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen">
        <Navbar />
        {/* Offset for fixed navbar */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
