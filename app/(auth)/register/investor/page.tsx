"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterInvestorPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", surname: "", age: "", email: "",
    password: "", confirmPassword: "", companyName: "", jobFunc: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/investors", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        form.name,
          surname:     form.surname,
          age:         Number(form.age),
          email:       form.email,
          password:    form.password,
          companyName: form.companyName,
          jobFunc:     form.jobFunc,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Registration failed"); return; }
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Create investor account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connect with talented students worldwide</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="name">First name</Label>
            <Input id="name" required placeholder="John" value={form.name} onChange={set("name")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="surname">Last name</Label>
            <Input id="surname" required placeholder="Doe" value={form.surname} onChange={set("surname")} />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" required min={18} max={100} placeholder="35" value={form.age} onChange={set("age")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="company">Company</Label>
          <Input id="company" required placeholder="Acme Ventures" value={form.companyName} onChange={set("companyName")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="jobFunc">Role / Title</Label>
          <Input id="jobFunc" required placeholder="Managing Director" value={form.jobFunc} onChange={set("jobFunc")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="you@company.com" value={form.email} onChange={set("email")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} placeholder="••••••••" value={form.password} onChange={set("password")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" required minLength={8} placeholder="••••••••" value={form.confirmPassword} onChange={set("confirmPassword")} />
        </div>

        <Button
          type="submit"
          className="w-full cursor-pointer"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-[#6366F1] hover:underline font-medium">Sign in</Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Are you a student?{" "}
        <Link href="/register/student" className="text-[#6366F1] hover:underline font-medium">Register here</Link>
      </p>
    </>
  );
}
