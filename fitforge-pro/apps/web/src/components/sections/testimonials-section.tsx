"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, Quote } from "lucide-react";
import Image from "next/image";
import { generateInitials } from "@/lib/utils";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Software Engineer",
    avatar: null,
    rating: 5,
    text: "FitForge Pro completely transformed my lifestyle. Lost 18 kg in 4 months with the Elite plan. My trainer Arjun was exceptional — personalized workouts, constant motivation, and a diet plan that actually tasted good!",
    metrics: "Lost 18 kg",
    duration: "4 months",
  },
  {
    name: "Priya Patel",
    role: "Entrepreneur",
    avatar: null,
    rating: 5,
    text: "As a busy entrepreneur, I needed a gym that could work around my schedule. FitForge Pro's 5 AM opening and flexible class booking made it possible. The app is incredibly well-designed — everything is just one tap away.",
    metrics: "Lost 12 kg",
    duration: "3 months",
  },
  {
    name: "Akash Nair",
    role: "Medical Professional",
    avatar: null,
    rating: 5,
    text: "I've been to 5 different gyms in the past 10 years. This is by far the best. The equipment quality, cleanliness, trainer expertise, and the tech — everything is at a different level. Worth every rupee.",
    metrics: "Gained 8 kg muscle",
    duration: "6 months",
  },
  {
    name: "Sneha Reddy",
    role: "Marketing Manager",
    avatar: null,
    rating: 5,
    text: "The Women's Zone and yoga classes are absolutely wonderful. Friendly, non-judgmental environment. The progress tracking dashboard is my favorite feature — seeing my improvements visualized keeps me motivated.",
    metrics: "Lost 15 kg",
    duration: "5 months",
  },
  {
    name: "Vikram Singh",
    role: "Athlete",
    avatar: null,
    rating: 5,
    text: "The CrossFit box here is world-class. The WODs are programmed brilliantly and the coaches really know their stuff. QR check-in, the rewards program, and the community here are all top-notch.",
    metrics: "PR'd every lift",
    duration: "8 months",
  },
  {
    name: "Ananya Krishnan",
    role: "Teacher",
    avatar: null,
    rating: 5,
    text: "I was hesitant to join a gym for the first time at 35, but the staff at FitForge Pro made me feel so welcome. The beginner program was perfect, and now I'm doing intermediate classes. Best decision I ever made!",
    metrics: "Lost 10 kg",
    duration: "3 months",
  },
];

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const initials = generateInitials(
    testimonial.name.split(" ")[0] || "",
    testimonial.name.split(" ")[1] || "X"
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="glass-card p-6 flex flex-col h-full"
    >
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-brand-gold/20 mb-4 flex-shrink-0" />

      {/* Rating */}
      <div className="flex items-center gap-0.5 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-brand-gold text-brand-gold"
          />
        ))}
      </div>

      {/* Testimonial text */}
      <p className="text-sm text-white/60 leading-relaxed flex-1 mb-6">
        &ldquo;{testimonial.text}&rdquo;
      </p>

      {/* Metrics badge */}
      <div className="flex items-center gap-2 mb-5">
        <div className="badge-gold">
          {testimonial.metrics} in {testimonial.duration}
        </div>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center text-dark font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-sm text-white">{testimonial.name}</p>
          <p className="text-xs text-white/40">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const overallRating = 4.9;
  const totalReviews = 847;

  return (
    <section
      id="testimonials"
      className="section-spacing"
      aria-labelledby="testimonials-heading"
    >
      <div className="page-container">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="section-tag mb-4 inline-flex">
              <Star className="w-3.5 h-3.5" />
              Member Stories
            </span>
          </motion.div>

          <motion.h2
            id="testimonials-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-title text-4xl md:text-5xl mb-6"
          >
            Real Results,{" "}
            <span className="gold-text">Real People</span>
          </motion.h2>

          {/* Rating Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-4 glass-card px-6 py-4 rounded-2xl mb-6"
          >
            <div className="text-center">
              <div className="text-4xl font-heading font-black gold-text">{overallRating}</div>
              <div className="text-xs text-white/40">out of 5</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="flex items-center gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <div className="text-sm text-white/50">{totalReviews.toLocaleString()} reviews</div>
            </div>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
