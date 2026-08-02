"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, Mail, Send, CheckCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  subject: z.string().min(3, "Subject required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  inquiryType: z.enum(["membership", "training", "diet", "corporate", "other"]),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: MapPin,
    label: "Visit Us",
    value: "123 Fitness Blvd, Bandra West, Mumbai 400050",
    link: "https://maps.google.com",
    color: "text-brand-gold",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 98765 43210",
    link: "tel:+919876543210",
    color: "text-green-400",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "info@fitforgepro.in",
    link: "mailto:info@fitforgepro.in",
    color: "text-blue-400",
  },
];

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) throw new Error("Failed to send");

      setSubmitted(true);
      reset();
      toast.success("Message sent! We'll get back to you within 24 hours.");
    } catch {
      toast.error("Failed to send message. Please try again or call us directly.");
    }
  };

  return (
    <section
      id="contact"
      className="section-spacing"
      aria-labelledby="contact-heading"
    >
      <div className="page-container">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="section-tag mb-4 inline-flex">
              <MessageSquare className="w-3.5 h-3.5" />
              Get in Touch
            </span>
          </motion.div>
          <motion.h2
            id="contact-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-title text-4xl md:text-5xl mb-6"
          >
            We&apos;d Love to{" "}
            <span className="gold-text">Hear From You</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              {contactInfo.map((info, i) => {
                const Icon = info.icon;
                return (
                  <motion.a
                    key={info.label}
                    href={info.link}
                    target={info.link.startsWith("http") ? "_blank" : undefined}
                    rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 glass-card p-5 hover:border-brand-gold/20 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                      <Icon className={cn("w-5 h-5", info.color)} />
                    </div>
                    <div>
                      <p className="text-xs text-white/30 font-medium mb-1">{info.label}</p>
                      <p className="text-sm text-white/80 group-hover:text-white transition-colors">
                        {info.value}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Map Embed */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
              className="glass-card overflow-hidden rounded-2xl"
              style={{ height: "240px" }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.7987!2d72.8258!3d19.0596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAzJzM0LjYiTiA3MsKwNDknMzIuOSJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FitForge Pro Location"
                aria-label="Google Maps showing FitForge Pro gym location"
              />
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="glass-card p-8"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-white/50 mb-6">
                    Thank you for reaching out. We&apos;ll get back to you within 24
                    hours.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn-ghost">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                  aria-label="Contact form"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="text-xs text-white/50 font-medium mb-2 block"
                      >
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        {...register("name")}
                        type="text"
                        placeholder="John Doe"
                        className="input-base"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-red-400 text-xs mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="text-xs text-white/50 font-medium mb-2 block"
                      >
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        {...register("email")}
                        type="email"
                        placeholder="john@example.com"
                        className="input-base"
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="text-xs text-white/50 font-medium mb-2 block"
                      >
                        Phone Number *
                      </label>
                      <input
                        id="contact-phone"
                        {...register("phone")}
                        type="tel"
                        placeholder="9876543210"
                        className="input-base"
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="contact-inquiry"
                        className="text-xs text-white/50 font-medium mb-2 block"
                      >
                        Inquiry Type *
                      </label>
                      <select
                        id="contact-inquiry"
                        {...register("inquiryType")}
                        className="input-base"
                      >
                        <option value="membership">Membership</option>
                        <option value="training">Personal Training</option>
                        <option value="diet">Diet Planning</option>
                        <option value="corporate">Corporate Plan</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="text-xs text-white/50 font-medium mb-2 block"
                    >
                      Subject *
                    </label>
                    <input
                      id="contact-subject"
                      {...register("subject")}
                      type="text"
                      placeholder="How can we help?"
                      className="input-base"
                      aria-invalid={!!errors.subject}
                    />
                    {errors.subject && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="text-xs text-white/50 font-medium mb-2 block"
                    >
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      {...register("message")}
                      rows={5}
                      placeholder="Tell us about your fitness goals and how we can help..."
                      className="input-base resize-none"
                      aria-invalid={!!errors.message}
                    />
                    {errors.message && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function cn(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}
