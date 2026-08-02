"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Trophy, Users, Clock, Star, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const milestones = [
  { year: "2019", title: "Founded", desc: "Started with a vision of premium fitness for all" },
  { year: "2020", title: "500 Members", desc: "Reached our first major membership milestone" },
  { year: "2022", title: "Expansion", desc: "Added CrossFit box, yoga studio & spa" },
  { year: "2024", title: "5000+ Members", desc: "India's top-rated premium gym" },
];

const values = [
  "No compromises on equipment quality",
  "Every trainer is nationally certified",
  "Hygiene inspected 4× daily",
  "Member results tracked & reported monthly",
  "Continuous coach education program",
  "100% money-back if unsatisfied in 7 days",
];

export function AboutSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section id="about" className="section-spacing relative" aria-labelledby="about-heading">
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Content */}
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <span className="section-tag mb-6 inline-flex">
                <Trophy className="w-3.5 h-3.5" />
                About Us
              </span>

              <h2
                id="about-heading"
                className="section-title text-4xl md:text-5xl mb-6"
              >
                More Than Just a{" "}
                <span className="gold-text">Gym</span>
              </h2>

              <p className="text-white/60 leading-relaxed mb-6">
                Founded in 2019, FitForge Pro was built on a simple belief:
                every person deserves access to world-class fitness. We&apos;ve
                spent years curating the perfect combination of premium equipment,
                expert coaching, and a community that actually shows up for you.
              </p>

              <p className="text-white/60 leading-relaxed mb-8">
                We&apos;re not just a gym — we&apos;re a complete fitness ecosystem.
                From personalized AI workout plans to nutrition coaching, body
                composition tracking, and group classes, everything is designed
                to deliver measurable results.
              </p>

              {/* Values */}
              <div className="space-y-3 mb-10">
                {values.map((value, i) => (
                  <motion.div
                    key={value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3 text-sm text-white/70"
                  >
                    <CheckCircle className="w-5 h-5 text-brand-gold flex-shrink-0" />
                    {value}
                  </motion.div>
                ))}
              </div>

              <Link href="/auth/register" className="btn-primary group">
                Join Our Community
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right — Visual */}
          <div>
            {/* Milestone Timeline */}
            <div className="relative pl-8 space-y-8">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-brand-gold/60 via-brand-gold/20 to-transparent" aria-hidden="true" />

              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative"
                >
                  <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center shadow-gold">
                    <div className="w-2 h-2 rounded-full bg-dark" />
                  </div>
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="badge-gold text-xs">{m.year}</span>
                      <h3 className="font-heading font-bold text-white">{m.title}</h3>
                    </div>
                    <p className="text-sm text-white/50">{m.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats Row */}
            <div ref={statsRef} className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: Users, value: "5000+", label: "Members" },
                { icon: Trophy, value: "12+", label: "Awards" },
                { icon: Star, value: "4.9★", label: "Rating" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-5 text-center"
                  >
                    <Icon className="w-6 h-6 text-brand-gold mx-auto mb-2" />
                    <div className="font-heading font-black text-xl gold-text">{stat.value}</div>
                    <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
