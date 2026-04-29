import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Get initials from name + surname */
export function getInitials(name: string, surname?: string): string {
  const parts = [name, surname].filter(Boolean);
  return parts.map(p => p![0].toUpperCase()).join("").slice(0, 2);
}

/** Format a date nicely */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format date relative (e.g. "2 hours ago") */
export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

/** Get profile image URL or null.
 *  Handles both legacy local paths (filename only) and
 *  new Vercel Blob full URLs (https://...). */
export function getProfileImageUrl(
  role: "student" | "investor",
  id: number,
  filename: string | null | undefined
): string | null {
  if (!filename) return null;
  // New format: full Vercel Blob URL
  if (filename.startsWith("http")) return filename;
  // Legacy format: just filename stored locally
  return `/uploads/${role}/${id}/${filename}`;
}

/** Strip HTML tags for safe text preview */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Build API error response */
export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/** Build API success response */
export function apiOk<T>(data: T, status = 200) {
  return Response.json(data, { status });
}

