"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dumbbell,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  ArrowRight,
  Heart,
} from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", href: "#about" },
    { label: "Our Trainers", href: "#trainers" },
    { label: "Gallery", href: "#gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
  membership: [
    { label: "Starter Plan", href: "#membership" },
    { label: "Pro Plan", href: "#membership" },
    { label: "Elite Plan", href: "#membership" },
    { label: "Corporate Plans", href: "#contact" },
    { label: "Student Discount", href: "#contact" },
  ],
  features: [
    { label: "Personal Training", href: "#services" },
    { label: "Group Classes", href: "#classes" },
    { label: "Diet Planning", href: "#services" },
    { label: "Online Coaching", href: "#services" },
    { label: "Progress Tracking", href: "/dashboard/member" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socials = [
  { icon: Instagram, href: "https://instagram.com/fitforgepro", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com/@fitforgepro", label: "YouTube" },
  { icon: Twitter, href: "https://twitter.com/fitforgepro", label: "Twitter" },
  { icon: Facebook, href: "https://facebook.com/fitforgepro", label: "Facebook" },
];

const hours = [
  { days: "Monday – Friday", time: "5:00 AM – 11:00 PM" },
  { days: "Saturday – Sunday", time: "6:00 AM – 10:00 PM" },
  { days: "Public Holidays", time: "6:00 AM – 9:00 PM" },
];

export function Footer() {
  return (
    <footer className="relative bg-dark-50 border-t border-white/5" role="contentinfo">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dot opacity-10 pointer-events-none" aria-hidden="true" />

      {/* Newsletter Section */}
      <div className="relative border-b border-white/5">
        <div className="page-container py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-heading font-bold text-2xl text-white mb-2">
                Start Your Fitness Journey Today
              </h3>
              <p className="text-white/50">
                Get a free trial pass + exclusive member discounts.
              </p>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-base flex-1 lg:w-64"
                aria-label="Email address for newsletter"
              />
              <button className="btn-primary flex-shrink-0">
                Get Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="FitForge Pro">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-dark" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-heading font-black text-xl gold-text block leading-none">
                  FitForge Pro
                </span>
                <span className="text-[9px] tracking-[0.3em] text-white/30 uppercase">
                  Premium Fitness
                </span>
              </div>
            </Link>

            <p className="text-sm text-white/40 leading-relaxed">
              India&apos;s most premium gym and fitness platform. Expert trainers,
              cutting-edge equipment, and a community that drives real results.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-sm text-white/40 hover:text-white/70 transition-colors duration-200 group"
              >
                <MapPin className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                <span>123 Fitness Boulevard, Bandra West, Mumbai 400050</span>
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-3 text-sm text-white/40 hover:text-white/70 transition-colors duration-200"
              >
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                +91 98765 43210
              </a>
              <a
                href="mailto:info@fitforgepro.in"
                className="flex items-center gap-3 text-sm text-white/40 hover:text-white/70 transition-colors duration-200"
              >
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                info@fitforgepro.in
              </a>
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-white/30 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Gym Hours
              </div>
              {hours.map((h) => (
                <div key={h.days} className="flex justify-between text-xs text-white/40">
                  <span>{h.days}</span>
                  <span className="text-white/60">{h.time}</span>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-brand-gold hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/30">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/30">Membership</h4>
            <ul className="space-y-3">
              {footerLinks.membership.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/30">Services</h4>
            <ul className="space-y-3">
              {footerLinks.features.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/30">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/5">
        <div className="page-container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} FitForge Pro. All rights reserved.
          </p>
          <p className="text-xs text-white/20 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-0.5" /> in India
          </p>
          <div className="flex items-center gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
              alt="Razorpay"
              className="h-5 opacity-30 hover:opacity-60 transition-opacity"
            />
            <div className="text-xs text-white/20">Secured Payments</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
