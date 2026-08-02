"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Users, Calendar, Award, Sparkles, Activity, Clock, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Booking {
  id: string;
  memberId: string;
  scheduledAt: string;
  durationMins: number;
  status: string;
  notes?: string;
  member: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface TrainerStats {
  stats: {
    assignedMembers: number;
    upcomingBookings: number;
    completedSessions: number;
  };
  upcomingBookings: Booking[];
}

export default function TrainerDashboardOverview() {
  const { user } = useAuth();

  // Fetch Trainer Stats
  const { data, isLoading } = useQuery<TrainerStats>({
    queryKey: ["trainer-stats", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/dashboard`);
      return res.data;
    },
    enabled: !!user?.id && user.role === "TRAINER",
  });

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">
          Coach <span className="gold-text">{user.firstName}</span>
        </h1>
        <p className="text-sm text-white/50">
          Monitor your assigned client progress, manage active appointments, and structure schedules.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 h-28 animate-pulse bg-white/5 border-white/5" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stat 1: Assigned Clients */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">My Clients</p>
                <h3 className="text-2xl font-black text-white mt-1.5">{data?.stats.assignedMembers ?? 0}</h3>
                <p className="text-[10px] text-brand-gold mt-1">Actively coaching</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Stat 2: Upcoming Bookings */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Upcoming Bookings</p>
                <h3 className="text-2xl font-black text-white mt-1.5">{data?.stats.upcomingBookings ?? 0}</h3>
                <p className="text-[10px] text-blue-400 mt-1">Pending appointments</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Stat 3: Completed Sessions */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Completed Sessions</p>
                <h3 className="text-2xl font-black text-white mt-1.5">{data?.stats.completedSessions ?? 0}</h3>
                <p className="text-[10px] text-green-400 mt-1">All-time coaching count</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments list (Left/Center Columns) */}
            <div className="lg:col-span-2 glass-card p-6 space-y-6">
              <h3 className="font-heading font-bold text-lg text-white">Upcoming 1-on-1 Appointments</h3>

              {data?.upcomingBookings && data.upcomingBookings.length > 0 ? (
                <div className="divide-y divide-white/5 space-y-4">
                  {data.upcomingBookings.map((booking, i) => (
                    <div key={booking.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 ${i === 0 && "pt-0"}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center font-bold text-xs text-dark">
                          {booking.member.firstName.charAt(0)}{booking.member.lastName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">
                            {booking.member.firstName} {booking.member.lastName}
                          </h4>
                          <p className="text-xxs text-white/40 mt-0.5">{booking.member.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:text-right">
                        <div>
                          <span className="text-[10px] text-white/40 block">Scheduled Time</span>
                          <span className="text-xs text-white font-medium flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-brand-gold" />
                            {formatDate(booking.scheduledAt)} at {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wider">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <h4 className="text-white font-bold text-sm">No upcoming appointments</h4>
                  <p className="text-xs text-white/40 mt-1">When members book personal sessions with you, they will appear here.</p>
                </div>
              )}
            </div>

            {/* Quick tips & reminders (Right Column) */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-heading font-bold text-sm text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-brand-gold" />
                  Trainer Reminders
                </h3>
                <ul className="space-y-3 text-xxs text-white/60 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    Update client workout programs and macros daily to sync goals.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    Confirm or complete 1-on-1 bookings under the Schedule page to update rewards points.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    Set your custom certifications, social handles, and hourly rates in settings to gain visibility.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
