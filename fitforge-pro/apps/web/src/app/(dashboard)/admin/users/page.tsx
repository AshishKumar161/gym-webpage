"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Search, UserCheck, Shield, Award, Edit, Trash2, ToggleLeft, ToggleRight, ArrowLeft, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "MEMBER" | "TRAINER" | "ADMIN" | "OWNER";
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  memberships?: Array<{
    plan: {
      name: string;
      color: string;
    };
  }>;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Search & Pagination states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch users query
  const { data, isLoading } = useQuery<{
    items: UserItem[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ["admin-users", page, search, roleFilter],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/users`, {
        params: {
          page,
          limit,
          search: search || undefined,
          role: roleFilter || undefined,
        },
      });
      return res.data;
    },
    enabled: !!user?.id && (user.role === "ADMIN" || user.role === "OWNER"),
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await axios.patch(`${API_URL}/api/v1/users/${id}/activate`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User status updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update status.");
    },
  });

  // Change role mutation (Owner only)
  const changeRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await axios.patch(`${API_URL}/api/v1/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update role. (Only OWNER can change roles)");
    },
  });

  const handleRoleChange = (id: string, role: string) => {
    changeRoleMutation.mutate({ id, role });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">Member Administration</h1>
        <p className="text-sm text-white/50">List, audit, configure roles, and change system access status of all gym users.</p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/2 border border-white/5 p-4 rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="MEMBER">Member</option>
            <option value="TRAINER">Trainer</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="glass-card p-6 h-64 animate-pulse bg-white/5 border-white/5" />
      ) : (
        <div className="glass-card overflow-x-auto border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/40">
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Plan Status</th>
                <th className="p-4">Access Status</th>
                <th className="p-4 pr-6 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2 text-xs">
              {data?.items && data.items.length > 0 ? (
                data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center font-black text-xs text-dark">
                        {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white leading-tight">
                          {item.firstName} {item.lastName}
                        </h4>
                        <span className="text-[10px] text-white/30">{item.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white/80">{item.email}</p>
                      <p className="text-xxs text-white/40 mt-0.5">{item.phone ?? "No phone"}</p>
                    </td>
                    <td className="p-4">
                      {user?.role === "OWNER" ? (
                        <select
                          value={item.role}
                          onChange={(e) => handleRoleChange(item.id, e.target.value)}

                          className="bg-dark border border-white/10 rounded px-1.5 py-1 text-xxs text-white/80 focus:outline-none"
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="TRAINER">TRAINER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="OWNER">OWNER</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 uppercase tracking-widest text-white/60">
                          {item.role}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {(() => {
                        const activePlan = item.memberships?.[0]?.plan;
                        return activePlan ? (
                          <span
                            className="px-2 py-0.5 text-[10px] font-bold rounded"
                            style={{
                              backgroundColor: `${activePlan.color}15`,
                              color: activePlan.color,
                              border: `1px solid ${activePlan.color}25`,
                            }}
                          >
                            {activePlan.name}
                          </span>
                        ) : (
                          <span className="text-xxs text-white/20 uppercase tracking-wider font-bold">No Active Plan</span>
                        );
                      })()}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: item.id,
                            isActive: !item.isActive,
                          })
                        }
                        disabled={toggleActiveMutation.isPending}
                        className="transition-colors hover:bg-white/5 p-1 rounded"
                      >
                        {item.isActive ? (
                          <span className="flex items-center gap-1.5 text-green-400 font-bold uppercase text-[10px]">
                            <UserCheck className="w-4 h-4 text-green-500" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-400 font-bold uppercase text-[10px]">
                            <Trash2 className="w-4 h-4 text-red-500" /> Suspended
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right text-white/40">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">
                    No users found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {data?.totalPages && data.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white/2 border border-white/5 px-4 py-3 rounded-xl">
          <span className="text-xs text-white/40">
            Page {page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
              aria-label="Previous page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="p-2 rounded bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
              aria-label="Next page"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
