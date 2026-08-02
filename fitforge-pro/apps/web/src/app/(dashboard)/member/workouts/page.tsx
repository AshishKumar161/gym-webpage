"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Dumbbell, History, Trash2, Calendar, Activity, Clock, Flame, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
}

interface WorkoutSession {
  id: string;
  name: string;
  notes?: string;
  durationMins: number;
  caloriesBurned: number;
  startedAt: string;
  exercises: Exercise[];
}

export default function WorkoutsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [logOpen, setLogOpen] = useState(false);

  // Form states
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState(60);
  const [calories, setCalories] = useState(300);
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: 3, reps: 10, weightKg: 20 }]);

  // Fetch past workouts
  const { data: workouts = [], isLoading } = useQuery<WorkoutSession[]>({
    queryKey: ["workouts", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/workouts`);
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Log workout mutation
  const logMutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.post(`${API_URL}/api/v1/workouts`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast.success("Workout session logged successfully!");
      setLogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to log workout.");
    },
  });

  const resetForm = () => {
    setWorkoutName("");
    setDuration(60);
    setCalories(300);
    setNotes("");
    setExercises([{ name: "", sets: 3, reps: 10, weightKg: 20 }]);
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: 10, weightKg: 20 }]);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleExerciseChange = (idx: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises];
    updated[idx] = {
      ...updated[idx],
      [field]: value,
    } as Exercise;

    setExercises(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutName) {
      toast.error("Please enter a workout name.");
      return;
    }
    const filteredExercises = exercises.filter(ex => ex.name.trim() !== "");
    logMutation.mutate({
      name: workoutName,
      durationMins: Number(duration),
      caloriesBurned: Number(calories),
      notes,
      exercises: filteredExercises,
    });
  };

  // Compile stats for the chart (last 7 workouts)
  const chartData = [...workouts]
    .reverse()
    .slice(-7)
    .map((w) => ({
      name: w.name.length > 10 ? w.name.slice(0, 10) + ".." : w.name,
      Calories: w.caloriesBurned,
    }));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-white mb-2">Workout Tracker</h1>
          <p className="text-sm text-white/50">Log daily exercises, visualize progress, and burn macros.</p>
        </div>
        <button
          onClick={() => setLogOpen(true)}
          className="btn-primary flex items-center gap-2 font-bold px-5 py-2.5"
        >
          <Plus className="w-5 h-5 text-dark" />
          Log Session
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workouts History (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          {workouts.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-white">Recent Sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workouts.map((w) => (
                  <div key={w.id} className="glass-card p-6 border-white/5 space-y-4 hover:border-brand-gold/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-brand-gold">
                          <Dumbbell className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{w.name}</h4>
                          <p className="text-xxs text-white/40 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(w.startedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-center">
                      <div>
                        <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Duration</span>
                        <span className="text-xs font-semibold text-white mt-1 block flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-brand-gold" />
                          {w.durationMins}m
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Burned</span>
                        <span className="text-xs font-semibold text-white mt-1 block flex items-center justify-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-brand-gold" />
                          {w.caloriesBurned} kcal
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Exercises</span>
                        <span className="text-xs font-semibold text-white mt-1 block flex items-center justify-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                          {w.exercises?.length ?? 0} items
                        </span>
                      </div>
                    </div>

                    {w.exercises?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Exercises Log</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {w.exercises.map((ex, i) => (
                            <div key={i} className="flex justify-between items-center text-xxs text-white/60 p-1.5 bg-white/2 rounded">
                              <span className="font-semibold text-white">{ex.name}</span>
                              <span>{ex.sets} sets × {ex.reps} reps ({ex.weightKg} kg)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card p-10 text-center">
              <Dumbbell className="w-12 h-12 text-white/20 mx-auto mb-3 animate-pulse" />
              <h4 className="font-bold text-white text-base">No workouts logged yet</h4>
              <p className="text-xs text-white/40 mt-1 mb-6">Hit the gym floor and log your first workout session above.</p>
            </div>
          )}
        </div>

        {/* Analytics Summary & Charts (Right Column) */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-lg text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-gold" />
              Calories Burned (Last 7 Sessions)
            </h3>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0d0f14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                      labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    />
                    <Bar dataKey="Calories" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-white/40 text-center py-10">Log workouts to view analytics charts.</p>
            )}
          </div>
        </div>
      </div>

      {/* Log Modal */}
      <AnimatePresence>
        {logOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogOpen(false)}
              className="fixed inset-0 z-50 bg-dark/90 backdrop-blur-xl flex items-center justify-center p-4"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[51] w-full max-w-xl glass-card p-6 max-h-[85vh] overflow-y-auto"
            >
              <h3 className="font-heading font-bold text-xl text-white mb-4">Log Workout Session</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Workout Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Chest Hypertrophy, Leg Day"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Duration (mins)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xxs font-bold text-white/50 uppercase block mb-1">Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Felt strong today"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                {/* Exercises section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h4 className="font-bold text-sm text-white">Exercises List</h4>
                    <button
                      type="button"
                      onClick={handleAddExercise}
                      className="text-xs font-semibold text-brand-gold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Exercise
                    </button>
                  </div>

                  <div className="space-y-3">
                    {exercises.map((ex, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-3 items-end p-3 bg-white/2 border border-white/5 rounded-xl">
                        <div className="col-span-5">
                          <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Exercise Name</label>
                          <input
                            type="text"
                            placeholder="Bench Press, Squat"
                            value={ex.name}
                            onChange={(e) => handleExerciseChange(idx, "name", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Sets</label>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => handleExerciseChange(idx, "sets", Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Reps</label>
                          <input
                            type="number"
                            value={ex.reps}
                            onChange={(e) => handleExerciseChange(idx, "reps", Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Wt (kg)</label>
                          <input
                            type="number"
                            value={ex.weightKg}
                            onChange={(e) => handleExerciseChange(idx, "weightKg", Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(idx)}
                            className="p-2 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                            aria-label="Remove exercise"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/5 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setLogOpen(false);
                      resetForm();
                    }}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={logMutation.isPending}
                    className="btn-primary text-xs px-6 py-2 font-bold"
                  >
                    {logMutation.isPending ? "Logging..." : "Log Workout"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
