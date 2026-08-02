"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Zap, Target, Heart, Shield, Dumbbell, Users, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Dumbbell,
    title: "World-Class Equipment",
    description:
      "10,000 sq ft facility with 200+ premium machines from Life Fitness, Technogym, and Hammer Strength.",
    color: "from-brand-gold to-yellow-400",
    glow: "rgba(245, 166, 35, 0.3)",
  },
  {
    icon: Users,
    title: "Expert Trainers",
    description:
      "50+ certified trainers with specializations in bodybuilding, powerlifting, crossfit, yoga, and sports nutrition.",
    color: "from-blue-500 to-cyan-400",
    glow: "rgba(59, 130, 246, 0.3)",
  },
  {
    icon: Target,
    title: "Personalized Plans",
    description:
      "AI-powered workout and diet plans tailored to your body type, goals, and fitness level.",
    color: "from-purple-500 to-pink-400",
    glow: "rgba(168, 85, 247, 0.3)",
  },
  {
    icon: Heart,
    title: "Health Monitoring",
    description:
      "Track BMI, body fat, progress photos, attendance, and vital stats all in one dashboard.",
    color: "from-red-500 to-rose-400",
    glow: "rgba(239, 68, 68, 0.3)",
  },
  {
    icon: Zap,
    title: "Group Classes",
    description:
      "45+ weekly classes: Zumba, Yoga, CrossFit, Spinning, HIIT, Pilates, Boxing, and more.",
    color: "from-green-500 to-emerald-400",
    glow: "rgba(34, 197, 94, 0.3)",
  },
  {
    icon: Shield,
    title: "QR Check-In",
    description:
      "Seamless QR code-based check-in. Contactless, instant, and integrated with attendance tracking.",
    color: "from-orange-500 to-amber-400",
    glow: "rgba(249, 115, 22, 0.3)",
  },
  {
    icon: Clock,
    title: "Open 365 Days",
    description:
      "Open 5 AM to 11 PM on weekdays and 6 AM to 10 PM on weekends. We fit your schedule.",
    color: "from-teal-500 to-cyan-400",
    glow: "rgba(20, 184, 166, 0.3)",
  },
  {
    icon: Trophy,
    title: "Reward System",
    description:
      "Earn points for every visit, milestone, and referral. Redeem for discounts, merch, and free sessions.",
    color: "from-brand-gold to-brand-fire",
    glow: "rgba(245, 166, 35, 0.3)",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-6 group cursor-pointer"
      style={{ "--glow-color": feature.glow } as React.CSSProperties}
    >
      {/* Icon */}
      <div className="mb-5">
        <div
          className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
            feature.color
          )}
          style={{
            boxShadow: `0 8px 24px ${feature.glow}`,
          }}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Content */}
      <h3 className="font-heading font-bold text-lg text-white mb-3 group-hover:text-brand-gold transition-colors duration-200">
        {feature.title}
      </h3>
      <p className="text-sm text-white/50 leading-relaxed">
        {feature.description}
      </p>

      {/* Hover gradient line */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          feature.color
        )}
      />
    </motion.div>
  );
}

export function FeaturesSection() {
  const [titleRef, titleInView] = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section id="features" className="section-spacing relative" aria-labelledby="features-heading">
      {/* Background */}
      <div className="absolute inset-0 bg-dot opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="page-container">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="section-tag mb-4 inline-flex">
              <Zap className="w-3.5 h-3.5" />
              Why FitForge Pro
            </span>
          </motion.div>

          <motion.h2
            id="features-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-title text-4xl md:text-5xl lg:text-6xl mb-6"
          >
            Everything You Need to{" "}
            <span className="gold-text">Succeed</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/50 max-w-2xl mx-auto"
          >
            We didn&apos;t just build a gym. We built a complete fitness ecosystem
            designed to deliver measurable results for every member.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
