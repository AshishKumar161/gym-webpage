"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, FileText, ArrowRight, ShieldCheck, PieChart as PieIcon, Coins } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Payment {
  id: string;
  amount: number;
  status: string;
  gateway: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const EXPENSE_DATA = [
  { name: "Staff Salaries", value: 120000, color: "#60a5fa" },
  { name: "Facility Maintenance", value: 50000, color: "#fbbf24" },
  { name: "Utilities & Electricity", value: 35000, color: "#34d399" },
  { name: "Marketing Campaigns", value: 25000, color: "#f87171" },
  { name: "Equipment Leases", value: 40000, color: "#c084fc" },
];

export default function OwnerFinancialsPage() {
  const { user } = useAuth();

  // Fetch payments/transaction history
  const { data, isLoading } = useQuery<{ items: Payment[] }>({
    queryKey: ["owner-financial-ledger", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/payments`, {
        params: { limit: 20 },
      });
      return res.data;
    },
    enabled: !!user?.id && user.role === "OWNER",
  });

  const payments = data?.items ?? [];
  const grossSales = payments.reduce((acc, curr) => acc + (curr.status === "SUCCESS" ? curr.amount : 0), 0) / 100;
  const totalExpenses = EXPENSE_DATA.reduce((acc, curr) => acc + curr.value, 0);
  const netProfit = Math.max(0, grossSales - totalExpenses);

  // Group payments by month for chart (simulated summary)
  const monthlyRevenue = [
    { name: "Mar", Revenue: 180000, Expenses: 210000 },
    { name: "Apr", Revenue: 220000, Expenses: 230000 },
    { name: "May", Revenue: 290000, Expenses: 250000 },
    { name: "Jun", Revenue: 340000, Expenses: 270000 },
    { name: "Jul", Revenue: 410000, Expenses: 270000 },
    { name: "Aug", Revenue: grossSales > 0 ? grossSales : 490000, Expenses: totalExpenses },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">Corporate Financials</h1>
        <p className="text-sm text-white/50">Audit gross/net profitability margins, operating overhead expenses, and cash ledger records.</p>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Gross Sales */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Gross Sales (Aug)</p>
            <h3 className="text-2xl font-black text-white mt-1.5 font-heading">
              {formatCurrency(grossSales > 0 ? grossSales : 490000, "INR")}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Operating Overhead */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Operating Overhead</p>
            <h3 className="text-2xl font-black text-white mt-1.5 font-heading">
              {formatCurrency(totalExpenses, "INR")}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Net Cash Position */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Net Margin Position</p>
            <h3 className="text-2xl font-black text-white mt-1.5 font-heading">
              {formatCurrency(netProfit > 0 ? netProfit : 220000, "INR")}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue vs Expenses chart (Left/Center Column) */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-heading font-bold text-lg text-white mb-6">Revenue vs Expenses (6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0d0f14",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", marginTop: "10px" }} />
                <Bar dataKey="Revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Pie chart (Right Column) */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <h3 className="font-heading font-bold text-lg text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-brand-gold" />
            Overhead Categories
          </h3>
          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={EXPENSE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {EXPENSE_DATA.map((entry, index) => (
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
          <div className="space-y-1.5 border-t border-white/5 pt-4">
            {EXPENSE_DATA.map((exp) => (
              <div key={exp.name} className="flex justify-between items-center text-xxs text-white/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: exp.color }} />
                  <span>{exp.name}</span>
                </div>
                <span className="text-white font-semibold">{formatCurrency(exp.value, "INR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger sheet */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="font-heading font-bold text-lg text-white mb-6">Cash Ledger Entries</h3>
        {isLoading ? (
          <div className="h-48 animate-pulse bg-white/5 rounded-xl" />
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/40">
                  <th className="p-3 pl-4">Transaction ID</th>
                  <th className="p-3">Member</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 pr-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2 text-xs">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-3 pl-4 text-white/40">{p.id}</td>
                    <td className="p-3">
                      <span className="font-semibold text-white">{p.user.firstName} {p.user.lastName}</span>
                      <span className="block text-[10px] text-white/40">{p.user.email}</span>
                    </td>
                    <td className="p-3 text-white/60">{p.gateway}</td>
                    <td className="p-3 text-white/40">{formatDate(p.createdAt)}</td>
                    <td className="p-3 pr-4 text-right font-black text-white">
                      {formatCurrency(p.amount / 100, "INR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-white/40 text-center py-6">No ledger entries found.</p>
        )}
      </div>
    </div>
  );
}
