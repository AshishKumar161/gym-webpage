"use client";

import { useRef, Suspense } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, ChevronDown, Star, Users, Award, TrendingUp } from "lucide-react";
import { HeroScene } from "@/components/3d/hero-scene";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const stats = [
  { value: 5000, suffix: "+", label: "Active Members", icon: Users },
  { value: 98, suffix: "%", label: "Success Rate", icon: TrendingUp },
  { value: 50, suffix: "+", label: "Expert Trainers", icon: Award },
  { value: 4.9, suffix: "", label: "Google Rating", icon: Star, decimals: 1 },
];

function AnimatedStat({
  value,
  suffix,
  label,
  icon: Icon,
  decimals = 0,
}: (typeof stats)[0]) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center group"
    >
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Icon className="w-4 h-4 text-brand-gold" />
        <span className="font-heading font-black text-3xl md:text-4xl gold-text">
          {inView ? (
            <CountUp
              end={value}
              duration={2.5}
              decimals={decimals}
              suffix={suffix}
              separator=","
            />
          ) : (
            "0" + suffix
          )}
        </span>
      </div>
      <p className="text-xs font-medium text-white/50 tracking-wider uppercase">
        {label}
      </p>
    </motion.div>
  );
}

// Floating badge with pulse
function FloatingBadge({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      className={cn(
        "absolute glass-card px-4 py-3 flex items-center gap-3 z-20",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.7], [0, 80]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-brand-gold/10 via-transparent to-transparent" aria-hidden="true" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />

      {/* 3D Canvas — full screen */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      {/* Radial glow at center */}
      <div
        className="absolute inset-x-0 top-1/4 h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(245, 166, 35, 0.12) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Main Content */}
      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 page-container w-full pt-32 pb-20"
      >
        <div className="max-w-4xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <span className="section-tag">
              <span className="glow-dot" />
              India&apos;s #1 Premium Fitness Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="section-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 text-balance"
          >
            <span className="text-white">Forge Your</span>
            <br />
            <span className="gold-text">Best Self</span>
            <br />
            <span className="text-white/80">Everyday.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed"
          >
            Premium gym experience with expert trainers, cutting-edge equipment,
            AI-powered workout plans, and a community that drives results.
            Transform your body. Transform your life.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 mb-16"
          >
            <Link href="/auth/register" className="btn-primary group text-base">
              Start Your Journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <button
              className="btn-ghost group text-base flex items-center gap-3"
              onClick={() =>
                document.getElementById("video-section")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors duration-200">
                <Play className="w-4 h-4 text-brand-gold ml-0.5" fill="currentColor" />
              </div>
              Watch Story
            </button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap items-center gap-8 md:gap-12"
          >
            {stats.map((stat) => (
              <AnimatedStat key={stat.label} {...stat} />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Floating info cards */}
      <FloatingBadge
        className="top-1/3 right-8 md:right-16 hidden md:flex rounded-xl"
        delay={0.8}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-dark" />
        </div>
        <div>
          <p className="text-xs text-white/40 font-medium">This Month</p>
          <p className="text-sm font-bold text-white">+127 New Members</p>
        </div>
      </FloatingBadge>

      <FloatingBadge
        className="bottom-1/3 right-12 md:right-24 hidden lg:flex rounded-xl"
        delay={1.0}
      >
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-dark-100"
              style={{
                background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 55%), hsl(${i * 60 + 30}, 70%, 45%))`,
              }}
            />
          ))}
        </div>
        <div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3 h-3 fill-brand-gold text-brand-gold" />
            ))}
          </div>
          <p className="text-xs text-white/60">847 reviews</p>
        </div>
      </FloatingBadge>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/30 font-medium tracking-widest uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-brand-gold" />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #0A0A0F, transparent)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
