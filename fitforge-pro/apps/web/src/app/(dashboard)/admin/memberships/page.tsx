"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Calendar, RefreshCw, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface MembershipItem {
  id: string;
  userId: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  qrCode?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  plan: {
    name: string;
    color: string;
  };
}

export default function AdminMembershipsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch memberships query
  const { data, isLoading } = useQuery<{
    items: MembershipItem[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ["admin-memberships", page],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/memberships`, {
        params: { page, limit },
      });
      return res.data;
    },
    enabled: !!user?.id && (user.role === "ADMIN" || user.role === "OWNER"),
  });

  // Cancel membership mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/api/v1/memberships/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      toast.success("Membership subscription cancelled.");
    },
    onError: () => {
      toast.error("Failed to cancel subscription.");
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">Member Subscriptions</h1>
        <p className="text-sm text-white/50">Audit all member memberships, track renewal dates, and cancel subscriptions.</p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="glass-card p-6 h-64 animate-pulse bg-white/5 border-white/5" />
      ) : (
        <div className="glass-card overflow-x-auto border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/40">
                <th className="p-4 pl-6">Member</th>
                <th className="p-4">Active Plan</th>
                <th className="p-4">Duration Period</th>
                <th className="p-4">Auto-Renew</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2 text-xs">
              {data?.items && data.items.length > 0 ? (
                data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-4 pl-6">
                      <h4 className="font-bold text-white leading-tight">
                        {item.user.firstName} {item.user.lastName}
                      </h4>
                      <p className="text-xxs text-white/40 mt-0.5">{item.user.email}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold rounded"
                        style={{
                          backgroundColor: `${item.plan.color}15`,
                          color: item.plan.color,
                          border: `1px solid ${item.plan.color}25`,
                        }}
                      >
                        {item.plan.name}
                      </span>
                    </td>
                    <td className="p-4 text-white/80">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                        <span>{formatDate(item.startDate)} — {formatDate(item.endDate)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white/60">
                      {item.autoRenew ? "Enabled" : "Disabled"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          item.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : item.status === "EXPIRED"
                              ? "bg-white/5 text-white/30 border border-white/5"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {item.status === "ACTIVE" && (
                        <button
                          onClick={() => cancelMutation.mutate(item.id)}
                          disabled={cancelMutation.isPending}
                          className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 ml-auto text-xxs transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Cancel Plan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">
                    No subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
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
