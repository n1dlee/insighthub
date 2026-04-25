"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterStudentPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", surname: "", age: "", email: "",
    password: "", confirmPassword: "", educationPlace: "",
    primaryDegree: "Bachelors",
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
      const res = await fetch("/api/users", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:           form.name,
          surname:        form.surname,
          age:            Number(form.age),
          email:          form.email,
          password:       form.password,
          educationPlace: form.educationPlace,
          primaryDegree:  form.primaryDegree,
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
        <h1 className="text-2xl font-bold">Create student account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start connecting with investors today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="name">First name</Label>
            <Input id="name" required placeholder="Alex" value={form.name} onChange={set("name")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="surname">Last name</Label>
            <Input id="surname" required placeholder="Smith" value={form.surname} onChange={set("surname")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" required min={14} max={100} placeholder="20" value={form.age} onChange={set("age")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="degree">Degree</Label>
            <Select value={form.primaryDegree} onValueChange={(v: string | null) => { if (v) setForm(f => ({ ...f, primaryDegree: v })); }}>
              <SelectTrigger id="degree"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="School">School</SelectItem>
                <SelectItem value="Bachelors">Bachelor&apos;s</SelectItem>
                <SelectItem value="Masters">Master&apos;s</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="edu">University / School</Label>
          <Input id="edu" required placeholder="MIT" value={form.educationPlace} onChange={set("educationPlace")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="you@example.com" value={form.email} onChange={set("email")} />
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
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
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
        Are you an investor?{" "}
        <Link href="/register/investor" className="text-[#10B981] hover:underline font-medium">Register here</Link>
      </p>
    </>
  );
}
