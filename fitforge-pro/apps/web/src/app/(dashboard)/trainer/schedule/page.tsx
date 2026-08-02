"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Clock, Check, X, FileText, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ClientMember {
  firstName: string;
  lastName: string;
  email: string;
}

interface Booking {
  id: string;
  scheduledAt: string;
  durationMins: number;
  status: string;
  notes?: string;
  sessionNotes?: string;
  member: ClientMember;
}

export default function TrainerSchedulePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");

  // Fetch trainer bookings list
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["trainer-schedule", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/trainers`, {
        params: { type: "bookings" },
      });
      return res.data;
    },
    enabled: !!user?.id && user.role === "TRAINER",
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status, sessionNotes }: { id: string; status?: string; sessionNotes?: string }) => {
      await axios.put(`${API_URL}/api/v1/trainers/${id}`, { status, sessionNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-schedule", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["trainer-stats", user?.id] });
      toast.success("Appointment status updated successfully.");
      setSelectedBookingId(null);
      setSessionNotes("");
    },
    onError: () => {
      toast.error("Failed to update appointment.");
    },
  });

  const handleComplete = (id: string) => {
    updateBookingMutation.mutate({ id, status: "COMPLETED" });
  };

  const handleCancel = (id: string) => {
    updateBookingMutation.mutate({ id, status: "CANCELLED" });
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;
    updateBookingMutation.mutate({ id: selectedBookingId, sessionNotes });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">My Appointment Schedule</h1>
        <p className="text-sm text-white/50">Manage scheduled personal sessions, add log files, or update completion statuses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule List (Left/Center Column) */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="glass-card p-6 h-64 animate-pulse bg-white/5 border-white/5" />
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isUpcoming = new Date(booking.scheduledAt).getTime() > Date.now();
                return (
                  <div
                    key={booking.id}
                    className={`glass-card p-6 border-white/5 space-y-4 hover:border-brand-gold/20 transition-all ${
                      booking.status === "COMPLETED" ? "bg-green-500/2 border-green-500/10" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-base">
                          {booking.member.firstName} {booking.member.lastName}
                        </h4>
                        <p className="text-xxs text-white/40 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(booking.scheduledAt)} at {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({booking.durationMins} mins)
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            booking.status === "COMPLETED"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : booking.status === "CANCELLED"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {booking.status}
                        </span>

                        {booking.status === "CONFIRMED" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleComplete(booking.id)}
                              className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                              title="Mark Completed"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Cancel Session"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-xxs text-white/50 bg-white/2 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                        <span className="font-semibold text-white/70 block mb-0.5">Booking Notes</span>
                        {booking.notes}
                      </p>
                    )}

                    {booking.sessionNotes && (
                      <div className="text-xxs text-white/50 bg-white/2 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                        <span className="font-semibold text-white/70 block mb-0.5">Coach Session Notes</span>
                        {booking.sessionNotes}
                      </div>
                    )}

                    {booking.status === "COMPLETED" && !booking.sessionNotes && (
                      <button
                        onClick={() => {
                          setSelectedBookingId(booking.id);
                          setSessionNotes("");
                        }}
                        className="text-xxs text-brand-gold hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Add Training Session Notes
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-10 text-center">
              <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base">No appointments booked</h4>
              <p className="text-xs text-white/40 mt-1">Check back later for client bookings.</p>
            </div>
          )}
        </div>

        {/* Action Panel / Notes Form (Right Column) */}
        <div>
          {selectedBookingId ? (
            <div className="glass-card p-6 border-brand-gold/30 bg-brand-gold/5 space-y-4">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-brand-gold" />
                Add Session Notes
              </h3>

              <form onSubmit={handleSaveNotes} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase block mb-1">Session Summary</label>
                  <textarea
                    placeholder="e.g. Completed chest hypertrophy routine, increased bench reps, client felt strong."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    rows={4}
                    className="w-full bg-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingId(null)}
                    className="btn-ghost text-xxs px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xxs px-4 py-1.5 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3 text-dark" /> Save
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="glass-card p-6 border-white/5 text-xxs text-white/40 leading-relaxed space-y-2">
              <h4 className="font-bold text-white/70">Session Logging Tip</h4>
              <p>
                Logging detailed session summaries for members helps them see their progressive overload rates and helps AI-engine formulate correct targets.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
