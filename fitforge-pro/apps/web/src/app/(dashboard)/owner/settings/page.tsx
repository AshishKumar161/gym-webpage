"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { User, Settings, Lock, Info } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function OwnerSettingsPage() {
  const { user, refetch } = useAuth();
  const queryClient = useQueryClient();

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Mutation for profile update
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.put(`${API_URL}/api/v1/users/profile`, data);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast.success("Owner profile details saved.");
    },
    onError: () => {
      toast.error("Failed to save profile.");
    },
  });

  // Mutation for password update
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.post(`${API_URL}/api/v1/auth/change-password`, data);
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to change password.");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      firstName,
      lastName,
      phone,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("All password fields are required.");
      return;
    }
    updatePasswordMutation.mutate({
      oldPassword,
      newPassword,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">Corporate Account Settings</h1>
        <p className="text-sm text-white/50">Configure owner profile parameters, verify credentials, and manage passwords.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Form (Left/Center Columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile form */}
          <div className="glass-card p-6 border-white/5">
            <h3 className="font-heading font-bold text-lg text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-gold" />
              Corporate Identity
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xxs font-bold text-white/50 uppercase block mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Email (Read Only)</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full bg-white/2 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white/40 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9999999999"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn-primary px-6 py-2.5 font-bold text-xs uppercase tracking-wider"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Password update (Right Column) */}
        <div className="space-y-8">
          {/* Change password */}
          <div className="glass-card p-6 border-white/5">
            <h3 className="font-heading font-bold text-lg text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-gold" />
              Security Update
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-xxs font-bold text-white/50 uppercase block mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs uppercase tracking-wider text-white transition-all"
              >
                {updatePasswordMutation.isPending ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
