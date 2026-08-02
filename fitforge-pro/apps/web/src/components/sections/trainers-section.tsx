"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Instagram, Star, Award, Users } from "lucide-react";
import { generateInitials } from "@/lib/utils";

const trainers = [
  {
    name: "Arjun Kapoor",
    role: "Head Trainer & Bodybuilding Coach",
    specializations: ["Bodybuilding", "Powerlifting", "Nutrition"],
    experience: 12,
    rating: 4.9,
    clients: 200,
    certifications: ["ISSA", "ACE", "NSCA"],
    instagram: "@arjunfitpro",
    gradient: "from-brand-gold to-brand-fire",
  },
  {
    name: "Priya Sharma",
    role: "Yoga & Mindfulness Coach",
    specializations: ["Yoga", "Pilates", "Flexibility", "Meditation"],
    experience: 8,
    rating: 4.9,
    clients: 150,
    certifications: ["RYT-500", "Pilates Method Alliance"],
    instagram: "@priyayoga",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Rohit Mehta",
    role: "CrossFit & Functional Trainer",
    specializations: ["CrossFit", "Olympic Lifting", "HIIT"],
    experience: 10,
    rating: 4.8,
    clients: 175,
    certifications: ["CrossFit L3", "USAW", "CSCS"],
    instagram: "@rohitcrossfit",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Sneha Iyer",
    role: "Women's Fitness Specialist",
    specializations: ["Weight Loss", "Toning", "Pre/Post Natal"],
    experience: 7,
    rating: 4.9,
    clients: 180,
    certifications: ["NASM", "Precision Nutrition", "Pre/Post Natal"],
    instagram: "@snehafit",
    gradient: "from-rose-500 to-pink-400",
  },
];

function TrainerCard({
  trainer,
  index,
}: {
  trainer: (typeof trainers)[0];
  index: number;
}) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const initials = generateInitials(
    trainer.name.split(" ")[0] || "",
    trainer.name.split(" ")[1] || "X"
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="glass-card p-6 group"
    >
      {/* Avatar */}
      <div className="relative mb-6">
        <div
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${trainer.gradient} flex items-center justify-center text-2xl font-heading font-black text-white mb-4 group-hover:scale-105 transition-transform duration-300`}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
        >
          {initials}
        </div>

        {/* Rating */}
        <div className="absolute top-0 right-0 flex items-center gap-1 badge-gold text-xs">
          <Star className="w-3 h-3 fill-brand-gold" />
          {trainer.rating}
        </div>
      </div>

      {/* Info */}
      <h3 className="font-heading font-bold text-lg text-white mb-1 group-hover:text-brand-gold transition-colors">
        {trainer.name}
      </h3>
      <p className="text-xs text-white/40 mb-4">{trainer.role}</p>

      {/* Specializations */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {trainer.specializations.map((s) => (
          <span
            key={s}
            className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/50 border border-white/8"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5 border-t border-white/5 pt-4">
        <div className="text-center">
          <div className="font-bold text-white text-sm">{trainer.experience}yr</div>
          <div className="text-xs text-white/30">Experience</div>
        </div>
        <div className="text-center border-x border-white/5">
          <div className="font-bold text-white text-sm">{trainer.clients}+</div>
          <div className="text-xs text-white/30">Clients</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-white text-sm">{trainer.certifications.length}</div>
          <div className="text-xs text-white/30">Certs</div>
        </div>
      </div>

      {/* Instagram + Book */}
      <div className="flex items-center gap-3">
        <a
          href={`https://instagram.com/${trainer.instagram.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-brand-gold transition-colors"
          aria-label={`${trainer.name} on Instagram`}
        >
          <Instagram className="w-3.5 h-3.5" />
          {trainer.instagram}
        </a>
        <a
          href="/auth/register"
          className="ml-auto text-xs font-semibold text-brand-gold hover:underline"
        >
          Book Session →
        </a>
      </div>
    </motion.div>
  );
}

export function TrainersSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section id="trainers" className="section-spacing relative" aria-labelledby="trainers-heading">
      <div className="page-container">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="section-tag mb-4 inline-flex">
              <Award className="w-3.5 h-3.5" />
              Expert Trainers
            </span>
          </motion.div>
          <motion.h2
            id="trainers-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-title text-4xl md:text-5xl mb-6"
          >
            Train With the{" "}
            <span className="gold-text">Best</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/50 max-w-xl mx-auto"
          >
            All our trainers are nationally certified, background-checked, and
            continuously educated in the latest exercise science.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trainers.map((trainer, i) => (
            <TrainerCard key={trainer.name} trainer={trainer} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
