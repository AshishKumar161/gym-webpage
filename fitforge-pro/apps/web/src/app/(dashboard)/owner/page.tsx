"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DollarSign, Percent, TrendingUp, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

import Link from "next/link";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface AdminStats {
  stats: {
    totalMembers: number;
    activeMembers: number;
    totalRevenue: number;
  };
  recentPayments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  revenueTrend: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function OwnerDashboardOverview() {
  const { user } = useAuth();

  // Fetch Owner Stats (uses the same dashboard endpoint)
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ["owner-stats", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/dashboard`);
      return res.data;
    },
    enabled: !!user?.id && user.role === "OWNER",
  });

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">
          Owner <span className="gold-text">Overview</span>
        </h1>
        <p className="text-sm text-white/50">
          Executive view of corporate revenue margins, lifetime value metrics, and capital growth streams.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 h-28 animate-pulse bg-white/5 border-white/5" />
          ))}
        </div>
      ) : (
        <>
          {/* Executive KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Gross Sales */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Gross Sales</p>
                <h3 className="text-2xl font-black text-white mt-1.5 font-heading">
                  {formatCurrency(data?.stats.totalRevenue ?? 0, "INR")}
                </h3>
                <p className="text-[10px] text-green-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +15.4% YoY
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 2: Operating Margin */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Operating Margin</p>
                <h3 className="text-2xl font-black text-white mt-1.5 font-heading">72.4%</h3>
                <p className="text-[10px] text-green-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> Healthy Margin
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                <Percent className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 3: Avg Member LTV */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Avg Customer LTV</p>
                <h3 className="text-2xl font-black text-white mt-1.5 font-heading">
                  {formatCurrency(8400, "INR")}
                </h3>
                <p className="text-[10px] text-brand-gold mt-1">LTV Index</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 4: Active Roster */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Active Roster</p>
                <h3 className="text-2xl font-black text-white mt-1.5 font-heading">
                  {data?.stats.activeMembers ?? 0}
                </h3>
                <p className="text-[10px] text-white/40 mt-1">Paid members count</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card p-6">
              <h3 className="font-heading font-bold text-lg text-white mb-6">Gross Sales Performance (6 Months)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.revenueTrend ?? []}>
                    <defs>
                      <linearGradient id="colorRevOwner" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#0d0f14",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#fbbf24" fillOpacity={1} fill="url(#colorRevOwner)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* High-value transaction feed */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-4">Capital Transactions</h3>
                {data?.recentPayments && data.recentPayments.length > 0 ? (
                  <div className="divide-y divide-white/5 space-y-4 max-h-56 overflow-y-auto pr-1">
                    {data.recentPayments.map((payment, i) => (
                      <div key={payment.id} className={`flex items-center justify-between pt-4 ${i === 0 && "pt-0"}`}>
                        <div>
                          <h4 className="font-bold text-xs text-white">
                            {payment.user.firstName} {payment.user.lastName}
                          </h4>
                          <span className="text-[10px] text-white/40 block mt-0.5">{formatDate(payment.createdAt)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-white">
                            {formatCurrency(payment.amount / 100, "INR")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 text-center py-10">No recent payments logged.</p>
                )}
              </div>
              <Link
                href="/dashboard/owner/financials"
                className="mt-6 w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
              >
                Go to Financials <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
