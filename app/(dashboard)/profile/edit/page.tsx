"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface StudentProfile {
  id: number; name: string; surname: string; middle?: string;
  location?: string; major?: string; bio?: string; achievements?: string;
  gpa?: number; sat?: number; ielts?: number; profileImage?: string;
}

export default function EditProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/users/${session.user.id}`)
      .then(r => r.json())
      .then(d => { if (d.student) setProfile(d.student as StudentProfile); })
      .catch(() => toast.error("Failed to load profile"));
  }, [session]);

  const set = (k: keyof StudentProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setProfile(p => p ? { ...p, [k]: e.target.value } : p);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !session?.user?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location:     profile.location,
          major:        profile.major,
          bio:          profile.bio,
          achievements: profile.achievements,
          gpa:          profile.gpa   ? Number(profile.gpa)   : undefined,
          sat:          profile.sat   ? Number(profile.sat)   : undefined,
          ielts:        profile.ielts ? Number(profile.ielts) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Update failed"); return; }
      toast.success("Profile updated!");
    } catch { toast.error("Something went wrong"); }
    finally  { setSaving(false); }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("profileImage", file);
      const res  = await fetch("/api/upload?role=student", { method: "POST", body: fd });
      const data = await res.json() as { imageUrl?: string; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Upload failed"); return; }
      toast.success("Profile photo updated!");
      if (data.imageUrl) setProfile(p => p ? { ...p, profileImage: data.imageUrl } : p);
    } catch { toast.error("Upload failed"); }
    finally  { setUploading(false); }
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#E5E7EB] rounded w-1/3" />
          <div className="h-64 bg-[#E5E7EB] rounded-2xl" />
        </div>
      </div>
    );
  }

  const initials = getInitials(profile.name, profile.surname);
  const imageUrl = profile.profileImage?.startsWith("/")
    ? profile.profileImage
    : profile.profileImage
      ? `/uploads/student/${session?.user?.id}/${profile.profileImage}`
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E1B4B]">Edit Profile</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Update your public profile information</p>
      </div>

      {/* Avatar upload */}
      <div className="glass rounded-2xl p-6 mb-6 flex items-center gap-5">
        <Avatar className="h-20 w-20 cursor-pointer ring-4 ring-[rgba(99,102,241,0.15)]" onClick={() => fileRef.current?.click()}>
          <AvatarImage src={imageUrl ?? undefined} />
          <AvatarFallback className="text-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer"
          >
            {uploading ? "Uploading…" : "Change photo"}
          </Button>
          <p className="text-xs text-[#9CA3AF] mt-1">PNG, JPG, WEBP · Max 3 MB</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <form onSubmit={handleSave} className="glass rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Tashkent, Uzbekistan" value={profile.location ?? ""} onChange={set("location")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="major">Major</Label>
            <Input id="major" placeholder="Computer Science" value={profile.major ?? ""} onChange={set("major")} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="gpa">GPA (0–4.0)</Label>
            <Input id="gpa" type="number" step="0.01" min="0" max="4" placeholder="3.85" value={profile.gpa ?? ""} onChange={set("gpa")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sat">SAT (400–1600)</Label>
            <Input id="sat" type="number" min="400" max="1600" placeholder="1450" value={profile.sat ?? ""} onChange={set("sat")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ielts">IELTS (0–9)</Label>
            <Input id="ielts" type="number" step="0.5" min="0" max="9" placeholder="7.5" value={profile.ielts ?? ""} onChange={set("ielts")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            placeholder="Tell investors and mentors about yourself…"
            value={profile.bio ?? ""}
            onChange={set("bio")}
            className="resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="achievements">Achievements</Label>
          <Textarea
            id="achievements"
            rows={4}
            placeholder="Awards, publications, competitions, projects…"
            value={profile.achievements ?? ""}
            onChange={set("achievements")}
            className="resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full cursor-pointer"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
