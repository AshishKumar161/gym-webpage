"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Settings, Lock, Upload, Award, Globe, Plus, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface TrainerProfile {
  bio?: string;
  specializations: string[];
  certifications: string[];
  experience: number;
  hourlyRate?: number;
  instagram?: string;
  youtube?: string;
}

interface TrainerUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  trainerProfile: TrainerProfile;
}

export default function TrainerSettingsPage() {
  const { user, refetch } = useAuth();
  const queryClient = useQueryClient();

  // Profile fields
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(500); // in Rupees
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");

  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpec, setNewSpec] = useState("");

  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState("");

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Fetch Trainer Details
  const { data } = useQuery<TrainerUser>({
    queryKey: ["trainer-profile-details", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/trainers/${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id && user.role === "TRAINER",
  });

  // Sync inputs with fetched data
  useEffect(() => {
    if (data?.trainerProfile) {
      setBio(data.trainerProfile.bio ?? "");
      setExperience(data.trainerProfile.experience ?? 0);
      setHourlyRate((data.trainerProfile.hourlyRate ?? 50000) / 100); // Convert paise to rupees
      setSpecializations(data.trainerProfile.specializations ?? []);
      setCertifications(data.trainerProfile.certifications ?? []);
      setInstagram(data.trainerProfile.instagram ?? "");
      setYoutube(data.trainerProfile.youtube ?? "");
    }
  }, [data]);

  // Update profile details mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.put(`${API_URL}/api/v1/trainers/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-profile-details", user?.id] });
      toast.success("Trainer profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile.");
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.post(`${API_URL}/api/v1/auth/change-password`, data);
    },
    onSuccess: () => {
      toast.success("Password updated successfully!");
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
      bio,
      experience: Number(experience),
      hourlyRate: Math.round(Number(hourlyRate) * 100), // Convert rupees to paise
      specializations,
      certifications,
      instagram,
      youtube,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Please enter password values.");
      return;
    }
    updatePasswordMutation.mutate({ oldPassword, newPassword });
  };

  // Specs helpers
  const handleAddSpec = () => {
    if (newSpec.trim() && !specializations.includes(newSpec.trim())) {
      setSpecializations([...specializations, newSpec.trim()]);
      setNewSpec("");
    }
  };

  const handleRemoveSpec = (val: string) => {
    setSpecializations(specializations.filter((s) => s !== val));
  };

  // Certs helpers
  const handleAddCert = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert("");
    }
  };

  const handleRemoveCert = (val: string) => {
    setCertifications(certifications.filter((c) => c !== val));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">Coach Settings</h1>
        <p className="text-sm text-white/50">Configure your bios, rates, social links, and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form (Left/Center columns) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6 border-white/5">
            <h3 className="font-heading font-bold text-lg text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-gold" />
              Coaching Profile Details
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Short Biography</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tell members about your coaching background..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold resize-none"
                  />
                </div>

                <div>
                  <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Hourly Session Rate (₹)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Specs & Certs lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                {/* Specializations list */}
                <div>
                  <label className="text-xxs font-bold text-white/50 uppercase block mb-1.5">Specializations</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="e.g. CrossFit, Fat Loss"
                      value={newSpec}
                      onChange={(e) => setNewSpec(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="p-2 bg-brand-gold hover:bg-brand-gold/80 rounded-lg text-dark transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {specializations.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 text-[10px] bg-white/5 rounded border border-white/5 text-white/80 flex items-center gap-1"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(spec)}
                          className="text-red-400 hover:text-red-300 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications list */}
                <div>
                  <label className="text-xxs font-bold text-white/50 uppercase block mb-1.5">Certifications</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="e.g. NASM, ACE CPT"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCert}
                      className="p-2 bg-brand-gold hover:bg-brand-gold/80 rounded-lg text-dark transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-2 py-1 text-[10px] bg-white/5 rounded border border-white/5 text-white/80 flex items-center gap-1"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => handleRemoveCert(cert)}
                          className="text-red-400 hover:text-red-300 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social handles */}
              <div className="pt-4 border-t border-white/5">
                <h3 className="font-heading font-bold text-base text-white mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-gold" />
                  Social Platforms handles
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Instagram Profile</label>
                    <input
                      type="text"
                      placeholder="e.g. @coach_john"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="text-xxs font-bold text-white/50 uppercase block mb-1">YouTube Channel URL</label>
                    <input
                      type="text"
                      placeholder="e.g. youtube.com/c/coachjohn"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn-primary px-6 py-2.5 font-bold text-xs uppercase tracking-wider"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Trainer Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security update (Right column) */}
        <div className="space-y-8">
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
