"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Investor {
  id: number; name: string; surname: string; email: string;
  companyName: string; jobFunc: string; createdAt: string;
  _count: { posts: number };
}
interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export default function AdminInvestorsPage() {
  const [investors,  setInvestors]  = useState<Investor[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [deleting,   setDeleting]   = useState<number | null>(null);

  const fetchInvestors = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    const res  = await fetch(`/api/admin/investors?${params}`);
    const data = await res.json() as { investors: Investor[]; pagination: Pagination };
    setInvestors(data.investors ?? []);
    setPagination(data.pagination ?? null);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { void fetchInvestors(); }, [fetchInvestors]);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete investor "${name}"? This action cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/investors/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`Investor "${name}" deleted`);
      void fetchInvestors();
    } else {
      toast.error("Failed to delete investor");
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E1B4B]">Investors</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          {pagination ? `${pagination.total} total investors` : "Loading…"}
        </p>
      </div>

      {/* Search */}
      <div className="glass rounded-2xl p-4 border border-[rgba(99,102,241,0.1)]">
        <Input
          placeholder="Search by name, email, or company…"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-[rgba(99,102,241,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(99,102,241,0.08)] bg-[rgba(99,102,241,0.03)]">
                <th className="text-left px-5 py-3 font-semibold text-[#6B7280]">ID</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6B7280]">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6B7280]">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6B7280]">Company</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6B7280]">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6B7280]">Posts</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6B7280]">Joined</th>
                <th className="text-right px-5 py-3 font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(99,102,241,0.06)]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 bg-[#F3F4F6] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : investors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#9CA3AF]">No investors found</td>
                </tr>
              ) : investors.map(inv => (
                <tr key={inv.id} className="hover:bg-[rgba(99,102,241,0.02)] transition-colors">
                  <td className="px-5 py-3 text-[#9CA3AF] font-mono text-xs">{inv.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
                      >
                        {inv.name[0]}{inv.surname[0]}
                      </div>
                      <span className="font-medium text-[#1E1B4B]">{inv.name} {inv.surname}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#6B7280]">{inv.email}</td>
                  <td className="px-5 py-3 text-[#6B7280] max-w-[160px] truncate">{inv.companyName}</td>
                  <td className="px-5 py-3 text-[#6B7280] max-w-[140px] truncate">{inv.jobFunc}</td>
                  <td className="px-5 py-3 text-[#6B7280]">{inv._count.posts}</td>
                  <td className="px-5 py-3 text-[#9CA3AF]">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deleting === inv.id}
                      onClick={() => handleDelete(inv.id, `${inv.name} ${inv.surname}`)}
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer text-xs"
                    >
                      {deleting === inv.id ? "Deleting…" : "Delete"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[rgba(99,102,241,0.08)]">
            <p className="text-sm text-[#9CA3AF]">Page {page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="cursor-pointer">← Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="cursor-pointer">Next →</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
