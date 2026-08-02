"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What are your gym timings?",
    answer:
      "We are open Monday to Friday from 5:00 AM to 11:00 PM, and Saturday to Sunday from 6:00 AM to 10:00 PM. The gym operates 365 days a year, including public holidays.",
  },
  {
    question: "Can I freeze my membership?",
    answer:
      "Yes! Pro and Elite members can freeze their membership for up to 15 days per year. This is useful if you're traveling or recovering from an illness. Simply visit your member dashboard and select 'Freeze Membership'.",
  },
  {
    question: "Is there a trial period before I commit?",
    answer:
      "We offer a free 3-day trial pass so you can experience the facility, equipment, and atmosphere before making a decision. Visit our reception with a valid photo ID to claim your trial.",
  },
  {
    question: "How do I book a personal trainer session?",
    answer:
      "You can book sessions directly from your member dashboard under 'Trainer Booking'. Select your preferred trainer, choose a time slot, and confirm your booking. You'll receive a confirmation email and reminder notification.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, EMI options via Razorpay, and cash at the reception desk. All online payments are secured by Razorpay.",
  },
  {
    question: "Can I bring a guest to the gym?",
    answer:
      "Pro members get 2 guest passes per month, and Elite members get 5 guest passes per month. Guest passes can be used from your dashboard by generating a digital pass for your guest.",
  },
  {
    question: "Do you have separate zones for different workouts?",
    answer:
      "Yes! Our 10,000 sq ft facility is divided into: Cardio Zone, Free Weights Zone, Machine Zone, Functional Training Zone, CrossFit Box, Yoga & Pilates Studio, and a Dedicated Women's Zone.",
  },
  {
    question: "How does QR code check-in work?",
    answer:
      "Each member receives a unique QR code in their dashboard. Simply open the FitForge Pro app or website, navigate to your QR code, and scan it at the entrance kiosk. Your attendance is recorded automatically and you can view it in your dashboard.",
  },
  {
    question: "Can I upgrade or downgrade my membership?",
    answer:
      "Absolutely. You can upgrade your membership at any time from your dashboard. The price difference will be prorated for the remaining days. Downgrading takes effect at the start of the next billing cycle.",
  },
  {
    question: "What happens when my membership expires?",
    answer:
      "You'll receive email and push notifications at 15, 7, and 3 days before expiry. After expiry, access is suspended until renewal. Your data and history are preserved for 6 months, so you can pick up right where you left off.",
  },
];

function FaqItem({
  faq,
  index,
}: {
  faq: (typeof faqs)[0];
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div
        className={cn(
          "border rounded-xl overflow-hidden transition-all duration-300",
          isOpen
            ? "border-brand-gold/30 bg-brand-gold/5"
            : "border-white/8 bg-white/2 hover:border-white/15"
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-4 p-6 text-left"
          aria-expanded={isOpen}
        >
          <span
            className={cn(
              "font-medium transition-colors duration-200",
              isOpen ? "text-brand-gold" : "text-white/80"
            )}
          >
            {faq.question}
          </span>
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200",
              isOpen
                ? "bg-brand-gold text-dark rotate-180"
                : "bg-white/10 text-white/50"
            )}
          >
            {isOpen ? (
              <Minus className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-6 pb-6 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-4">
                {faq.answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function FaqSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section
      id="faq"
      className="section-spacing"
      aria-labelledby="faq-heading"
    >
      <div className="page-container max-w-4xl mx-auto">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="section-tag mb-4 inline-flex">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </span>
          </motion.div>
          <motion.h2
            id="faq-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-title text-4xl md:text-5xl mb-6"
          >
            Got <span className="gold-text">Questions?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/50"
          >
            Everything you need to know about your membership and our facility.
          </motion.p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={faq.question} faq={faq} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center glass-card p-8"
        >
          <p className="text-white/50 mb-4">Still have questions?</p>
          <a href="#contact" className="btn-primary">
            Contact Our Team
          </a>
        </motion.div>
      </div>
    </section>
  );
}
