"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentCard } from "@/components/dashboard/user-card";

interface Student {
  id: number; name: string; surname: string;
  educationPlace: string; major: string | null;
  primaryDegree: string; location: string | null;
  gpa: number | null; profileImage: string | null;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const DEGREES = ["All", "School", "Bachelors", "Masters", "PhD"];

export default function DiscoverPage() {
  const [students,   setStudents]   = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [university, setUniversity] = useState("");
  const [degree,     setDegree]     = useState("All");
  const [page,       setPage]       = useState(1);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search)                params.set("search",     search);
    if (university)            params.set("university", university);
    if (degree !== "All")      params.set("degree",     degree);

    try {
      const res  = await fetch(`/api/users?${params}`);
      const data = await res.json() as { students: Student[]; pagination: Pagination };
      setStudents(data.students ?? []);
      setPagination(data.pagination ?? null);
    } finally {
      setLoading(false);
    }
  }, [search, university, degree, page]);

  useEffect(() => { void fetchStudents(); }, [fetchStudents]);

  // Reset page on filter change
  const applyFilter = (fn: () => void) => { fn(); setPage(1); };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E1B4B]">Discover Students</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          {pagination ? `${pagination.total} students found` : "Searching…"}
        </p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <Input
            className="pl-9"
            placeholder="Search by name…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => applyFilter(() => setSearch(e.target.value))}
          />
        </div>

        <Input
          className="sm:w-48"
          placeholder="University…"
          value={university}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => applyFilter(() => setUniversity(e.target.value))}
        />

        <Select value={degree} onValueChange={(v: string | null) => { if (v) applyFilter(() => setDegree(v)); }}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Degree" />
          </SelectTrigger>
          <SelectContent>
            {DEGREES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-[#9CA3AF]">
          <svg className="mx-auto h-12 w-12 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
          <p className="font-medium">No students found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {students.map(s => <StudentCard key={s.id} student={s} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="cursor-pointer"
          >
            ← Prev
          </Button>
          <span className="text-sm text-[#6B7280] px-4">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
            className="cursor-pointer"
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
