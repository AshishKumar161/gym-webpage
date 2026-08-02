"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator, Droplets, Zap, Activity, ChevronRight } from "lucide-react";
import {
  calculateBMI,
  getBMICategory,
  calculateDailyCalories,
  calculateWaterIntake,
  calculateBodyFat,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

// BMI Schema
const bmiSchema = z.object({
  weight: z.coerce.number().min(20).max(300),
  height: z.coerce.number().min(50).max(250),
});

// Calorie Schema
const calorieSchema = z.object({
  weight: z.coerce.number().min(20).max(300),
  height: z.coerce.number().min(50).max(250),
  age: z.coerce.number().min(10).max(120),
  gender: z.enum(["male", "female"]),
  activity: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});

type BmiFormData = z.infer<typeof bmiSchema>;
type CalorieFormData = z.infer<typeof calorieSchema>;

const tools = [
  { id: "bmi", label: "BMI Calculator", icon: Calculator },
  { id: "calorie", label: "Calorie Calculator", icon: Zap },
  { id: "water", label: "Water Intake", icon: Droplets },
  { id: "bodyfat", label: "Body Fat", icon: Activity },
];

// ─── BMI Tool ──────────────────────────────────────────────────────────────
function BmiTool() {
  const [result, setResult] = useState<{ bmi: number; category: string; color: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BmiFormData>({ resolver: zodResolver(bmiSchema) });

  const onSubmit = (data: BmiFormData) => {
    const bmi = calculateBMI(data.weight, data.height);
    const { category, color } = getBMICategory(bmi);
    setResult({ bmi, category, color });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 font-medium mb-2 block">
              Weight (kg)
            </label>
            <input
              {...register("weight")}
              type="number"
              placeholder="70"
              className="input-base"
            />
            {errors.weight && (
              <p className="text-red-400 text-xs mt-1">{errors.weight.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-white/50 font-medium mb-2 block">
              Height (cm)
            </label>
            <input
              {...register("height")}
              type="number"
              placeholder="175"
              className="input-base"
            />
            {errors.height && (
              <p className="text-red-400 text-xs mt-1">{errors.height.message}</p>
            )}
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">
          Calculate BMI
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center"
        >
          <p className="text-sm text-white/50 mb-2">Your BMI</p>
          <div
            className="text-6xl font-heading font-black mb-2"
            style={{ color: result.color }}
          >
            {result.bmi}
          </div>
          <div
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            style={{
              background: `${result.color}20`,
              border: `1px solid ${result.color}40`,
              color: result.color,
            }}
          >
            {result.category}
          </div>
          <div className="mt-4 w-full bg-dark-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((result.bmi / 40) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: result.color }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>Underweight</span>
            <span>Normal</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Calorie Tool ──────────────────────────────────────────────────────────
function CalorieTool() {
  const [calories, setCalories] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CalorieFormData>({ resolver: zodResolver(calorieSchema) });

  const onSubmit = (data: CalorieFormData) => {
    const result = calculateDailyCalories(
      data.weight,
      data.height,
      data.age,
      data.gender,
      data.activity
    );
    setCalories(result);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 font-medium mb-2 block">Weight (kg)</label>
            <input {...register("weight")} type="number" placeholder="70" className="input-base" />
          </div>
          <div>
            <label className="text-xs text-white/50 font-medium mb-2 block">Height (cm)</label>
            <input {...register("height")} type="number" placeholder="175" className="input-base" />
          </div>
          <div>
            <label className="text-xs text-white/50 font-medium mb-2 block">Age</label>
            <input {...register("age")} type="number" placeholder="25" className="input-base" />
          </div>
          <div>
            <label className="text-xs text-white/50 font-medium mb-2 block">Gender</label>
            <select {...register("gender")} className="input-base">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-white/50 font-medium mb-2 block">Activity Level</label>
          <select {...register("activity")} className="input-base">
            <option value="sedentary">Sedentary (desk job)</option>
            <option value="light">Light (1–3 days/week)</option>
            <option value="moderate">Moderate (3–5 days/week)</option>
            <option value="active">Active (6–7 days/week)</option>
            <option value="very_active">Very Active (athlete)</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full">
          Calculate Calories
        </button>
      </form>

      {calories && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <p className="text-sm text-white/50 text-center mb-4">Daily Calorie Needs</p>
          <div className="text-center mb-6">
            <span className="text-5xl font-heading font-black gold-text">{calories.toLocaleString()}</span>
            <span className="text-white/40 ml-2">kcal/day</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Weight Loss", value: Math.round(calories * 0.8), color: "#ef4444" },
              { label: "Maintenance", value: calories, color: "#22c55e" },
              { label: "Muscle Gain", value: Math.round(calories * 1.15), color: "#3b82f6" },
            ].map((goal) => (
              <div
                key={goal.label}
                className="text-center p-3 rounded-xl"
                style={{ background: `${goal.color}10`, border: `1px solid ${goal.color}30` }}
              >
                <div className="font-bold text-sm" style={{ color: goal.color }}>
                  {goal.value.toLocaleString()}
                </div>
                <div className="text-xs text-white/40 mt-1">{goal.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Water Tool ────────────────────────────────────────────────────────────
function WaterTool() {
  const [water, setWater] = useState<number | null>(null);
  const [weight, setWeight] = useState("");

  const calculate = () => {
    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0) setWater(calculateWaterIntake(w));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs text-white/50 font-medium mb-2 block">Weight (kg)</label>
        <input
          type="number"
          placeholder="70"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="input-base"
        />
      </div>
      <button onClick={calculate} className="btn-primary w-full">
        Calculate Water Intake
      </button>

      {water && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center"
        >
          <div className="flex items-end justify-center gap-2 mb-2">
            <span className="text-6xl font-heading font-black text-blue-400">{water}</span>
            <span className="text-blue-300 text-xl mb-2">L/day</span>
          </div>
          <p className="text-sm text-white/50 mb-4">Daily water intake recommendation</p>
          <div className="flex justify-center gap-3">
            {Array.from({ length: Math.round(water * 4) }, (_, i) => (
              <Droplets
                key={i}
                className="w-6 h-6 text-blue-400"
                style={{ opacity: i < Math.round(water * 4) ? 1 : 0.2 }}
              />
            ))}
          </div>
          <p className="text-xs text-white/30 mt-3">= {Math.round(water * 1000 / 250)} glasses (250ml each)</p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Body Fat Tool ─────────────────────────────────────────────────────────
function BodyFatTool() {
  const [result, setResult] = useState<number | null>(null);
  const [form, setForm] = useState({ bmi: "", age: "", gender: "male" as "male" | "female" });

  const calculate = () => {
    const bmi = parseFloat(form.bmi);
    const age = parseFloat(form.age);
    if (!isNaN(bmi) && !isNaN(age)) {
      setResult(calculateBodyFat(bmi, age, form.gender));
    }
  };

  const getCategory = (bf: number, gender: "male" | "female") => {
    if (gender === "male") {
      if (bf < 6) return { label: "Essential Fat", color: "#3b82f6" };
      if (bf < 14) return { label: "Athlete", color: "#22c55e" };
      if (bf < 18) return { label: "Fitness", color: "#84cc16" };
      if (bf < 25) return { label: "Average", color: "#f59e0b" };
      return { label: "Obese", color: "#ef4444" };
    } else {
      if (bf < 14) return { label: "Essential Fat", color: "#3b82f6" };
      if (bf < 21) return { label: "Athlete", color: "#22c55e" };
      if (bf < 25) return { label: "Fitness", color: "#84cc16" };
      if (bf < 32) return { label: "Average", color: "#f59e0b" };
      return { label: "Obese", color: "#ef4444" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 font-medium mb-2 block">BMI</label>
            <input
              type="number"
              placeholder="22.5"
              value={form.bmi}
              onChange={(e) => setForm({ ...form, bmi: e.target.value })}
              className="input-base"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 font-medium mb-2 block">Age</label>
            <input
              type="number"
              placeholder="25"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="input-base"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-white/50 font-medium mb-2 block">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}
            className="input-base"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
      <button onClick={calculate} className="btn-primary w-full">
        Calculate Body Fat
      </button>

      {result !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center"
        >
          {(() => {
            const { label, color } = getCategory(result, form.gender);
            return (
              <>
                <div className="text-5xl font-heading font-black mb-2" style={{ color }}>
                  {result}%
                </div>
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4"
                  style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
                >
                  {label}
                </div>
                <div className="w-full bg-dark-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(result * 2, 100)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}

export function CalculatorsSection() {
  const [activeTab, setActiveTab] = useState("bmi");
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const toolComponents: Record<string, React.ReactNode> = {
    bmi: <BmiTool />,
    calorie: <CalorieTool />,
    water: <WaterTool />,
    bodyfat: <BodyFatTool />,
  };

  return (
    <section
      id="calculators"
      className="section-spacing"
      aria-labelledby="calculators-heading"
    >
      <div className="page-container">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="section-tag mb-4 inline-flex">
              <Calculator className="w-3.5 h-3.5" />
              Health Tools
            </span>
          </motion.div>
          <motion.h2
            id="calculators-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-title text-4xl md:text-5xl mb-6"
          >
            Know Your <span className="gold-text">Numbers</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/50 max-w-xl mx-auto"
          >
            Free health calculators to help you understand your body and set the
            right fitness goals.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Tool Selector */}
          <div className="lg:col-span-2 space-y-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-200",
                    activeTab === tool.id
                      ? "glass-card border-brand-gold/30 bg-brand-gold/5"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200",
                      activeTab === tool.id
                        ? "bg-brand-gold/20 text-brand-gold"
                        : "bg-white/5 text-white/50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={cn(
                      "font-medium text-sm transition-colors duration-200",
                      activeTab === tool.id ? "text-brand-gold" : "text-white/60"
                    )}
                  >
                    {tool.label}
                  </span>
                  {activeTab === tool.id && (
                    <ChevronRight className="w-4 h-4 text-brand-gold ml-auto" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calculator Panel */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8"
            >
              <h3 className="font-heading font-bold text-xl text-white mb-6">
                {tools.find((t) => t.id === activeTab)?.label}
              </h3>
              {toolComponents[activeTab]}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
