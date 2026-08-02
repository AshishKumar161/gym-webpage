"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Calendar, User, Clock, MapPin, Users, Check, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface GroupClass {
  id: string;
  name: string;
  description?: string;
  scheduledAt: string;
  durationMins: number;
  capacity: number;
  availableSlots: number;
  difficulty?: string;
  category?: string;
  location?: string;
  isBooked: boolean;
}

export default function ClassesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch group classes
  const { data: classes = [], isLoading } = useQuery<GroupClass[]>({
    queryKey: ["group-classes", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/classes`);
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Booking toggle mutation
  const bookingMutation = useMutation({
    mutationFn: async (classId: string) => {
      await axios.post(`${API_URL}/api/v1/classes`, { classId });
    },
    onSuccess: (_, classId) => {
      queryClient.invalidateQueries({ queryKey: ["group-classes", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      const cls = classes.find(c => c.id === classId);
      if (cls?.isBooked) {
        toast.success("Class booking cancelled.");
      } else {
        toast.success("Successfully booked class! See you there.");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Booking failed.");
    },
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">Group Studio Classes</h1>
        <p className="text-sm text-white/50">Book your spot in our premium group classes. High-energy training led by certified coaches.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 border-white/5 space-y-4 animate-pulse">
              <div className="h-6 w-2/3 bg-white/10 rounded" />
              <div className="h-4 w-1/2 bg-white/5 rounded" />
              <div className="h-10 bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className={`glass-card p-6 border-white/5 flex flex-col justify-between transition-all duration-300 relative ${
                cls.isBooked ? "border-brand-gold bg-brand-gold/5 scale-[1.01]" : ""
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider bg-brand-gold/10 px-2 py-0.5 rounded">
                      {cls.category ?? "Studio"}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-white mt-2">{cls.name}</h3>
                  </div>
                  {cls.difficulty && (
                    <span className="text-[9px] font-bold text-white/40 border border-white/10 px-1.5 py-0.5 rounded uppercase">
                      {cls.difficulty}
                    </span>
                  )}
                </div>

                <p className="text-xs text-white/50 mb-6 leading-relaxed">{cls.description ?? "Join us for an amazing studio training session."}</p>

                <div className="space-y-3 mb-6 p-4 bg-white/2 rounded-xl border border-white/5 text-xs text-white/60">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-brand-gold" />
                    <span>{formatDate(cls.scheduledAt)} at {new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-brand-gold" />
                    <span>{cls.durationMins} minutes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                    <span>{cls.location ?? "Main Studio Room"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-brand-gold" />
                    <span>{cls.availableSlots} / {cls.capacity} spots remaining</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => bookingMutation.mutate(cls.id)}
                disabled={bookingMutation.isPending || (cls.availableSlots === 0 && !cls.isBooked)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  cls.isBooked
                    ? "bg-brand-gold text-dark font-black shadow-gold"
                    : cls.availableSlots === 0
                      ? "bg-white/5 text-white/25 cursor-not-allowed border border-white/5"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {cls.isBooked ? (
                  <>
                    <Check className="w-4 h-4" /> Booked
                  </>
                ) : cls.availableSlots === 0 ? (
                  <>
                    <AlertCircle className="w-4 h-4" /> Class Full
                  </>
                ) : (
                  "Book Class"
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h4 className="font-bold text-white text-base">No upcoming classes scheduled</h4>
          <p className="text-xs text-white/40 mt-1">Please check back later or contact the front desk.</p>
        </div>
      )}
    </div>
  );
}
