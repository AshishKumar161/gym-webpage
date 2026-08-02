"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Check, Star, Zap, Crown, Flame } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: Flame,
    price: 999,
    originalPrice: 1499,
    duration: "month",
    description: "Perfect for beginners starting their fitness journey.",
    color: "from-blue-500 to-cyan-400",
    glow: "rgba(59, 130, 246, 0.2)",
    features: [
      "Full gym access (5 AM – 11 PM)",
      "1 fitness assessment",
      "Access to all cardio equipment",
      "Locker & shower facility",
      "Free WiFi",
      "Mobile app access",
    ],
    notIncluded: ["Personal trainer sessions", "Group classes", "Diet plan"],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Star,
    price: 2499,
    originalPrice: 3999,
    duration: "month",
    description: "Our most popular plan for serious fitness enthusiasts.",
    color: "from-brand-gold to-brand-fire",
    glow: "rgba(245, 166, 35, 0.3)",
    isPopular: true,
    features: [
      "Everything in Starter",
      "4 personal trainer sessions",
      "Unlimited group classes",
      "Customized workout plan",
      "Basic diet guidance",
      "Progress tracking dashboard",
      "Nutrition consultation (1x/month)",
      "Guest pass (2/month)",
    ],
    notIncluded: ["Dedicated trainer", "Advanced diet plan"],
  },
  {
    id: "elite",
    name: "Elite",
    icon: Crown,
    price: 4999,
    originalPrice: 7999,
    duration: "month",
    description: "The ultimate package for maximum transformation.",
    color: "from-purple-500 to-pink-500",
    glow: "rgba(168, 85, 247, 0.2)",
    features: [
      "Everything in Pro",
      "Dedicated personal trainer",
      "Daily 1-on-1 training sessions",
      "Comprehensive diet plan",
      "Monthly body composition scan",
      "Supplement guidance",
      "Priority class booking",
      "VIP locker room access",
      "Guest passes (5/month)",
      "24/7 trainer WhatsApp support",
    ],
    notIncluded: [],
  },
];

function PlanCard({ plan, index }: { plan: (typeof plans)[0]; index: number }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const Icon = plan.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative glass-card p-8 flex flex-col",
        plan.isPopular && "ring-2 ring-brand-gold/50"
      )}
      style={{
        boxShadow: plan.isPopular
          ? `0 20px 60px ${plan.glow}, 0 0 0 1px rgba(245,166,35,0.2)`
          : undefined,
      }}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-gold to-brand-fire text-dark font-bold text-xs tracking-wide shadow-gold">
            <Zap className="w-3 h-3" />
            Most Popular
          </div>
        </div>
      )}

      {/* Plan Icon + Name */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
            plan.color
          )}
          style={{ boxShadow: `0 8px 24px ${plan.glow}` }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-xl text-white">{plan.name}</h3>
          <p className="text-xs text-white/40">{plan.description}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-2">
          <span className="text-white/30 text-sm line-through">
            ₹{plan.originalPrice.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-heading font-black gold-text">
            ₹{plan.price.toLocaleString("en-IN")}
          </span>
          <span className="text-white/40 text-sm">/{plan.duration}</span>
        </div>
        <div className="mt-2 badge-gold inline-flex">
          Save ₹{(plan.originalPrice - plan.price).toLocaleString("en-IN")}/mo
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <div
              className={cn(
                "w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 mt-0.5",
                plan.color
              )}
            >
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-sm text-white/70">{feature}</span>
          </div>
        ))}
        {plan.notIncluded.map((feature) => (
          <div key={feature} className="flex items-start gap-3 opacity-30">
            <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">✕</span>
            </div>
            <span className="text-sm text-white/50 line-through">{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href={`/auth/register?plan=${plan.id}`}
        className={cn(
          "w-full text-center py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300",
          plan.isPopular
            ? "btn-primary"
            : "btn-ghost"
        )}
      >
        Get Started with {plan.name}
      </Link>
    </motion.div>
  );
}

export function MembershipSection() {
  const [titleRef, titleInView] = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section
      id="membership"
      className="section-spacing relative"
      aria-labelledby="membership-heading"
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245, 166, 35, 0.05) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="page-container">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="section-tag mb-4 inline-flex">
              <Crown className="w-3.5 h-3.5" />
              Membership Plans
            </span>
          </motion.div>

          <motion.h2
            id="membership-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-title text-4xl md:text-5xl lg:text-6xl mb-6"
          >
            Choose Your{" "}
            <span className="gold-text">Power Level</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/50 max-w-2xl mx-auto mb-4"
          >
            All plans include gym access, locker facility, and our mobile app.
            No hidden fees. Cancel anytime.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm text-brand-gold font-medium"
          >
            🎉 Limited offer — Save up to 38% this month only
          </motion.p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={titleInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-white/30 mt-8"
        >
          All prices include GST. Annual plans available at 2 months free.{" "}
          <Link href="#contact" className="text-brand-gold hover:underline">
            Contact us
          </Link>{" "}
          for corporate memberships.
        </motion.p>
      </div>
    </section>
  );
}
