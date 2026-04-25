"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/feed";

  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ email: "", password: "" });

  async function handleLogin(role: "STUDENT" | "INVESTOR") {
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email:    form.email,
        password: form.password,
        role,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.replace(callbackUrl);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your InsightHub account
        </p>
      </div>

      <Tabs defaultValue="student">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="investor">Investor</TabsTrigger>
        </TabsList>

        {(["student", "investor"] as const).map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`email-${tab}`}>Email</Label>
              <Input
                id={`email-${tab}`}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`password-${tab}`}>Password</Label>
              <Input
                id={`password-${tab}`}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") handleLogin(tab === "student" ? "STUDENT" : "INVESTOR");
                }}
              />
            </div>

            <Button
              className="w-full cursor-pointer"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
              disabled={loading}
              onClick={() => handleLogin(tab === "student" ? "STUDENT" : "INVESTOR")}
            >
              {loading ? "Signing in…" : `Sign in as ${tab === "student" ? "Student" : "Investor"}`}
            </Button>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register/student" className="text-[#6366F1] hover:underline font-medium">
          Register
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6366F1] border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
