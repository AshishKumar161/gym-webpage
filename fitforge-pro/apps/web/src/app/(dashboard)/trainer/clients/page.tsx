"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Search, User, Phone, Mail, FileText, Dumbbell, Award } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ClientMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  fitnessGoal?: string;
  fitnessLevel?: string;
  heightCm?: number;
  weightKg?: number;
}

interface Booking {
  id: string;
  scheduledAt: string;
  member: ClientMember;
}

export default function TrainerClientsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  // Fetch bookings list to extract clients
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["trainer-bookings-clients", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/trainers`, {
        params: { type: "bookings" },
      });
      return res.data;
    },
    enabled: !!user?.id && user.role === "TRAINER",
  });

  // Extract unique client members from bookings
  const clientMap = new Map<string, ClientMember>();
  bookings.forEach((b) => {
    if (b.member && !clientMap.has(b.member.id)) {
      clientMap.set(b.member.id, b.member);
    }
  });

  const clients = Array.from(clientMap.values()).filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">My Coaching Roster</h1>
        <p className="text-sm text-white/50">Track assigned members, review target goals, and look up contact details.</p>
      </div>

      {/* Filter and search */}
      <div className="flex gap-4 items-center bg-white/2 border border-white/5 p-4 rounded-xl">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search roster by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 h-48 animate-pulse bg-white/5 border-white/5" />
          ))}
        </div>
      ) : clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="glass-card p-6 border-white/5 hover:border-brand-gold/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center font-bold text-xs text-dark">
                    {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">
                      {client.firstName} {client.lastName}
                    </h3>
                    <span className="text-[10px] text-white/30">ID: {client.id}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6 border-t border-white/5 pt-4 text-xxs text-white/60">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{client.phone ?? "No mobile phone"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Goal: {client.fitnessGoal?.replace("_", " ") ?? "General Fitness"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Level: {client.fitnessLevel ?? "Beginner"}</span>
                  </div>
                </div>
              </div>

              {/* Client specs overview */}
              <div className="bg-white/2 rounded-lg p-3 border border-white/5 grid grid-cols-2 gap-2 text-center text-[10px]">
                <div>
                  <span className="text-white/40 block">Height</span>
                  <span className="text-white font-semibold mt-0.5 block">{client.heightCm ? `${client.heightCm} cm` : "—"}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Weight</span>
                  <span className="text-white font-semibold mt-0.5 block">{client.weightKg ? `${client.weightKg} kg` : "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <User className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h4 className="font-bold text-white text-base">No clients on your roster</h4>
          <p className="text-xs text-white/40 mt-1">Clients who book training sessions with you will show up in this directory.</p>
        </div>
      )}
    </div>
  );
}
