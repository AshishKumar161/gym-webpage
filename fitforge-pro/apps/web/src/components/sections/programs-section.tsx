"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Dumbbell, Clock, Flame, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const programs = [
  {
    title: "Fat Loss Accelerator",
    category: "Weight Management",
    duration: "8 Weeks",
    sessions: "5 days/week",
    intensity: "High",
    calories: "600-800 kcal/session",
    description: "A science-backed, high-intensity program combining HIIT, strength training, and strategic cardio to maximize fat burning and preserve lean muscle.",
    gradient: "from-red-500 to-orange-500",
    glow: "rgba(239, 68, 68, 0.2)",
    tags: ["HIIT", "Cardio", "Strength"],
  },
  {
    title: "Muscle Builder Pro",
    category: "Strength & Hypertrophy",
    duration: "12 Weeks",
    sessions: "5 days/week",
    intensity: "Medium-High",
    calories: "400-500 kcal/session",
    description: "Progressive overload-based hypertrophy program designed to maximize muscle growth through periodization, compound movements, and optimal recovery.",
    gradient: "from-brand-gold to-yellow-500",
    glow: "rgba(245, 166, 35, 0.2)",
    tags: ["Hypertrophy", "Compound Lifts", "Progressive"],
    isPopular: true,
  },
  {
    title: "Athletic Performance",
    category: "Sport Conditioning",
    duration: "10 Weeks",
    sessions: "6 days/week",
    intensity: "Very High",
    calories: "700-900 kcal/session",
    description: "Designed for athletes looking to improve speed, agility, power, and endurance through sport-specific conditioning and Olympic lifting.",
    gradient: "from-blue-500 to-cyan-400",
    glow: "rgba(59, 130, 246, 0.2)",
    tags: ["Agility", "Power", "Endurance"],
  },
  {
    title: "Beginner Foundation",
    category: "Fitness Fundamentals",
    duration: "6 Weeks",
    sessions: "3 days/week",
    intensity: "Low-Medium",
    calories: "300-400 kcal/session",
    description: "The perfect starting point. Learn proper form, build a strong base, develop healthy habits, and safely progress toward your fitness goals.",
    gradient: "from-green-500 to-emerald-400",
    glow: "rgba(34, 197, 94, 0.2)",
    tags: ["Beginner", "Form", "Foundation"],
  },
  {
    title: "CrossFit Challenge",
    category: "Functional Fitness",
    duration: "8 Weeks",
    sessions: "5 days/week",
    intensity: "Very High",
    calories: "800-1000 kcal/session",
    description: "Varied functional movements performed at high intensity. Builds total body fitness, mental toughness, and an incredible community spirit.",
    gradient: "from-purple-500 to-pink-500",
    glow: "rgba(168, 85, 247, 0.2)",
    tags: ["CrossFit", "Functional", "Community"],
  },
  {
    title: "Mind & Body Balance",
    category: "Yoga & Wellness",
    duration: "8 Weeks",
    sessions: "4 days/week",
    intensity: "Low",
    calories: "200-300 kcal/session",
    description: "A holistic program combining yoga, Pilates, meditation, and breathwork to improve flexibility, core strength, and mental well-being.",
    gradient: "from-teal-500 to-cyan-400",
    glow: "rgba(20, 184, 166, 0.2)",
    tags: ["Yoga", "Pilates", "Mindfulness"],
  },
];

const intensityColors: Record<string, string> = {
  Low: "#22c55e",
  "Low-Medium": "#84cc16",
  "Medium-High": "#f59e0b",
  High: "#ef4444",
  "Very High": "#dc2626",
};

export function ProgramsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section id="programs" className="section-spacing" aria-labelledby="programs-heading">
      <div className="page-container">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="section-tag mb-4 inline-flex">
              <Dumbbell className="w-3.5 h-3.5" />
              Training Programs
            </span>
          </motion.div>
          <motion.h2
            id="programs-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-title text-4xl md:text-5xl mb-6"
          >
            Find Your Perfect{" "}
            <span className="gold-text">Program</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/50 max-w-xl mx-auto"
          >
            Science-backed programs for every fitness level, goal, and lifestyle.
            Each program includes a complete workout plan, diet guidance, and
            trainer support.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, i) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cn(
                "glass-card p-6 group relative flex flex-col",
                program.isPopular && "ring-1 ring-brand-gold/30"
              )}
              style={
                program.isPopular
                  ? { boxShadow: `0 20px 40px ${program.glow}` }
                  : undefined
              }
            >
              {program.isPopular && (
                <div className="absolute -top-3 right-6">
                  <span className="badge-gold text-xs">Most Popular</span>
                </div>
              )}

              {/* Category & Duration */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/40 font-medium">{program.category}</span>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <Clock className="w-3 h-3" />
                  {program.duration}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-heading font-bold text-xl text-white mb-3 group-hover:text-brand-gold transition-colors">
                {program.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-white/50 leading-relaxed mb-5 flex-1">
                {program.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {program.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/8 text-white/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-white/30" />
                  <span className="text-xs text-white/50">{program.sessions}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" style={{ color: intensityColors[program.intensity] }} />
                  <span className="text-xs text-white/50">{program.calories}</span>
                </div>
              </div>

              {/* Intensity */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs text-white/30">Intensity</span>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    color: intensityColors[program.intensity],
                    background: `${intensityColors[program.intensity]}15`,
                    border: `1px solid ${intensityColors[program.intensity]}30`,
                  }}
                >
                  {program.intensity}
                </span>
              </div>

              {/* Gradient line bottom */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  program.gradient
                )}
              />

              <a
                href="/auth/register"
                className="flex items-center gap-2 text-sm font-semibold text-brand-gold hover:underline group/link"
              >
                Start Program
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
