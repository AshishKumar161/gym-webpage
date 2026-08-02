"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  Dumbbell,
  Award,
  QrCode,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  CheckCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface MemberStats {
  totalAttendance: number;
  thisMonthAttendance: number;
  totalWorkouts: number;
  activeMembership: {
    id: string;
    status: string;
    endDate: string;
    plan: {
      name: string;
      color: string;
    };
  } | null;
  rewardPoints: number;
  memberSince: string;
}

export default function MemberDashboardOverview() {
  const { user } = useAuth();
  const [qrOpen, setQrOpen] = useState(false);

  // Fetch Member Stats
  const { data: stats, isLoading } = useQuery<MemberStats>({
    queryKey: ["member-stats", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/users/${user?.id}/stats`);
      return res.data?.data;
    },
    enabled: !!user?.id,
  });

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* ─── Welcome Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-white mb-2">
            Welcome back, <span className="gold-text">{user.firstName}</span>!
          </h1>
          <p className="text-sm text-white/50">
            Let&apos;s conquer today&apos;s fitness goals. Your dashboard is up to date.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQrOpen(true)}
            className="btn-primary group flex items-center gap-2.5"
          >
            <QrCode className="w-5 h-5 text-dark" />
            Digital Card (QR)
          </button>
          <Link
            href="/dashboard/member/workouts"
            className="btn-ghost flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            Log Workout
          </Link>
        </div>
      </div>

      {/* ─── Main Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Plan */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Current Plan</p>
              <h3 className="font-heading font-bold text-lg text-white mt-1">
                {stats?.activeMembership?.plan.name ?? "No Active Plan"}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          {stats?.activeMembership ? (
            <div className="text-xxs text-white/40 flex items-center gap-1.5 mt-4 pt-4 border-t border-white/5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Valid until {new Date(stats.activeMembership.endDate).toLocaleDateString()}
            </div>
          ) : (
            <Link
              href="#membership"
              className="text-xs font-semibold text-brand-gold hover:underline flex items-center gap-1 mt-4"
            >
              Get Membership <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Metric 2: Attendance */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Attendance</p>
              <h3 className="font-heading font-black text-2xl text-white mt-1">
                {stats?.totalAttendance ?? 0} <span className="text-sm font-medium text-white/40">visits</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xxs text-white/40 flex items-center gap-1.5 mt-4 pt-4 border-t border-white/5">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            {stats?.thisMonthAttendance ?? 0} visits this month
          </div>
        </div>

        {/* Metric 3: Workouts */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Workouts</p>
              <h3 className="font-heading font-black text-2xl text-white mt-1">
                {stats?.totalWorkouts ?? 0} <span className="text-sm font-medium text-white/40">sessions</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xxs text-white/40 flex items-center gap-1.5 mt-4 pt-4 border-t border-white/5">
            <Zap className="w-3.5 h-3.5 text-brand-gold" />
            Streak: 4 days active
          </div>
        </div>

        {/* Metric 4: Reward Points */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Reward Points</p>
              <h3 className="font-heading font-black text-2xl text-white mt-1">
                {(stats?.rewardPoints ?? 0).toLocaleString()} <span className="text-sm font-medium text-white/40">pts</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xxs text-white/40 flex items-center gap-1.5 mt-4 pt-4 border-t border-white/5">
            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            500 points pending next milestone
          </div>
        </div>
      </div>

      {/* ─── Secondary Layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-heading font-bold text-xl text-white">Recent Workouts</h2>
          <div className="glass-card p-6 divide-y divide-white/5 space-y-4">
            {[
              { name: "Full Body Push Day", date: "Today, 7:12 AM", duration: "55 mins", cals: "450 kcal" },
              { name: "Leg Hypertrophy Workout", date: "Yesterday, 6:30 AM", duration: "70 mins", cals: "580 kcal" },
              { name: "Cardio Intervals & Abs", date: "29 Jul, 5:45 PM", duration: "45 mins", cals: "350 kcal" },
            ].map((activity, i) => (
              <div key={i} className={cn("flex items-center justify-between pt-4", i === 0 && "pt-0")}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-white/5 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-white">{activity.name}</h4>
                    <p className="text-xxs text-white/40 mt-0.5">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-white">{activity.duration}</div>
                  <div className="text-xxs text-white/40 mt-0.5">{activity.cals}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column — Goal Tracking */}
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-xl text-white">Goal Progress</h2>
          <div className="glass-card p-6 space-y-6">
            <div>
              <div className="flex justify-between text-xs font-medium text-white/60 mb-2">
                <span>Monthly Attendance</span>
                <span className="text-brand-gold">14 / 20 days</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-gold rounded-full" style={{ width: "70%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-white/60 mb-2">
                <span>Weekly Calories Burned</span>
                <span className="text-brand-gold">2,450 / 3,000 kcal</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-gold rounded-full" style={{ width: "81.6%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-white/60 mb-2">
                <span>Water Target (Today)</span>
                <span className="text-brand-gold">1.8 / 3.0 L</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-gold rounded-full" style={{ width: "60%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── QR Code Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {qrOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQrOpen(false)}
              className="fixed inset-0 z-50 bg-dark/90 backdrop-blur-xl flex items-center justify-center p-4"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[51] w-full max-w-sm glass-card p-8 text-center"
            >
              <h3 className="font-heading font-bold text-xl text-white mb-2">Digital Member Card</h3>
              <p className="text-xs text-white/40 mb-6">
                Scan this QR code at the entrance kiosk for contactless check-in.
              </p>

              {/* QR Image Frame */}
              <div className="bg-white p-6 rounded-2xl inline-block shadow-gold mb-6">
                <QRCodeSVG
                  value={`fitforge:${user.id}`}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Member Details */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-6 text-left">
                <div className="flex justify-between text-xs text-white/40 mb-2">
                  <span>Name:</span>
                  <span className="font-semibold text-white">{user.firstName} {user.lastName}</span>
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span>Membership Status:</span>
                  <span className="font-semibold text-green-400">ACTIVE</span>
                </div>
              </div>

              <button onClick={() => setQrOpen(false)} className="btn-ghost w-full">
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
