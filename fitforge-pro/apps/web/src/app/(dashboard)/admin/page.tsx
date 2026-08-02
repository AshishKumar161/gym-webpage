"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Users,
  CreditCard,
  DollarSign,
  Calendar,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface AdminStats {
  stats: {
    totalMembers: number;
    activeMembers: number;
    totalTrainers: number;
    totalRevenue: number;
    attendanceToday: number;
    openTickets: number;
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
  recentMembers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  }>;
  popularPlans: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  revenueTrend: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function AdminDashboardOverview() {
  const { user } = useAuth();

  // Fetch Admin Stats
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/dashboard`);
      return res.data;
    },
    enabled: !!user?.id && (user.role === "ADMIN" || user.role === "OWNER"),
  });

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">
          Admin Control <span className="gold-text">Center</span>
        </h1>
        <p className="text-sm text-white/50">
          Real-time metrics, revenue analytics, check-in statuses, and system controls.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 4, 5].map((i) => (
            <div key={i} className="glass-card p-6 h-28 animate-pulse bg-white/5 border-white/5" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1: Total Members */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Total Members</p>
                <h3 className="text-2xl font-black text-white mt-1.5">{data?.stats.totalMembers ?? 0}</h3>
                <p className="text-[10px] text-green-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +12% this month
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Stat 2: Active Memberships */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Active Subscriptions</p>
                <h3 className="text-2xl font-black text-white mt-1.5">{data?.stats.activeMembers ?? 0}</h3>
                <p className="text-[10px] text-green-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +8% active
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            {/* Stat 3: Total Revenue */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Total Revenue</p>
                <h3 className="text-2xl font-black text-white mt-1.5">
                  {formatCurrency(data?.stats.totalRevenue ?? 0, "INR")}
                </h3>
                <p className="text-[10px] text-green-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +15% revenue
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Stat 4: Check-ins Today */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Check-ins Today</p>
                <h3 className="text-2xl font-black text-white mt-1.5">{data?.stats.attendanceToday ?? 0}</h3>
                <p className="text-[10px] text-white/40 mt-1">Daily visitors count</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Main Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Line Chart (Revenue Trend) */}
            <div className="lg:col-span-2 glass-card p-6">
              <h3 className="font-heading font-bold text-lg text-white mb-6">Revenue Growth (6 Months)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.revenueTrend ?? []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="revenue" stroke="#fbbf24" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart (Popular Plans) */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <h3 className="font-heading font-bold text-lg text-white mb-4">Plan Distribution</h3>
              <div className="h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.popularPlans.filter((p) => p.value > 0) ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(data?.popularPlans ?? []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#0d0f14",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xxs text-white/50 border-t border-white/5 pt-4">
                {(data?.popularPlans ?? []).map((p) => (
                  <div key={p.name} className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: p.color }} />
                    <span className="truncate max-w-[80px]">{p.name}</span>
                    <span className="text-white font-bold mt-0.5">{p.value} active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid: Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Members */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-bold text-lg text-white">Recent Registrations</h3>
                <Link
                  href="/dashboard/admin/users"
                  className="text-xs text-brand-gold hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data?.recentMembers && data.recentMembers.length > 0 ? (
                <div className="divide-y divide-white/5 space-y-4">
                  {data.recentMembers.map((member, i) => (
                    <div key={member.id} className={`flex items-center justify-between pt-4 ${i === 0 && "pt-0"}`}>
                      <div>
                        <h4 className="font-semibold text-xs text-white">
                          {member.firstName} {member.lastName}
                        </h4>
                        <p className="text-xxs text-white/40 mt-0.5">{member.email}</p>
                      </div>
                      <span className="text-xxs text-white/40">{formatDate(member.createdAt)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/40 text-center py-6">No recent registrations.</p>
              )}
            </div>

            {/* Recent Payments */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-bold text-lg text-white">Recent Payments</h3>
                <Link
                  href="/dashboard/admin/memberships"
                  className="text-xs text-brand-gold hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data?.recentPayments && data.recentPayments.length > 0 ? (
                <div className="divide-y divide-white/5 space-y-4">
                  {data.recentPayments.map((payment, i) => (
                    <div key={payment.id} className={`flex items-center justify-between pt-4 ${i === 0 && "pt-0"}`}>
                      <div>
                        <h4 className="font-semibold text-xs text-white">
                          {payment.user.firstName} {payment.user.lastName}
                        </h4>
                        <p className="text-xxs text-white/40 mt-0.5">{formatDate(payment.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-white">
                          {formatCurrency(payment.amount / 100, "INR")}
                        </span>
                        <span className="block text-[8px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.2 rounded mt-1">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/40 text-center py-6">No recent payments logged.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
